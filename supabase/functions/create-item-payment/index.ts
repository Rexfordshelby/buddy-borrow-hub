import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requestId, amount, currency = "usd" } = await req.json();
    
    if (!requestId || !amount) {
      throw new Error("Missing required fields: requestId and amount");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    console.log("Getting request details for ID:", requestId);
    
    // Get borrow request details
    const { data: request, error: requestError } = await supabaseClient
      .from("borrow_requests")
      .select("*")
      .eq("id", requestId)
      .maybeSingle();

    console.log("Request query result:", { request, requestError });

    if (requestError) {
      throw new Error(`Request error: ${requestError.message}`);
    }

    if (!request) {
      throw new Error("Borrow request not found");
    }

    // Get item details
    const { data: item, error: itemError } = await supabaseClient
      .from("items")
      .select("title, owner_id, price_per_day")
      .eq("id", request.item_id)
      .maybeSingle();

    if (itemError || !item) {
      throw new Error(`Item not found: ${itemError?.message}`);
    }

    // Get borrower and lender profiles
    const { data: borrowerProfile, error: borrowerError } = await supabaseClient
      .from("profiles")
      .select("full_name")
      .eq("id", request.borrower_id)
      .maybeSingle();

    const { data: lenderProfile, error: lenderError } = await supabaseClient
      .from("profiles")
      .select("full_name")
      .eq("id", request.lender_id)
      .maybeSingle();

    // Combine all data
    const requestWithDetails = {
      ...request,
      items: item,
      borrower: borrowerProfile || { full_name: 'Unknown User' },
      lender: lenderProfile || { full_name: 'Unknown User' }
    };

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const daysDuration = Math.ceil(
      (new Date(requestWithDetails.end_date).getTime() - new Date(requestWithDetails.start_date).getTime()) / 
      (1000 * 60 * 60 * 24)
    );

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Rental: ${requestWithDetails.items.title}`,
              description: `${daysDuration} days from ${requestWithDetails.start_date} to ${requestWithDetails.end_date}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}&request_id=${requestId}`,
      cancel_url: `${req.headers.get("origin")}/dashboard`,
      metadata: {
        request_id: requestId,
        borrower_id: requestWithDetails.borrower_id,
        lender_id: requestWithDetails.lender_id,
        item_id: requestWithDetails.item_id,
      },
    });

    // Update request with payment session
    const { error: updateError } = await supabaseClient
      .from("borrow_requests")
      .update({ 
        payment_session_id: session.id,
        payment_status: "pending"
      })
      .eq("id", requestId);

    if (updateError) {
      throw new Error(`Failed to update request: ${updateError.message}`);
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error creating payment session:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Internal server error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});