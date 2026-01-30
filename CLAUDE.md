# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ARTHAUS is a bilingual (English/Spanish) art print e-commerce store built for deployment on Vercel. It sells music-inspired art prints with payment processing through Wompi (for Colombia) and PayPal (international).

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
All API endpoints are in `/api/` as individual serverless functions:
- `api/wompi/get-signature.js` - Wompi integrity signature generation for secure payments
- `api/paypal/create-order.js` - PayPal order creation
- `api/paypal/capture-order.js` - PayPal payment capture

### Key Patterns

**Bilingual Support**: Uses `data-en` and `data-es` attributes on HTML elements. The `applyLanguage()` function in script.js switches content. For elements containing HTML tags (like `<br>`, `<em>`, `<a>`), add `data-html` attribute to use innerHTML instead of textContent.

**Product Data**: Products are defined in both frontend (`script.js`) and duplicated in each API file for server-side validation. Keep these in sync when modifying products. Products include both USD price (`price`) and COP price (`priceCOP`).

**Page Navigation**: Single HTML file with multiple `<main id="page-{name}">` sections. `showPage()` function toggles visibility.

**Cart Persistence**: Cart stored in localStorage under key `arthaus_cart`.

## Environment Variables (Vercel Dashboard)

```
# Wompi (Colombia)
WOMPI_PUBLIC_KEY=pub_prod_XXXXXXXX
WOMPI_INTEGRITY_SECRET=prod_integrity_XXXXXXXX

# PayPal (International)
PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
```

## Payment Integration Notes

### Wompi (Colombia)
- **Widget integration** - Opens Wompi popup for payment
- Supports: Credit/Debit Cards (Visa, Mastercard, Amex), PSE, Nequi, Daviplata
- Prices in COP (Colombian Pesos) - converted to cents for API
- Requires integrity signature generated server-side (SHA256)
- Get credentials at: https://comercios.wompi.co/
- Documentation: https://docs.wompi.co/

### PayPal (International)
- For customers outside Colombia paying in USD
- PayPal SDK loaded in index.html
- Replace `YOUR_PAYPAL_CLIENT_ID` with actual client ID in the script tag

### Important
- **Stripe is NOT available in Colombia** - not used
- Wompi is powered by Bancolombia - reliable for Colombian market
- Test mode keys start with `pub_test_` and `test_integrity_`
- Production keys start with `pub_prod_` and `prod_integrity_`
