 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/api/wompi/get-signature.js b/api/wompi/get-signature.js
index d0cc806cc39b978e4a95fd5d071a2daed78df6a3..601336ab8c70c598095616e70c244eec50e069f0 100644
--- a/api/wompi/get-signature.js
+++ b/api/wompi/get-signature.js
@@ -1,35 +1,34 @@
 const crypto = require('crypto');
 
 // Product data for server-side validation
 const products = {
     1: { title: "Blond", priceCOP: 180000 },
-    2: { title: "Igor", priceCOP: 180000 },
-    3: { title: "In Rainbows", priceCOP: 180000 },
-    4: { title: "Channel Orange", priceCOP: 180000 },
-    5: { title: "currents", priceCOP: 180000 },
-    6: { title: "Awaken, My Love!", priceCOP: 180000 }
+    2: { title: "Mr. Morale", priceCOP: 192000 },
+    3: { title: "The World Is So Small", priceCOP: 168000 },
+    4: { title: "Music.", priceCOP: 152000 },
+    5: { title: "Do More With Less", priceCOP: 180000 }
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
 
EOF
)
