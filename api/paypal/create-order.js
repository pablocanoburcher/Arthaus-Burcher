 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/api/paypal/create-order.js b/api/paypal/create-order.js
index 82075e5a1527ec2f779dc4ab3cc9da101bb78ca4..c45fd424fd1b5e4076d5914936fe9fc9589687db 100644
--- a/api/paypal/create-order.js
+++ b/api/paypal/create-order.js
@@ -14,123 +14,139 @@ const SHIPPING_COST = 800;
 
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
     }
     return { valid: true };
 }
 
 async function getPayPalAccessToken() {
+    const clientId = process.env.PAYPAL_CLIENT_ID;
+    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
+    const environment = (process.env.PAYPAL_ENV || 'sandbox').toLowerCase();
+    const baseUrl = environment === 'live'
+        ? 'https://api-m.paypal.com'
+        : 'https://api-m.sandbox.paypal.com';
+
+    if (!clientId || !clientSecret) {
+        throw new Error('PayPal credentials are not configured');
+    }
+
     const auth = Buffer.from(
-        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
+        `${clientId}:${clientSecret}`
     ).toString('base64');
 
-    const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
+    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
         method: 'POST',
         headers: {
             'Authorization': `Basic ${auth}`,
             'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: 'grant_type=client_credentials'
     });
 
     const data = await response.json();
-    return data.access_token;
+    if (!response.ok || !data.access_token) {
+        const details = data.error_description || data.message || 'Failed to authenticate with PayPal';
+        throw new Error(details);
+    }
+
+    return { accessToken: data.access_token, baseUrl };
 }
 
 module.exports = async (req, res) => {
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
         const { items, shipping } = req.body;
 
         const validation = validateCartItems(items);
         if (!validation.valid) {
             return res.status(400).json({ error: validation.error });
         }
 
         const amount = calculateOrderAmount(items);
         const amountInDollars = (amount / 100).toFixed(2);
 
-        const accessToken = await getPayPalAccessToken();
+        const { accessToken, baseUrl } = await getPayPalAccessToken();
 
-        const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
+        const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
             method: 'POST',
             headers: {
                 'Authorization': `Bearer ${accessToken}`,
                 'Content-Type': 'application/json'
             },
             body: JSON.stringify({
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
                             quantity: String(item.quantity || 1)
                         };
                     }),
                     description: 'ARTHAUS Art Prints'
                 }],
                 application_context: {
                     brand_name: 'ARTHAUS',
                     shipping_preference: 'NO_SHIPPING'
                 }
             })
         });
 
         const order = await response.json();
 
-        if (order.id) {
+        if (response.ok && order.id) {
             res.status(200).json({ orderId: order.id });
         } else {
             throw new Error(order.message || 'Failed to create PayPal order');
         }
     } catch (error) {
         console.error('Error creating PayPal order:', error);
         res.status(500).json({ error: error.message });
     }
 };
 
EOF
)
