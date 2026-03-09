import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@11.1.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { priceId, appointmentId, successUrl, cancelUrl } = await req.json();

        if (!priceId || !appointmentId) {
            throw new Error("Missing required parameters: priceId or appointmentId");
        }

        // Create a payment link
        const paymentLink = await stripe.paymentLinks.create({
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            metadata: {
                appointment_id: appointmentId,
            },
            after_completion: {
                type: "redirect",
                redirect: {
                    url: successUrl,
                },
            },
            // Note: paymentLinks don't have a direct cancel_url like Checkout Sessions,
            // but they are reusable. The user can just go back.
        });

        console.log(`✅ Payment link created for appointment ${appointmentId}: ${paymentLink.url}`);

        return new Response(JSON.stringify({ url: paymentLink.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error(`❌ Error creating payment link: ${error.message}`);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
