# Deploy to Vercel - Step by Step Guide

This guide will walk you through deploying your art store to Vercel with working payments.

---

## PART 1: Prepare Your Project

### Step 1.1: Get Your API Keys Ready

Before deploying, make sure you have:
- ✅ Stripe Publishable Key (`pk_test_...`)
- ✅ Stripe Secret Key (`sk_test_...`)
- ✅ PayPal Client ID
- ✅ PayPal Client Secret

If you don't have these yet, see `STEP-BY-STEP-GUIDE.md` for instructions.

### Step 1.2: Update Your Stripe Publishable Key

1. Open `script.js` in a text editor
2. Find line 14:
   ```javascript
   const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY';
   ```
3. Replace with your actual Stripe publishable key
4. Save the file

### Step 1.3: Update Your PayPal Client ID

1. Open `index.html` in a text editor
2. Press `Cmd + F` and search for `YOUR_PAYPAL_CLIENT_ID`
3. Replace it with your actual PayPal Client ID
4. Save the file

---

## PART 2: Create a GitHub Account (If You Don't Have One)

Vercel works best with GitHub. If you already have GitHub, skip to PART 3.

1. Go to: https://github.com/signup
2. Create an account with your email
3. Verify your email

---

## PART 3: Upload Your Project to GitHub

### Step 3.1: Install GitHub Desktop (Easiest Method)

1. Go to: https://desktop.github.com/
2. Download and install GitHub Desktop
3. Open GitHub Desktop
4. Sign in with your GitHub account

### Step 3.2: Create a New Repository

1. In GitHub Desktop, click **File** → **Add Local Repository**
2. Click **Choose...** and navigate to:
   ```
   /Users/felipecano/Downloads/DOCUMENTOS/art-store
   ```
3. If it says "This directory is not a repository", click **Create a Repository**
4. Fill in:
   - Name: `art-store` (or any name you want)
   - Description: `Art print store with payments`
   - Keep "Initialize with a README" unchecked
5. Click **Create Repository**

### Step 3.3: Publish to GitHub

1. Click **Publish repository** (top bar)
2. Uncheck "Keep this code private" if you want it public (doesn't matter for functionality)
3. Click **Publish Repository**

Your code is now on GitHub!

---

## PART 4: Deploy to Vercel

### Step 4.1: Create Vercel Account

1. Go to: https://vercel.com/signup
2. Click **Continue with GitHub**
3. Authorize Vercel to access your GitHub

### Step 4.2: Import Your Project

1. After signing in, you'll see the Vercel Dashboard
2. Click **Add New...** → **Project**
3. Find your `art-store` repository in the list
4. Click **Import**

### Step 4.3: Configure Build Settings

On the configuration page:

1. **Framework Preset**: Leave as "Other"
2. **Root Directory**: Leave as `.` (dot)
3. **Build Command**: Leave empty
4. **Output Directory**: Leave empty

### Step 4.4: Add Environment Variables (IMPORTANT!)

This is where you add your secret API keys. Click **Environment Variables** and add these one by one:

| Name | Value |
|------|-------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key (`sk_test_...`) |
| `PAYPAL_CLIENT_ID` | Your PayPal Client ID |
| `PAYPAL_CLIENT_SECRET` | Your PayPal Client Secret |

**How to add each one:**
1. Type the name in "Name" field (e.g., `STRIPE_SECRET_KEY`)
2. Paste your key in "Value" field
3. Click **Add**
4. Repeat for all three variables

### Step 4.5: Deploy!

1. Click **Deploy**
2. Wait for deployment to complete (usually 1-2 minutes)
3. You'll see a success screen with your URL!

Your site will be live at something like: `https://art-store-abc123.vercel.app`

---

## PART 5: Test Your Live Site

### Step 5.1: Visit Your Site

1. Click the URL Vercel gave you
2. Your art store should load!

### Step 5.2: Test Checkout

1. Add an item to cart
2. Click checkout
3. Fill in shipping info
4. Test with Stripe test card: `4242 4242 4242 4242`
5. Use any future expiry date and any CVC

### Step 5.3: Check for Errors

If something doesn't work:
1. Go to Vercel Dashboard
2. Click on your project
3. Click **Deployments** tab
4. Click on your latest deployment
5. Click **Functions** tab
6. Look for any errors

---

## PART 6: Custom Domain (Optional)

Want to use your own domain like `yourname.com`?

### Step 6.1: Add Domain in Vercel

1. Go to your project in Vercel Dashboard
2. Click **Settings** tab
3. Click **Domains** in the sidebar
4. Enter your domain name and click **Add**

### Step 6.2: Update DNS Settings

Vercel will show you DNS records to add. Go to your domain registrar (GoDaddy, Namecheap, etc.) and add those records.

---

## PART 7: Going Live with Real Payments

When you're ready to accept real money:

### Step 7.1: Get Live API Keys

**Stripe:**
1. Go to Stripe Dashboard
2. Turn OFF "Test mode" toggle
3. Go to Developers → API keys
4. Copy your live keys

**PayPal:**
1. Go to PayPal Developer Dashboard
2. Switch from Sandbox to Live
3. Copy your live credentials

### Step 7.2: Update Your Files

1. Update `script.js` with live Stripe publishable key (`pk_live_...`)
2. Update `index.html` with live PayPal Client ID
3. Commit and push changes to GitHub (Vercel will auto-deploy)

### Step 7.3: Update Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update each variable with your live keys:
   - `STRIPE_SECRET_KEY` → Your live secret key
   - `PAYPAL_CLIENT_ID` → Your live client ID
   - `PAYPAL_CLIENT_SECRET` → Your live secret

3. Click **Redeploy** to apply changes

### Step 7.4: Set Up Stripe Apple Pay Domain (For Apple Pay)

1. Go to Stripe Dashboard → Settings → Payment methods → Apple Pay
2. Click **Add new domain**
3. Enter your Vercel domain (e.g., `art-store.vercel.app`)
4. Stripe will verify it automatically

---

## Troubleshooting

### "Payment failed" error
- Check that environment variables are set correctly in Vercel
- Make sure you're using test card `4242 4242 4242 4242` for testing
- Check Vercel function logs for specific errors

### PayPal button doesn't show
- Make sure you replaced `YOUR_PAYPAL_CLIENT_ID` in index.html
- Check browser console for errors (Right-click → Inspect → Console)

### Site shows blank page
- Check Vercel deployment logs for build errors
- Make sure all files were pushed to GitHub

### Changes not appearing
- Push your changes to GitHub
- Wait for Vercel to auto-deploy (check Deployments tab)
- Or click "Redeploy" in Vercel to force a new deployment

---

## Summary: What You Need to Change

| File | What to Change |
|------|----------------|
| `script.js` line 14 | Add your Stripe publishable key |
| `index.html` | Add your PayPal Client ID |
| Vercel Environment Variables | Add STRIPE_SECRET_KEY, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET |

---

## Need Help?

If you get stuck:
1. Take a screenshot of the error
2. Note which step you're on
3. Check the Vercel function logs
4. Ask for help with those details

Good luck with your art store! 🎨
