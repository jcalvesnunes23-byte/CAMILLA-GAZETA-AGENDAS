import { supabase } from './supabaseClient';

// Stripe MCP Integration Helper
// This file provides utilities to interact with Stripe via MCP tools

export interface StripeProduct {
    service_id: string;
    stripe_product_id: string;
    stripe_price_full_id: string;
    stripe_price_deposit_id: string;
}

/**
 * Get Stripe product mapping for a service
 */
export async function getStripeProduct(serviceId: string): Promise<StripeProduct | null> {
    const { data, error } = await supabase
        .from('stripe_products')
        .select('*')
        .eq('service_id', serviceId)
        .single();

    if (error || !data) return null;
    return data as StripeProduct;
}

/**
 * Create a Stripe product and prices for a service
 * Note: This requires MCP Stripe tools to be available
 */
export async function createStripeProductForService(
    serviceName: string,
    serviceDescription: string,
    priceInReais: number,
    serviceId: string
): Promise<StripeProduct | null> {
    try {
        // Convert price to cents
        const priceInCents = Math.round(priceInReais * 100);
        const depositInCents = Math.round(priceInCents * 0.2);

        // Note: In production, these MCP calls would be made server-side
        // For now, we'll store placeholder IDs and update them manually
        // or use a server endpoint that calls MCP tools

        console.log('Creating Stripe product:', {
            name: serviceName,
            description: serviceDescription,
            fullPrice: priceInCents,
            depositPrice: depositInCents
        });

        // TODO: Call MCP Stripe tools via server endpoint
        // For now, return null to indicate manual setup needed
        return null;
    } catch (error) {
        console.error('Error creating Stripe product:', error);
        return null;
    }
}

/**
 * Update Stripe product and prices for a service
 */
export async function updateStripeProductForService(
    stripeProductId: string,
    serviceName: string,
    serviceDescription: string,
    priceInReais: number
): Promise<boolean> {
    try {
        const priceInCents = Math.round(priceInReais * 100);
        const depositInCents = Math.round(priceInCents * 0.2);

        console.log('Updating Stripe product:', {
            productId: stripeProductId,
            name: serviceName,
            description: serviceDescription,
            fullPrice: priceInCents,
            depositPrice: depositInCents
        });

        // TODO: Call MCP Stripe tools via server endpoint
        return true;
    } catch (error) {
        console.error('Error updating Stripe product:', error);
        return false;
    }
}

/**
 * Create a payment link for a booking
 */
export async function createPaymentLink(
    serviceId: string,
    paymentOption: 'full' | 'deposit',
    appointmentId: string,
    successUrl: string,
    cancelUrl: string
): Promise<string | null> {
    try {
        // Get Stripe product mapping
        const stripeProduct = await getStripeProduct(serviceId);
        if (!stripeProduct) {
            throw new Error('Stripe product not found for service');
        }

        const priceId = paymentOption === 'full'
            ? stripeProduct.stripe_price_full_id
            : stripeProduct.stripe_price_deposit_id;

        console.log('Creating payment link:', {
            priceId,
            appointmentId,
            paymentOption
        });

        // TODO: Call MCP Stripe create_payment_link via server endpoint
        // For now, return a placeholder
        return `https://buy.stripe.com/test_placeholder_${appointmentId}`;
    } catch (error) {
        console.error('Error creating payment link:', error);
        return null;
    }
}

/**
 * Check payment status for an appointment
 */
export async function checkPaymentStatus(appointmentId: string): Promise<string> {
    const { data, error } = await supabase
        .from('appointments')
        .select('payment_status')
        .eq('id', appointmentId)
        .single();

    if (error || !data) return 'pending';
    return data.payment_status || 'pending';
}
