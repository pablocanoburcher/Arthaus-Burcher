/**
 * PHILLIP BURCHER - Art Store Backend Server
 * Payment processing with Stripe and PayPal
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Stripe with your secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_STRIPE_SECRET_KEY');

// PayPal SDK
const paypal = require('@paypal/checkout-server-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Parse JSON for most routes
app.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});

// ==========================================
// PayPal Configuration
// ==========================================

function getPayPalClient() {
    const clientId = process.env.PAYPAL_CLIENT_ID || 'YOUR_PAYPAL_CLIENT_ID';
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'YOUR_PAYPAL_CLIENT_SECRET';

    // Use Sandbox for testing, Live for production
    const environment = process.env.NODE_ENV === 'production'
        ? new paypal.core.LiveEnvironment(clientId, clientSecret)
        : new paypal.core.SandboxEnvironment(clientId, clientSecret);

    return new paypal.core.PayPalHttpClient(environment);
}

// ==========================================
// Product Data (In production, use a database)
// ==========================================

const products = {
    1: { id: 1, title: "Blond", artist: "Frank Ocean", price: 4500 }, // Price in cents
    2: { id: 2, title: "Mr. Morale", artist: "Kendrick Lamar", price: 4800 },
    3: { id: 3, title: "The World Is So Small", artist: "Mac Miller", price: 4200 },
    4: { id: 4, title: "Music.", artist: "Various", price: 3800 },
    5: { id: 5, title: "Do More With Less", artist: "Steve Lacy", price: 4500 }
};

const SHIPPING_COST = 800; // $8.00 in cents

// ==========================================
// Utility Functions
// ==========================================

function calculateOrderAmount(items) {
    let total = 0;
    for (const item of items) {
        const product = products[item.id];
        if (product) {
            total += product.price * (item.quantity || 1);
        }
    }
    return total + SHIPPING_COST;
}

function validateCartItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return { valid: false, error: 'Cart is empty' };
    }

    for (const item of items) {
        if (!products[item.id]) {
            return { valid: false, error: `Invalid product ID: ${item.id}` };
        }
        if (!item.quantity || item.quantity < 1) {
            return { valid: false, error: 'Invalid quantity' };
        }
    }

    return { valid: true };
}

// ==========================================
// Stripe Endpoints
// ==========================================

// Create a Payment Intent for card payments
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { items, shipping, email } = req.body;

        // Validate cart items
        const validation = validateCartItems(items);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        const amount = calculateOrderAmount(items);

        // Create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                items: JSON.stringify(items.map(i => ({ id: i.id, qty: i.quantity }))),
                customer_email: email
            },
            receipt_email: email,
            shipping: shipping ? {
                name: shipping.name,
                address: {
                    line1: shipping.address,
                    line2: shipping.address2 || '',
                    city: shipping.city,
                    state: shipping.state,
                    postal_code: shipping.zip,
                    country: shipping.country || 'US'
                }
            } : undefined
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            amount: amount
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create Payment Intent for Apple Pay / Google Pay (Payment Request API)
app.post('/create-payment-request-intent', async (req, res) => {
    try {
        const { items } = req.body;

        const validation = validateCartItems(items);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        const amount = calculateOrderAmount(items);

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                items: JSON.stringify(items.map(i => ({ id: i.id, qty: i.quantity })))
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            amount: amount
        });
    } catch (error) {
        console.error('Error creating payment request intent:', error);
        res.status(500).json({ error: error.message });
    }
});

// Stripe Webhook - Handle successful payments
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            // Fulfill the order - send confirmation email, update inventory, etc.
            await fulfillOrder(paymentIntent);
            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            // Notify the customer
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

async function fulfillOrder(paymentIntent) {
    // In production:
    // 1. Save order to database
    // 2. Send confirmation email
    // 3. Update inventory
    // 4. Trigger shipping workflow
    console.log('Fulfilling order for payment:', paymentIntent.id);
    console.log('Items:', paymentIntent.metadata.items);
    console.log('Email:', paymentIntent.receipt_email || paymentIntent.metadata.customer_email);
}

// ==========================================
// PayPal Endpoints
// ==========================================

// Create PayPal Order
app.post('/paypal/create-order', async (req, res) => {
    try {
        const { items, shipping } = req.body;

        const validation = validateCartItems(items);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        const amount = calculateOrderAmount(items);
        const amountInDollars = (amount / 100).toFixed(2);

        const client = getPayPalClient();
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: amountInDollars,
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: ((amount - SHIPPING_COST) / 100).toFixed(2)
                        },
                        shipping: {
                            currency_code: 'USD',
                            value: (SHIPPING_COST / 100).toFixed(2)
                        }
                    }
                },
                items: items.map(item => {
                    const product = products[item.id];
                    return {
                        name: `${product.title} by ${product.artist}`,
                        unit_amount: {
                            currency_code: 'USD',
                            value: (product.price / 100).toFixed(2)
                        },
                        quantity: String(item.quantity)
                    };
                }),
                description: 'Phillip Burcher Art Prints'
            }],
            application_context: {
                brand_name: 'Phillip Burcher',
                shipping_preference: shipping ? 'SET_PROVIDED_ADDRESS' : 'GET_FROM_FILE'
            }
        });

        const order = await client.execute(request);
        res.json({ orderId: order.result.id });
    } catch (error) {
        console.error('Error creating PayPal order:', error);
        res.status(500).json({ error: error.message });
    }
});

// Capture PayPal Order (called after customer approves)
app.post('/paypal/capture-order', async (req, res) => {
    try {
        const { orderId } = req.body;

        const client = getPayPalClient();
        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});

        const capture = await client.execute(request);

        // Check if capture was successful
        if (capture.result.status === 'COMPLETED') {
            console.log('PayPal payment captured:', orderId);
            // Fulfill the order
            await fulfillPayPalOrder(capture.result);
        }

        res.json({
            status: capture.result.status,
            orderId: capture.result.id
        });
    } catch (error) {
        console.error('Error capturing PayPal order:', error);
        res.status(500).json({ error: error.message });
    }
});

async function fulfillPayPalOrder(order) {
    // In production:
    // 1. Save order to database
    // 2. Send confirmation email
    // 3. Update inventory
    // 4. Trigger shipping workflow
    console.log('Fulfilling PayPal order:', order.id);
    const payer = order.payer;
    console.log('Payer:', payer.email_address, payer.name.given_name, payer.name.surname);
}

// ==========================================
// Order Endpoints
// ==========================================

// Calculate order total (for frontend display)
app.post('/calculate-total', (req, res) => {
    try {
        const { items } = req.body;

        const validation = validateCartItems(items);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        const subtotal = calculateOrderAmount(items) - SHIPPING_COST;
        const total = subtotal + SHIPPING_COST;

        res.json({
            subtotal: subtotal / 100,
            shipping: SHIPPING_COST / 100,
            total: total / 100
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// Serve Frontend
// ==========================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ==========================================
// Start Server
// ==========================================

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('');
    console.log('Environment variables needed:');
    console.log('  STRIPE_SECRET_KEY - Your Stripe secret key');
    console.log('  STRIPE_WEBHOOK_SECRET - Your Stripe webhook signing secret');
    console.log('  PAYPAL_CLIENT_ID - Your PayPal client ID');
    console.log('  PAYPAL_CLIENT_SECRET - Your PayPal client secret');
});
