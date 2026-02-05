 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/api/paypal/capture-order.js b/api/paypal/capture-order.js
index bd923bac519a473c06c4b849427416216ba42fc3..23faa8f480e1e0bb81f89d8263ce5fc1db0de46d 100644
--- a/api/paypal/capture-order.js
+++ b/api/paypal/capture-order.js
@@ -1,68 +1,84 @@
 /**
  * Vercel Serverless Function: Capture PayPal Order
  */
 
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
         const { orderId } = req.body;
 
         if (!orderId) {
             return res.status(400).json({ error: 'Order ID is required' });
         }
 
-        const accessToken = await getPayPalAccessToken();
+        const { accessToken, baseUrl } = await getPayPalAccessToken();
 
-        const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
+        const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
             method: 'POST',
             headers: {
                 'Authorization': `Bearer ${accessToken}`,
                 'Content-Type': 'application/json'
             }
         });
 
         const capture = await response.json();
 
-        if (capture.status === 'COMPLETED') {
+        if (response.ok && capture.status === 'COMPLETED') {
             console.log('PayPal payment captured:', orderId);
             res.status(200).json({
                 status: capture.status,
                 orderId: capture.id
             });
         } else {
             throw new Error(capture.message || 'Payment capture failed');
         }
     } catch (error) {
         console.error('Error capturing PayPal order:', error);
         res.status(500).json({ error: error.message });
     }
 };
 
EOF
)
