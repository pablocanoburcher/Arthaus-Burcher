# Phillip Burcher Art Store - Payment Integration Setup

This guide will help you set up Stripe, PayPal, Apple Pay, and Google Pay for your art store.

## Prerequisites

- Node.js 18+ installed
- Stripe account
- PayPal Developer account

## Quick Start

1. **Install dependencies:**
   ```bash
   cd /Users/felipecano/Downloads/DOCUMENTOS/art-store
   npm install
   ```

2. **Create your `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Add your API keys to `.env`** (see sections below for how to get keys)

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Open in browser:**
   Visit `http://localhost:3000`

---

## Stripe Setup

### 1. Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Log in or create an account
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### 2. Update Your Keys

**In `.env` file:**
```
STRIPE_SECRET_KEY=sk_test_your_key_here
```

**In `script.js` (line 14):**
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_key_here';
```

### 3. Set Up Webhooks (for production)

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your endpoint URL: `https://yourdomain.com/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the "Signing secret" and add to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

### 4. Test Cards

Use these test card numbers:

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Succeeds |
| 4000 0000 0000 3220 | Requires 3D Secure |
| 4000 0000 0000 9995 | Declined |

Use any future date for expiry and any 3-digit CVC.

---

## PayPal Setup

### 1. Create PayPal Developer Account

1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Log in with your PayPal account (or create one)

### 2. Create an App

1. Go to [My Apps & Credentials](https://developer.paypal.com/dashboard/applications/sandbox)
2. Click "Create App"
3. Name it (e.g., "Phillip Burcher Art Store")
4. Select "Merchant" as the app type
5. Click "Create App"

### 3. Get Your Credentials

1. Copy the **Client ID** and **Secret** from the app details
2. Add to `.env`:
   ```
   PAYPAL_CLIENT_ID=your_client_id_here
   PAYPAL_CLIENT_SECRET=your_client_secret_here
   ```

### 4. Update Frontend

**In `index.html`, update the PayPal SDK script:**
```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_ACTUAL_CLIENT_ID&currency=USD&enable-funding=venmo&components=buttons"></script>
```

### 5. Test Accounts

PayPal provides sandbox test accounts:
1. Go to [Sandbox Accounts](https://developer.paypal.com/dashboard/accounts)
2. Use the provided buyer email/password to test payments

---

## Apple Pay / Google Pay Setup

Apple Pay and Google Pay are handled through Stripe's Payment Request API. They will automatically appear when:

1. **Apple Pay:** User is on Safari (macOS/iOS) with a card saved in Apple Wallet
2. **Google Pay:** User has Chrome with a card saved in Google Pay

### Requirements for Testing

**Apple Pay:**
- Use Safari on macOS Monterey+ or iOS 15+
- Have a card added to Apple Wallet
- Site must be served over HTTPS (or localhost for testing)

**Google Pay:**
- Use Chrome with a Google account
- Have a card saved in Google Pay
- Site must be served over HTTPS (or localhost for testing)

### Domain Verification (Production)

For production Apple Pay:
1. Go to [Stripe Apple Pay Settings](https://dashboard.stripe.com/settings/payments/apple_pay)
2. Download the domain verification file
3. Host it at `https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association`

---

## Testing the Full Flow

1. Start the server: `npm start`
2. Open `http://localhost:3000`
3. Add items to cart
4. Proceed to checkout
5. Fill in shipping information
6. Choose payment method:
   - **Card:** Use Stripe test card `4242 4242 4242 4242`
   - **PayPal:** Use sandbox buyer account
   - **Apple/Google Pay:** Will show if available in your browser

---

## Production Checklist

Before going live:

- [ ] Replace test API keys with live keys
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Set up Stripe webhook endpoint
- [ ] Verify Apple Pay domain
- [ ] Switch PayPal to Live environment
- [ ] Enable HTTPS on your server
- [ ] Test all payment methods with small amounts
- [ ] Set up proper error logging
- [ ] Configure email notifications for orders

---

## Troubleshooting

### "Stripe is not defined"
- Check that Stripe.js script is loading in index.html
- Verify your publishable key is correct

### "PayPal buttons not showing"
- Check browser console for errors
- Verify PayPal client ID is correct in the script URL
- Ensure you're not blocking PayPal scripts

### "Apple Pay / Google Pay not appearing"
- These only show when the browser supports them AND has saved cards
- Test on actual devices with cards configured
- Check that you're on localhost or HTTPS

### Payments failing
- Check server console for error messages
- Verify your secret keys are correct
- Ensure products in cart match server-side product data

---

## File Structure

```
art-store/
├── index.html          # Main HTML with checkout modal
├── styles.css          # All styles including checkout
├── script.js           # Frontend JS with payment logic
├── server.js           # Node.js backend with payment APIs
├── package.json        # Dependencies
├── .env.example        # Template for environment variables
├── .env                # Your actual API keys (don't commit!)
└── images/             # Product images
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/create-payment-intent` | POST | Create Stripe payment intent |
| `/create-payment-request-intent` | POST | Create intent for Apple/Google Pay |
| `/webhook` | POST | Stripe webhook handler |
| `/paypal/create-order` | POST | Create PayPal order |
| `/paypal/capture-order` | POST | Capture PayPal payment |
| `/calculate-total` | POST | Calculate order total |

---

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [Stripe Payment Request Button](https://stripe.com/docs/stripe-js/elements/payment-request-button)
