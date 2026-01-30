# Complete Payment Integration Guide (No-Code Friendly)

This guide assumes you have no coding experience. Follow each step exactly.

---

## PART 1: Install Node.js (Required)

Node.js is what runs your payment server. You need this installed on your computer.

### Step 1.1: Check if Node.js is installed

1. Open **Terminal** on your Mac:
   - Press `Cmd + Space`
   - Type "Terminal"
   - Press Enter

2. In Terminal, type this and press Enter:
   ```
   node --version
   ```

3. If you see a number like `v18.0.0` or higher, skip to PART 2.
   If you see "command not found", continue below.

### Step 1.2: Install Node.js

1. Open your web browser
2. Go to: https://nodejs.org/
3. Click the green button that says "LTS" (recommended version)
4. Open the downloaded file
5. Follow the installer - click "Continue" and "Agree" until done
6. Close Terminal and reopen it
7. Type `node --version` again - you should now see a version number

---

## PART 2: Get Your Stripe API Keys

Stripe handles credit card payments, Apple Pay, and Google Pay.

### Step 2.1: Create Stripe Account

1. Go to: https://dashboard.stripe.com/register
2. Fill in your email, name, and create a password
3. Verify your email by clicking the link Stripe sends you

### Step 2.2: Get Your Test Keys

1. Log into Stripe Dashboard: https://dashboard.stripe.com/
2. Make sure "Test mode" is ON (toggle in top-right should be orange)
3. Click **Developers** in the left sidebar
4. Click **API keys**
5. You'll see two keys:
   - **Publishable key**: Starts with `pk_test_...`
   - **Secret key**: Click "Reveal" to see it. Starts with `sk_test_...`

6. **IMPORTANT**: Copy both keys to a safe place (like a Notes app)

### Step 2.3: Add Publishable Key to Your Website

1. Open Finder
2. Navigate to: `/Users/felipecano/Downloads/DOCUMENTOS/art-store/`
3. Right-click on `script.js`
4. Click "Open With" → "TextEdit" (or any text editor)
5. Find this line near the top (around line 14):
   ```
   const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY';
   ```
6. Replace `pk_test_YOUR_STRIPE_PUBLISHABLE_KEY` with your actual publishable key
7. It should look like:
   ```
   const STRIPE_PUBLISHABLE_KEY = 'pk_test_51ABC123...your_actual_key...';
   ```
8. Save the file (Cmd + S)

---

## PART 3: Get Your PayPal API Keys

### Step 3.1: Create PayPal Developer Account

1. Go to: https://developer.paypal.com/
2. Click "Log in to Dashboard" (top right)
3. Log in with your regular PayPal account
   - If you don't have PayPal, click "Sign Up" first

### Step 3.2: Create an App

1. After logging in, you'll be on the Developer Dashboard
2. Look for "Apps & Credentials" in the menu
3. Make sure you're in **Sandbox** mode (not Live) - there's a toggle
4. Click **Create App**
5. Fill in:
   - App Name: `Art Store` (or any name you want)
   - App Type: Select **Merchant**
6. Click **Create App**

### Step 3.3: Get Your Credentials

1. After creating the app, you'll see your app's details
2. Find and copy:
   - **Client ID**: A long string of letters and numbers
   - **Secret**: Click "Show" to reveal it, then copy

3. Save both somewhere safe

### Step 3.4: Add PayPal Client ID to Your Website

1. Open Finder
2. Navigate to: `/Users/felipecano/Downloads/DOCUMENTOS/art-store/`
3. Right-click on `index.html`
4. Click "Open With" → "TextEdit"
5. Press `Cmd + F` to search
6. Search for: `YOUR_PAYPAL_CLIENT_ID`
7. You'll find a line like:
   ```
   <script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD...
   ```
8. Replace `YOUR_PAYPAL_CLIENT_ID` with your actual Client ID
9. Save the file (Cmd + S)

---

## PART 4: Set Up Your Server Configuration

### Step 4.1: Create Your Environment File

1. Open Finder
2. Navigate to: `/Users/felipecano/Downloads/DOCUMENTOS/art-store/`
3. Find the file named `.env.example`
   - If you don't see it, press `Cmd + Shift + .` to show hidden files
4. Right-click on `.env.example`
5. Click **Duplicate**
6. Rename the duplicate to just `.env` (remove the `.example` part)
   - If Mac warns about the dot, click "Use ."

### Step 4.2: Add Your Secret Keys

1. Right-click on your new `.env` file
2. Click "Open With" → "TextEdit"
3. You'll see:
   ```
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   PAYPAL_CLIENT_ID=your_paypal_client_id_here
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
   ```

4. Replace each placeholder with your actual keys:
   ```
   STRIPE_SECRET_KEY=sk_test_51ABC123YourActualStripeSecretKey
   PAYPAL_CLIENT_ID=AaBbCcYourActualPayPalClientId
   PAYPAL_CLIENT_SECRET=XxYyZzYourActualPayPalSecret
   ```

5. Save the file (Cmd + S)

---

## PART 5: Install Dependencies and Start Server

### Step 5.1: Open Terminal in Your Project Folder

1. Open **Terminal** (Cmd + Space, type "Terminal", press Enter)

2. Type this command exactly and press Enter:
   ```
   cd /Users/felipecano/Downloads/DOCUMENTOS/art-store
   ```

3. Your Terminal prompt should now show the `art-store` folder

### Step 5.2: Install Required Packages

1. In Terminal, type this and press Enter:
   ```
   npm install
   ```

2. Wait for it to finish (you'll see a lot of text scrolling)
3. When done, you'll see your prompt again with no errors

### Step 5.3: Start the Server

1. In Terminal, type this and press Enter:
   ```
   npm start
   ```

2. You should see:
   ```
   Server running on http://localhost:3000
   ```

3. **Keep this Terminal window open!** Closing it stops your server.

---

## PART 6: Test Your Payment Integration

### Step 6.1: Open Your Website

1. Open your web browser (Chrome or Safari)
2. Go to: `http://localhost:3000`
3. Your art store should load!

### Step 6.2: Test the Checkout Flow

1. Click on any art print
2. Click "Add to Cart"
3. Click the cart icon (top right)
4. Click "Checkout"
5. Fill in the shipping form with test info:
   - Email: `test@example.com`
   - Name: `Test User`
   - Address: `123 Test Street`
   - City: `New York`
   - State: `NY`
   - ZIP: `10001`
6. Click "Continue to Payment"

### Step 6.3: Test Credit Card Payment (Stripe)

1. In the payment step, fill in:
   - Cardholder Name: `Test User`
   - Card Number: `4242 4242 4242 4242`
   - Expiry: Any future date like `12/28`
   - CVC: Any 3 digits like `123`
   - ZIP: `10001`

2. Click "Pay Now"
3. You should see the success confirmation!

### Step 6.4: Test PayPal Payment

1. Add another item to cart and checkout again
2. At the payment step, click the PayPal button
3. PayPal will open in a popup
4. Log in with a PayPal Sandbox test account:
   - Go to: https://developer.paypal.com/dashboard/accounts
   - Find the "Personal" test account
   - Click the three dots → "View/edit account"
   - Copy the Email and Password
5. Use those credentials in the PayPal popup
6. Complete the payment

---

## PART 7: Testing Apple Pay and Google Pay

These only appear when:
- You're using Safari (Apple Pay) or Chrome (Google Pay)
- You have cards saved in Apple Wallet or Google Pay
- The site is on HTTPS (won't work on localhost usually)

For now, skip these - they'll work automatically when you deploy to a real website with HTTPS.

---

## PART 8: Common Problems and Solutions

### Problem: "npm: command not found"
**Solution**: Node.js isn't installed. Go back to PART 1.

### Problem: "Cannot find module 'express'"
**Solution**: Run `npm install` again in the art-store folder.

### Problem: Server won't start / Port in use
**Solution**:
1. Close all Terminal windows
2. Reopen Terminal
3. Run `cd /Users/felipecano/Downloads/DOCUMENTOS/art-store && npm start`

### Problem: Stripe card payment fails
**Solution**:
- Make sure you're using test card `4242 4242 4242 4242`
- Check that your Stripe keys are correct in both files
- Look at Terminal for error messages

### Problem: PayPal button doesn't appear
**Solution**:
- Check that you replaced `YOUR_PAYPAL_CLIENT_ID` in index.html
- Try refreshing the page (Cmd + Shift + R)
- Check browser console for errors (right-click → Inspect → Console)

### Problem: ".env file not showing"
**Solution**: Press `Cmd + Shift + .` in Finder to show hidden files

---

## PART 9: Going Live (When You're Ready)

When you want to accept real payments:

### Step 9.1: Get Live Keys from Stripe
1. Go to Stripe Dashboard
2. Turn OFF "Test mode" (toggle in top-right)
3. Go to Developers → API keys
4. Copy your live keys (start with `pk_live_` and `sk_live_`)

### Step 9.2: Get Live Keys from PayPal
1. Go to PayPal Developer Dashboard
2. Switch from "Sandbox" to "Live"
3. Create a new app or use existing one
4. Copy the live Client ID and Secret

### Step 9.3: Update Your Files
1. Replace all test keys with live keys in:
   - `.env` file
   - `script.js` (publishable key)
   - `index.html` (PayPal client ID)

### Step 9.4: Deploy to a Web Host
You'll need to put your website on a real server. Options include:
- **Vercel** (free): https://vercel.com
- **Netlify** (free): https://netlify.com
- **Heroku**: https://heroku.com
- **Railway** (easy): https://railway.app

Each has their own setup process - I can help with a specific one if you want.

---

## Quick Reference: Where Each Key Goes

| Key | File | What to Look For |
|-----|------|------------------|
| Stripe Publishable Key (`pk_test_...`) | `script.js` | `STRIPE_PUBLISHABLE_KEY = ` |
| Stripe Secret Key (`sk_test_...`) | `.env` | `STRIPE_SECRET_KEY=` |
| PayPal Client ID | `index.html` | `client-id=YOUR_PAYPAL` |
| PayPal Client ID | `.env` | `PAYPAL_CLIENT_ID=` |
| PayPal Secret | `.env` | `PAYPAL_CLIENT_SECRET=` |

---

## Need More Help?

If you get stuck:
1. Copy the exact error message you see
2. Note which step you're on
3. Ask for help with those details

Good luck! 🎨
