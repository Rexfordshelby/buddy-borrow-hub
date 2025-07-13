
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { user_id, amount, is_earning } = await req.json();

    // Update user wallet
    const { error } = await supabaseClient
      .from('user_wallets')
      .upsert({
        user_id: user_id,
        available_balance: is_earning 
          ? supabaseClient.rpc('increment_balance', { user_id, amount })
          : supabaseClient.rpc('decrement_balance', { user_id, amount }),
        total_earned: is_earning 
          ? supabaseClient.rpc('increment_earned', { user_id, amount })
          : undefined,
        total_spent: !is_earning 
          ? supabaseClient.rpc('increment_spent', { user_id, amount })
          : undefined,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
