PHILLIP BURCHER - Art Store Setup Instructions
==============================================

WEBSITE STRUCTURE:
-----------------
- HOME: Landing page with hero, featured prints, and about section
- CATALOGUE: Full product gallery with category filters
- PERSONALIZED: Bespoke design request form
- CONTACT: Email, studio address, social links, newsletter
- REFUNDS: Return policy information

REQUIRED IMAGE FILES:
--------------------
Save your poster images with these exact filenames in the "images" folder:

1. frank-ocean-blond.jpg    - Frank Ocean "Blond" poster (teal silhouette)
2. kendrick-lamar-morale.jpg - Kendrick Lamar "Mr. Morale" poster (vintage concert style)
3. mac-miller-world.jpg     - Mac Miller "The World Is So Small" poster (globe character)
4. music-poster.jpg         - "Music." poster (elderly man with headphones)
5. steve-lacy.jpg          - Steve Lacy "Do More With Less" poster

IMAGE RECOMMENDATIONS:
---------------------
- Format: JPG or PNG
- Minimum dimensions: 800 x 1067 pixels (3:4 aspect ratio recommended)
- File size: Optimize for web (under 500KB each for fast loading)

PAYMENT API SETUP:
==================

1. STRIPE (Credit/Debit Cards, Apple Pay, Google Pay)
-----------------------------------------------------
   a) Create account at https://stripe.com
   b) Get your publishable key from Dashboard > Developers > API Keys
   c) In script.js, replace 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY' with your key
   d) For production, you'll need a backend server to create PaymentIntents

   Apple Pay & Google Pay:
   - These work through Stripe's Payment Request API
   - Apple Pay requires domain verification in Stripe Dashboard
   - Google Pay requires enabling in Stripe Dashboard

2. PAYPAL
---------
   a) Create account at https://developer.paypal.com
   b) Create an app in the Developer Dashboard
   c) Get your Client ID
   d) In index.html, replace 'YOUR_PAYPAL_CLIENT_ID' in the PayPal SDK script:
      <script src="https://www.paypal.com/sdk/js?client-id=YOUR_ACTUAL_CLIENT_ID&currency=USD...">

PRODUCTION DEPLOYMENT NOTES:
---------------------------
For a real store, you'll need:

1. Backend Server (Node.js, Python, etc.) to:
   - Create Stripe PaymentIntents securely
   - Handle webhook events
   - Process orders and send confirmation emails

2. SSL Certificate (HTTPS required for payments)

3. Domain Verification for Apple Pay

4. Tax Calculation Service (e.g., TaxJar, Avalara)

5. Shipping Integration (e.g., Shippo, EasyPost)

HOW TO VIEW THE WEBSITE:
-----------------------
Option 1 - Simple (Double-click):
   Just double-click index.html to open in your default browser

Option 2 - Local Server (Recommended for full functionality):
   1. Open Terminal
   2. Navigate to this folder: cd /Users/felipecano/Downloads/DOCUMENTOS/art-store
   3. Run: python3 -m http.server 8000
   4. Open browser and go to: http://localhost:8000

CUSTOMIZATION:
-------------
- Edit product data in script.js (prices, descriptions, titles, categories)
- Edit colors in styles.css (look for :root CSS variables)
- Edit content in index.html (text, sections, contact info)
- Edit branding: Change "PHILLIP BURCHER" to your name in navbar and throughout

COLOR VARIABLES (styles.css):
----------------------------
--color-bg-primary: #f5f3ef;     /* Light cream background */
--color-accent: #a18a6c;         /* Gold/tan accent color */
--color-text-primary: #2c2c2c;   /* Dark text */

FOLDER STRUCTURE:
----------------
art-store/
  ├── index.html      (main webpage with all pages)
  ├── styles.css      (styling - light cream theme)
  ├── script.js       (functionality + payment integrations)
  ├── README.txt      (this file)
  └── images/         (your poster images go here)
      ├── frank-ocean-blond.jpg
      ├── kendrick-lamar-morale.jpg
      ├── mac-miller-world.jpg
      ├── music-poster.jpg
      └── steve-lacy.jpg

FEATURES INCLUDED:
-----------------
✓ Multi-page navigation (Home, Catalogue, Personalized, Contact, Refunds)
✓ Product gallery with category filters
✓ Product detail modal with "View in Frame" simulation
✓ Shopping cart with localStorage persistence
✓ Checkout modal with:
  - Apple Pay button
  - Google Pay button
  - Stripe card payment form
  - PayPal button
✓ Bespoke design request form with file upload
✓ Contact page with newsletter signup
✓ Refund policy page
✓ Mobile responsive design
✓ Smooth animations and transitions
✓ Toast notifications
