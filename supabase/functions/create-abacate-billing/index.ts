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

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const log = async (level: string, message: string, data?: any) => {
        try {
            await supabase.from("debug_logs").insert({ level, message, data });
        } catch (e) {
            console.error("Log failed:", e.message);
        }
    };

    try {
        const body = await req.json();
        const { amount, appointmentId, successUrl, customer } = body;

        await log("INFO", "New Billing Request", { appointmentId, amount, customer });

        if (!amount || !appointmentId || !customer) {
            throw new Error(`Missing required parameters: amount=${amount}, appointmentId=${appointmentId}, customer=${!!customer}`);
        }

        const ABACATE_PAY_TOKEN = Deno.env.get("ABACATE_PAY_TOKEN");

        if (!ABACATE_PAY_TOKEN) {
            await log("ERROR", "ABACATE_PAY_TOKEN not configured");
            throw new Error("ABACATE_PAY_TOKEN not configured in Supabase Secrets");
        }

        // 1. Fetch appointment details (simple query)
        const { data: appointment, error: apptError } = await supabase
            .from("appointments")
            .select("service_id")
            .eq("id", appointmentId)
            .maybeSingle();

        if (apptError || !appointment) {
            await log("ERROR", "Appointment fetch failed", { appointmentId, apptError });
            throw new Error(`Database error fetching appointment: ${apptError?.message || "Not found"}`);
        }

        // 2. Fetch service details (separate simple query)
        const { data: service } = await supabase
            .from("services")
            .select("name")
            .eq("id", appointment.service_id)
            .maybeSingle();

        const productName = service?.name || "Agendamento - Camilla Gazeta";
        const amountInCents = Math.round(amount * 100);

        // Sanitize CPF and Phone (digits only)
        const sanitize = (str: string) => str.replace(/\D/g, "");

        const payload = {
            frequency: "ONE_TIME",
            amount: amountInCents,
            methods: ["PIX"],
            customer: {
                name: customer.name,
                cellphone: sanitize(customer.cellphone),
                email: customer.email,
                taxId: sanitize(customer.taxId || "00000000000")
            },
            products: [
                {
                    externalId: appointmentId,
                    name: productName.substring(0, 37),
                    quantity: 1
                }
            ],
            returnUrl: successUrl,
            completionUrl: successUrl
        };

        await log("INFO", "Payload to AbacatePay (Billing)", payload);

        const authHeader = ABACATE_PAY_TOKEN.startsWith("Bearer ") ? ABACATE_PAY_TOKEN : `Bearer ${ABACATE_PAY_TOKEN}`;

        const response = await fetch("https://api.abacatepay.com/v1/billing/create", {
            method: "POST",
            headers: {
                "Authorization": authHeader,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const abacateData = await response.json();

        if (!response.ok) {
            await log("ERROR", "AbacatePay Billing Error", { status: response.status, body: abacateData });
            const errorMsg = abacateData.error || abacateData.message || JSON.stringify(abacateData);
            throw new Error(`AbacatePay: ${errorMsg}`);
        }

        await log("SUCCESS", "AbacatePay Billing Created", abacateData);

        const checkoutUrl = abacateData.data?.url;
        if (!checkoutUrl) {
            await log("ERROR", "URL not found in billing response", abacateData);
            throw new Error("AbacatePay: URL de checkout não encontrada");
        }

        return new Response(JSON.stringify({
            url: checkoutUrl,
            billingId: abacateData.data?.id
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        await log("ERROR", "Edge Function Internal Error", { error: error.message });
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
