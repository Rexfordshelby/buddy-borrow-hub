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
    const { bookingId, amount, currency = "usd" } = await req.json();
    
    if (!bookingId || !amount) {
      throw new Error("Missing required fields: bookingId and amount");
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

    console.log("Getting booking details for ID:", bookingId);
    
    // Get booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from("service_bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    console.log("Booking query result:", { booking, bookingError });

    if (bookingError) {
      throw new Error(`Booking error: ${bookingError.message}`);
    }

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Get service details
    const { data: service, error: serviceError } = await supabaseClient
      .from("services")
      .select("title, provider_id")
      .eq("id", booking.service_id)
      .maybeSingle();

    if (serviceError || !service) {
      throw new Error(`Service not found: ${serviceError?.message}`);
    }

    // Combine booking with service data
    const bookingWithService = {
      ...booking,
      services: service
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

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Service: ${bookingWithService.services.title}`,
              description: `Booking for ${bookingWithService.booking_date} at ${bookingWithService.start_time}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${req.headers.get("origin")}/dashboard`,
      metadata: {
        booking_id: bookingId,
        provider_id: bookingWithService.services.provider_id,
        customer_id: bookingWithService.customer_id,
      },
    });

    // Update booking with payment session
    const { error: updateError } = await supabaseClient
      .from("service_bookings")
      .update({ 
        payment_session_id: session.id,
        payment_status: "pending"
      })
      .eq("id", bookingId);

    if (updateError) {
      throw new Error(`Failed to update booking: ${updateError.message}`);
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