const crypto = require('crypto');

// Product data for server-side validation (must match frontend products)
const products = {
    1: { title: "Blond", priceCOP: 180000 },
    2: { title: "Mr. Morale", priceCOP: 192000 },
    3: { title: "The World Is So Small", priceCOP: 168000 },
    4: { title: "Music.", priceCOP: 152000 },
    5: { title: "Do More With Less", priceCOP: 180000 }
};

const SHIPPING_COP = 32000;

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { reference, amountInCents, currency, cart } = req.body;

        // Validate required fields
        if (!reference || !amountInCents || !currency) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate amount against cart if provided
        if (cart && Array.isArray(cart)) {
            let calculatedTotal = 0;
            for (const item of cart) {
                const product = products[item.productId];
                if (!product) {
                    return res.status(400).json({ error: `Invalid product ID: ${item.productId}` });
                }
                calculatedTotal += product.priceCOP * item.quantity;
            }
            // Add shipping
            calculatedTotal += SHIPPING_COP;
            // Convert to cents
            const calculatedCents = calculatedTotal * 100;

            // Allow small tolerance for rounding
            if (Math.abs(calculatedCents - amountInCents) > 100) {
                return res.status(400).json({
                    error: 'Amount mismatch',
                    expected: calculatedCents,
                    received: amountInCents
                });
            }
        }

        // Get integrity secret from environment
        const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;

        if (!integritySecret) {
            console.error('WOMPI_INTEGRITY_SECRET not configured');
            return res.status(500).json({ error: 'Payment configuration error' });
        }

        // Generate integrity signature
        // Format: reference + amountInCents + currency + integritySecret
        const dataToSign = `${reference}${amountInCents}${currency}${integritySecret}`;
        const signature = crypto.createHash('sha256').update(dataToSign).digest('hex');

        return res.status(200).json({
            success: true,
            signature: signature,
            reference: reference
        });

    } catch (error) {
        console.error('Wompi signature error:', error);
        return res.status(500).json({ error: 'Failed to generate signature' });
    }
};
