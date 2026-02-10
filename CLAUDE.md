# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ARTHAUS is a bilingual (English/Spanish) art print e-commerce store built for deployment on Vercel. It sells music-inspired art prints with payment processing through Wompi (Colombia, COP payments).

## Commands

```bash
# Local development with Express server
npm run dev

# Vercel local development (recommended - matches production)
npm run vercel-dev

# Production start
npm start

# Simple static preview (no payment processing)
python3 -m http.server 8000
```

## Architecture

### Frontend (Single Page Application)
- **index.html** - All pages in one file using show/hide pattern with `.page` class
- **script.js** - Application logic, cart state (localStorage), payment handling
- **styles.css** - Dark theme with CSS variables in `:root`

### Backend (Vercel Serverless Functions)
API endpoints are in `/api/` as individual serverless functions:
- `api/wompi/get-signature.js` - Wompi integrity signature generation (SHA256) for secure payments

### Deployment Configuration
- **vercel.json** - Defines build rules and routes for Vercel (static files + serverless API functions)
- **server.js** - Express server for local development only (not used in Vercel production). Contains legacy Stripe/PayPal code that is not active.

### Key Patterns

**Bilingual Support**: Uses `data-en` and `data-es` attributes on HTML elements. The `applyLanguage()` function in script.js switches content. For elements containing HTML tags (like `<br>`, `<em>`, `<a>`), add `data-html` attribute to use innerHTML instead of textContent.

**Product Data**: Products are defined in the frontend (`script.js`) and duplicated in `api/wompi/get-signature.js` for server-side validation. Keep these in sync when modifying products. Products include both USD price (`price`) and COP price (`priceCOP`). There are currently 5 products.

**Page Navigation**: Single HTML file with multiple `<main id="page-{name}">` sections. `showPage()` function toggles visibility.

**Cart Persistence**: Cart stored in localStorage under key `arthaus_cart`.

## Environment Variables (Vercel Dashboard)

```
# Wompi (Colombia)
WOMPI_INTEGRITY_SECRET=prod_integrity_XXXXXXXX
```

Note: `WOMPI_PUBLIC_KEY` is hardcoded in `script.js`. Only `WOMPI_INTEGRITY_SECRET` is needed as a server-side environment variable.

## Payment Integration Notes

### Wompi (Colombia) - Sole Payment Provider
- **Payment link integration** - Redirects customer to Wompi checkout page (`checkout.wompi.co`)
- Checkout flow: customer sees total in COP + reference code, then clicks through to Wompi to complete payment
- Supports: Credit/Debit Cards (Visa, Mastercard, Amex), PSE, Nequi, Daviplata
- Prices in COP (Colombian Pesos) - shipping is 32,000 COP
- Integrity signature generated server-side via `api/wompi/get-signature.js` (SHA256)
- Wompi is powered by Bancolombia
- Get credentials at: https://comercios.wompi.co/
- Documentation: https://docs.wompi.co/
- Test mode keys start with `pub_test_` and `test_integrity_`
- Production keys start with `pub_prod_` and `prod_integrity_`

### Removed Integrations
- **PayPal** was previously integrated but has been removed (PR #2). No serverless functions or frontend code remain.
- **Stripe is NOT available in Colombia** and was never used in production.
- Legacy PayPal/Stripe code exists only in `server.js` (local dev Express server) and is not active.

## Pages

The SPA contains these pages (`<main id="page-{name}">` sections):
- **home** - Hero, featured products, about preview
- **about** - Brand philosophy (human-made, music-inspired, Colombian soul)
- **catalogue** - Product gallery with category filters (All, Hip-Hop, R&B, Miscellaneous)
- **personalized** - Bespoke design request form with file upload
- **contact** - Email, studio location (Medellín), Instagram, newsletter signup
- **refunds** - Return/refund policy
