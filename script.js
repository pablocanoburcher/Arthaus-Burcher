 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/script.js b/script.js
index 11022f5b8afa3f5d6096cd45e226a99c5caeda56..0a58074e33fb37a1bf7529a7a3019d1a6c789a49 100644
--- a/script.js
+++ b/script.js
@@ -1,38 +1,41 @@
 /**
  * ARTHAUS - Art Store JavaScript
  * Product data, gallery, cart, checkout with payment integrations
  * Payment providers: Wompi (Colombia: Cards, PSE, Nequi, Daviplata) + PayPal (International)
  */
 
 // ==========================================
 // Configuration
 // ==========================================
 
 // API base URL - Vercel serverless functions use /api/ path
 const API_BASE_URL = '';
 
+// PayPal Configuration - Replace with your client ID (sandbox or live)
+const PAYPAL_CLIENT_ID = document.body?.dataset?.paypalClientId || '';
+
 // Wompi Configuration - Replace with your public key
 // Sandbox: pub_test_XXXXXXXX | Production: pub_prod_XXXXXXXX
 const WOMPI_PUBLIC_KEY = 'pub_test_qK2KWQOsW6WSr2IycRPwZcOeif1amNtl';
 
 // Currency: COP for Colombian Pesos
 const WOMPI_CURRENCY = 'COP';
 
 // Language Configuration
 let currentLanguage = localStorage.getItem('arthaus_language') || 'en';
 
 // ==========================================
 // Language Toggle Functions
 // ==========================================
 
 function toggleLanguage() {
     currentLanguage = currentLanguage === 'en' ? 'es' : 'en';
     localStorage.setItem('arthaus_language', currentLanguage);
     applyLanguage();
     updateLanguageButton();
 }
 
 function applyLanguage() {
     // Update all elements with data-en and data-es attributes
     document.querySelectorAll('[data-en][data-es]').forEach(element => {
         const text = element.getAttribute(`data-${currentLanguage}`);
@@ -166,112 +169,141 @@ async function openWompiCheckout() {
         showToast(currentLanguage === 'en' ? 'Please enter shipping information first' : 'Por favor ingresa la información de envío primero');
         return;
     }
 
     if (cart.length === 0) {
         showToast(currentLanguage === 'en' ? 'Your cart is empty' : 'Tu carrito está vacío');
         return;
     }
 
     // Calculate total in COP (cents)
     const subtotalCOP = getCartTotalCOP();
     const totalCOP = subtotalCOP + SHIPPING_COP;
     const amountInCents = totalCOP * 100; // Wompi requires amount in cents
 
     // Generate unique reference
     const reference = `ARTHAUS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
 
     try {
         // Get integrity signature from backend
         const response = await fetch(`${API_BASE_URL}/api/wompi/get-signature`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                 reference: reference,
                 amountInCents: amountInCents,
-                currency: WOMPI_CURRENCY
+                currency: WOMPI_CURRENCY,
+                cart: cart.map(item => ({ productId: item.id, quantity: item.quantity }))
             })
         });
 
         const data = await response.json();
 
         if (data.error) {
             throw new Error(data.error);
         }
 
         // Open Wompi Widget
         const checkout = new WidgetCheckout({
             currency: WOMPI_CURRENCY,
             amountInCents: amountInCents,
             reference: reference,
             publicKey: WOMPI_PUBLIC_KEY,
             signature: { integrity: data.signature },
-            redirectUrl: window.location.origin + '/checkout-result.html',
+            redirectUrl: window.location.href,
             customerData: {
                 email: shippingInfo.email,
                 fullName: shippingInfo.name,
                 phoneNumber: '',
                 phoneNumberPrefix: '+57',
                 legalId: '',
                 legalIdType: 'CC'
             }
         });
 
         checkout.open(function(result) {
             const transaction = result.transaction;
 
             if (transaction && transaction.status === 'APPROVED') {
                 handlePaymentSuccess(transaction.id);
             } else if (transaction && transaction.status === 'PENDING') {
                 showToast(currentLanguage === 'en'
                     ? 'Payment pending. We will notify you when confirmed.'
                     : 'Pago pendiente. Te notificaremos cuando sea confirmado.');
                 handlePaymentSuccess(transaction.id);
             } else if (transaction && transaction.status === 'DECLINED') {
                 showToast(currentLanguage === 'en'
                     ? 'Payment declined. Please try again.'
                     : 'Pago rechazado. Por favor intenta de nuevo.');
             } else if (transaction && transaction.status === 'ERROR') {
                 showToast(currentLanguage === 'en'
                     ? 'Payment error. Please try again.'
                     : 'Error en el pago. Por favor intenta de nuevo.');
             }
             // If user closes widget without completing, nothing happens
         });
 
     } catch (error) {
         console.error('Wompi error:', error);
         showToast(currentLanguage === 'en'
             ? 'Error initializing payment. Please try again.'
             : 'Error al iniciar el pago. Por favor intenta de nuevo.');
     }
 }
 
 // ==========================================
 // PayPal Initialization
 // ==========================================
 
+function loadPayPalSdk() {
+    if (typeof paypal !== 'undefined') {
+        return Promise.resolve();
+    }
+
+    if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === 'YOUR_PAYPAL_CLIENT_ID') {
+        return Promise.reject(new Error('PayPal client ID is not configured'));
+    }
+
+    const existingScript = document.getElementById('paypal-sdk');
+    if (existingScript) {
+        return new Promise((resolve, reject) => {
+            existingScript.addEventListener('load', () => resolve());
+            existingScript.addEventListener('error', () => reject(new Error('Failed to load PayPal SDK')));
+        });
+    }
+
+    return new Promise((resolve, reject) => {
+        const script = document.createElement('script');
+        script.id = 'paypal-sdk';
+        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&enable-funding=venmo&components=buttons`;
+        script.dataset.sdkIntegrationSource = 'button-factory';
+        script.onload = () => resolve();
+        script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
+        document.head.appendChild(script);
+    });
+}
+
 function initializePayPal() {
     if (typeof paypal === 'undefined') {
         console.log('PayPal SDK not loaded');
         return;
     }
 
     const container = document.getElementById('paypal-button-container');
     if (!container || container.hasChildNodes()) return;
 
     try {
         paypal.Buttons({
             style: {
                 layout: 'horizontal',
                 color: 'gold',
                 shape: 'rect',
                 label: 'paypal',
                 height: 45
             },
             createOrder: async function(data, actions) {
                 try {
                     const response = await fetch(`${API_BASE_URL}/api/paypal/create-order`, {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({
                             items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
@@ -587,51 +619,58 @@ function resetCheckoutSteps() {
     document.getElementById('payment-step').classList.add('hidden');
     document.getElementById('confirmation-step').classList.add('hidden');
 
     // Clear shipping form
     document.getElementById('shipping-form').reset();
     shippingInfo = null;
 }
 
 function showShippingStep() {
     document.getElementById('shipping-step').classList.remove('hidden');
     document.getElementById('payment-step').classList.add('hidden');
 }
 
 function showPaymentStep() {
     document.getElementById('shipping-step').classList.add('hidden');
     document.getElementById('payment-step').classList.remove('hidden');
 
     // Update shipping summary
     const summaryText = document.getElementById('shipping-summary-text');
     if (shippingInfo && summaryText) {
         summaryText.textContent = `${shippingInfo.name}, ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zip}`;
     }
 
     // Initialize PayPal
     setTimeout(() => {
-        initializePayPal();
+        loadPayPalSdk()
+            .then(() => initializePayPal())
+            .catch((error) => {
+                console.error('PayPal SDK load error:', error);
+                showToast(currentLanguage === 'en'
+                    ? 'PayPal is not configured. Please add your PayPal client ID.'
+                    : 'PayPal no está configurado. Agrega tu client ID de PayPal.');
+            });
     }, 100);
 }
 
 function showConfirmationStep(orderId) {
     document.getElementById('shipping-step').classList.add('hidden');
     document.getElementById('payment-step').classList.add('hidden');
     document.getElementById('confirmation-step').classList.remove('hidden');
 
     // Display confirmation details
     document.getElementById('confirmation-email-display').textContent = shippingInfo?.email || '';
     document.getElementById('order-number-display').textContent = orderId.toString().slice(-8).toUpperCase();
 
     // Clear cart
     clearCart();
 }
 
 function renderCheckoutItems() {
     const checkoutItemsContainer = document.getElementById('checkoutItems');
     const checkoutSubtotal = document.getElementById('checkoutSubtotal');
     const checkoutTotal = document.getElementById('checkoutTotal');
     const shipping = 8.00;
 
     checkoutItemsContainer.innerHTML = cart.map(item => `
         <div class="checkout-item">
             <img src="${item.imageUrl}" alt="${item.title}" class="checkout-item-image"
 
EOF
)
