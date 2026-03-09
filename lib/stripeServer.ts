import { Service } from '../types';

// Stripe MCP Server-Side Functions
// These functions should be called from a server environment where MCP tools are available

interface StripeProductResponse {
    productId: string;
    priceFullId: string;
    priceDepositId: string;
}

/**
 * Create a Stripe product with full and deposit prices
 * This should be called from a server endpoint with access to MCP Stripe tools
 */
export async function createStripeProduct(service: Service): Promise<StripeProductResponse | null> {
    try {
        const response = await fetch('/api/stripe/create-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: service.name,
                description: service.description,
                price: service.price
            })
        });

        if (!response.ok) throw new Error('Failed to create Stripe product');

        return await response.json();
    } catch (error) {
        console.error('Error creating Stripe product:', error);
        return null;
    }
}

/**
 * Update a Stripe product
 */
export async function updateStripeProduct(
    stripeProductId: string,
    service: Service
): Promise<boolean> {
    try {
        const response = await fetch('/api/stripe/update-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: stripeProductId,
                name: service.name,
                description: service.description,
                price: service.price
            })
        });

        return response.ok;
    } catch (error) {
        console.error('Error updating Stripe product:', error);
        return false;
    }
}

/**
 * Create a payment link
 */
export async function createPaymentLink(
    priceId: string,
    appointmentId: string
): Promise<string | null> {
    try {
        const response = await fetch('/api/stripe/create-payment-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                priceId,
                appointmentId,
                successUrl: `${window.location.origin}/booking-success`,
                cancelUrl: `${window.location.origin}/booking-cancelled`
            })
        });

        if (!response.ok) throw new Error('Failed to create payment link');

        const { url } = await response.json();
        return url;
    } catch (error) {
        console.error('Error creating payment link:', error);
        return null;
    }
}
