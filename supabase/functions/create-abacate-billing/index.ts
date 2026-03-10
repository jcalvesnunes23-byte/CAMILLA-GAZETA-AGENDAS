import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const { amount, appointmentId, successUrl, customer } = body;

        console.log("--- New Billing Request ---", appointmentId);

        if (!amount || !appointmentId || !customer) {
            throw new Error(`Missing required parameters: amount=${amount}, appointmentId=${appointmentId}, customer=${!!customer}`);
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
        const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
        const ABACATE_PAY_TOKEN = Deno.env.get("ABACATE_PAY_TOKEN");

        if (!ABACATE_PAY_TOKEN) {
            throw new Error("ABACATE_PAY_TOKEN not configured in Supabase Secrets");
        }

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // 1. Fetch appointment details (simple query)
        const { data: appointment, error: apptError } = await supabase
            .from("appointments")
            .select("service_id")
            .eq("id", appointmentId)
            .maybeSingle();

        if (apptError) {
            console.error("Supabase appt error:", apptError.message);
            throw new Error(`Database error fetching appointment: ${apptError.message}`);
        }

        if (!appointment) {
            console.error("No appointment found for ID:", appointmentId);
            throw new Error("Agendamento não encontrado no banco de dados.");
        }

        // 2. Fetch service details (separate simple query)
        const { data: service, error: svcError } = await supabase
            .from("services")
            .select("name")
            .eq("id", appointment.service_id)
            .maybeSingle();

        if (svcError) {
            console.warn("Service fetch error:", svcError.message);
        }

        // 3. Fetch Product Mapping
        const { data: productMapping } = await supabase
            .from("abacate_products")
            .select("external_id")
            .eq("service_id", appointment.service_id)
            .maybeSingle();

        const externalProductId = productMapping?.external_id || appointmentId;
        const productName = service?.name || "Agendamento - Camilla Gazeta";

        console.log("Processing Billing:", productName, "| ID:", externalProductId);

        const amountInCents = Math.round(amount * 100);

        const payload = {
            frequency: "ONE_TIME",
            amount: amountInCents,
            methods: ["PIX"],
            customer: {
                name: customer.name,
                cellphone: customer.cellphone,
                email: customer.email,
                taxId: customer.taxId || ""
            },
            products: [
                {
                    externalId: externalProductId,
                    name: productName,
                    quantity: 1
                }
            ],
            returnUrl: successUrl,
            completionUrl: successUrl,
            externalId: appointmentId,
        };

        const response = await fetch("https://api.abacatepay.com/v1/billing/create", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${ABACATE_PAY_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const abacateData = await response.json();

        if (!response.ok) {
            console.error("AbacatePay API Error:", JSON.stringify(abacateData, null, 2));
            throw new Error(abacateData.message || `Erro no AbacatePay (${response.status})`);
        }

        const checkoutUrl = abacateData.data?.url;
        if (!checkoutUrl) {
            throw new Error("AbacatePay não retornou URL de checkout");
        }

        return new Response(JSON.stringify({
            url: checkoutUrl,
            billingId: abacateData.data.id
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("❌ Edge Function Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
