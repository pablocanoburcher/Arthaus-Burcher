/**
 * ARTHAUS - Art Store JavaScript
 * Product data, gallery, cart, checkout with payment integrations
 * Payment provider: Wompi (Colombia: Cards, PSE, Nequi, Daviplata)
 */

// ==========================================
// Configuration
// ==========================================

// API base URL - Vercel serverless functions use /api/ path
const API_BASE_URL = '';

// Wompi Configuration (Production)
const WOMPI_PUBLIC_KEY = 'pub_prod_3KbWCen3036LsV58opaQeANL52xPU9di';

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
        if (text) {
            // Handle different element types
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.hasAttribute('placeholder')) {
                    element.placeholder = text;
                } else {
                    element.value = text;
                }
            } else if (element.hasAttribute('data-html')) {
                // Use innerHTML for elements that contain HTML tags
                element.innerHTML = text;
            } else {
                element.textContent = text;
            }
        }
    });

    // Update HTML lang attribute
    document.documentElement.lang = currentLanguage;
}

function updateLanguageButton() {
    const langLabel = document.getElementById('langLabel');
    const langBtn = document.querySelector('.lang-toggle');
    if (langLabel) {
        langLabel.textContent = currentLanguage === 'en' ? 'ES' : 'EN';
    }
    if (langBtn) {
        langBtn.setAttribute('title', currentLanguage === 'en' ? 'Cambiar a Español' : 'Switch to English');
    }
}

function initializeLanguage() {
    applyLanguage();
    updateLanguageButton();
}

// ==========================================
// Product Data
// ==========================================

const products = [
    {
        id: 1,
        title: "Blond",
        artist: "Frank Ocean",
        price: 45.00,
        priceCOP: 180000, // Price in Colombian Pesos
        category: "rnb",
        description: "A minimalist tribute to Frank Ocean's groundbreaking 2016 album. This teal-toned poster captures the introspective essence of the record with a distinctive silhouette design featuring the complete tracklist.",
        dimensions: "18\" x 24\" (45.7 x 61 cm)",
        imageUrl: "images/frank-ocean-blond.jpg"
    },
    {
        id: 2,
        title: "Mr. Morale",
        artist: "Kendrick Lamar",
        price: 48.00,
        priceCOP: 192000,
        category: "hip-hop",
        description: "A vintage-inspired concert poster celebrating Kendrick Lamar's profound 2022 album. The circular composition features the artist mid-performance, surrounded by elegant typography and album context.",
        dimensions: "18\" x 24\" (45.7 x 61 cm)",
        imageUrl: "images/kendrick-lamar-morale.jpg"
    },
    {
        id: 3,
        title: "The World Is So Small",
        artist: "Mac Miller",
        price: 42.00,
        priceCOP: 168000,
        category: "hip-hop",
        description: "A playful retro illustration honoring Mac Miller's legacy. Features a whimsical walking globe character with the poignant lyric that captures the late artist's philosophical approach to life.",
        dimensions: "18\" x 24\" (45.7 x 61 cm)",
        imageUrl: "images/mac-miller-world.jpg"
    },
    {
        id: 4,
        title: "Music.",
        artist: "Various",
        price: 38.00,
        priceCOP: 152000,
        category: "misc",
        description: "A contemplative piece featuring an elderly listener lost in the moment. The dual-tone typography and elegant composition speaks to the universal language of music across generations.",
        dimensions: "18\" x 24\" (45.7 x 61 cm)",
        imageUrl: "images/music-poster.jpg"
    },
    {
        id: 5,
        title: "Do More With Less",
        artist: "Steve Lacy",
        price: 45.00,
        priceCOP: 180000,
        category: "rnb",
        description: "Celebrating Steve Lacy's innovative approach to music production. This risograph-style print captures his philosophy of creating vibrant, soulful sounds with minimal equipment.",
        dimensions: "18\" x 24\" (45.7 x 61 cm)",
        imageUrl: "images/steve-lacy.jpg"
    }
];

// Shipping cost in COP
const SHIPPING_COP = 32000; // ~$8 USD

// ==========================================
// State Management
// ==========================================

let cart = JSON.parse(localStorage.getItem('arthaus_cart')) || [];
let currentProduct = null;
let currentPage = 'home';

// Payment state
let shippingInfo = null;
let wompiCheckout = null;

// ==========================================
// Wompi Payment Integration
// ==========================================

function getCartTotalCOP() {
    return cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + ((product?.priceCOP || 0) * item.quantity);
    }, 0);
}

async function openWompiCheckout() {
    if (!shippingInfo) {
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
                currency: WOMPI_CURRENCY
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
            redirectUrl: window.location.origin + '/checkout-result.html',
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
// Page Navigation
// ==========================================

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageName;

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageName) {
                link.classList.add('active');
            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (pageName === 'catalogue') {
            renderGallery();
        }
    }
}

// ==========================================
// DOM Elements
// ==========================================

const galleryGrid = document.getElementById('galleryGrid');
const featuredGrid = document.getElementById('featuredGrid');
const productModal = document.getElementById('productModal');
const cartModal = document.getElementById('cartModal');
const checkoutModal = document.getElementById('checkoutModal');
const modalImage = document.getElementById('modalImage');
const modalArtist = document.getElementById('modalArtist');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const modalDescription = document.getElementById('modalDescription');
const modalDimensions = document.getElementById('modalDimensions');
const addToCartBtn = document.getElementById('addToCartBtn');
const cartCount = document.getElementById('cartCount');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// ==========================================
// Render Functions
// ==========================================

function renderProductCard(product) {
    return `
        <article class="product-card" data-product-id="${product.id}" data-category="${product.category}">
            <div class="product-image-container">
                <img
                    src="${product.imageUrl}"
                    alt="${product.title} by ${product.artist}"
                    class="product-image"
                    loading="lazy"
                    onerror="this.src='https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=600&auto=format&fit=crop'"
                >
                <div class="product-overlay">
                    <button class="view-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            <line x1="11" y1="8" x2="11" y2="14"></line>
                            <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                        View Print
                    </button>
                </div>
            </div>
            <div class="product-info">
                <p class="product-card-artist">${product.artist}</p>
                <h3 class="product-card-title">${product.title}</h3>
                <p class="product-card-price">$${product.price.toFixed(2)}</p>
            </div>
        </article>
    `;
}

function renderGallery(filter = 'all') {
    const filteredProducts = filter === 'all'
        ? products
        : products.filter(p => p.category === filter);

    if (galleryGrid) {
        galleryGrid.innerHTML = filteredProducts.map(renderProductCard).join('');
        attachProductCardListeners(galleryGrid);
    }
}

function renderFeatured() {
    const featuredProducts = products.slice(0, 3);
    if (featuredGrid) {
        featuredGrid.innerHTML = featuredProducts.map(renderProductCard).join('');
        attachProductCardListeners(featuredGrid);
    }
}

function attachProductCardListeners(container) {
    container.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const productId = parseInt(card.dataset.productId);
            openProductModal(productId);
        });
    });
}

// ==========================================
// Product Modal Functions
// ==========================================

function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentProduct = product;

    modalImage.src = product.imageUrl;
    modalImage.alt = `${product.title} by ${product.artist}`;
    modalArtist.textContent = product.artist;
    modalTitle.textContent = product.title;
    modalPrice.textContent = `$${product.price.toFixed(2)}`;
    modalDescription.textContent = product.description;
    modalDimensions.textContent = product.dimensions;

    modalImage.onerror = function() {
        this.src = 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1000&auto=format&fit=crop';
        this.onerror = null;
    };

    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    productModal.classList.remove('active');
    document.body.style.overflow = '';
    currentProduct = null;
}

// ==========================================
// Cart Functions
// ==========================================

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartCount();
    showToast(`"${product.title}" ${currentLanguage === 'en' ? 'added to cart' : 'agregado al carrito'}`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderCartItems();
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartCount();
}

function saveCart() {
    localStorage.setItem('arthaus_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cartCount.style.transform = 'scale(1)';
    }, 200);
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartFooter = document.getElementById('cartFooter');
    const cartSubtotal = document.getElementById('cartSubtotal');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        cartEmpty.classList.add('active');
        cartFooter.classList.add('hidden');
    } else {
        cartEmpty.classList.remove('active');
        cartFooter.classList.remove('hidden');

        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.imageUrl}" alt="${item.title}" class="cart-item-image"
                     onerror="this.src='https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=200&auto=format&fit=crop'">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <p class="cart-item-artist">${item.artist}</p>
                    <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)} ${item.quantity > 1 ? `(x${item.quantity})` : ''}</p>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `).join('');

        cartSubtotal.textContent = `$${getCartTotal().toFixed(2)}`;
    }
}

function openCartModal() {
    renderCartItems();
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    cartModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ==========================================
// Checkout Functions
// ==========================================

function proceedToCheckout() {
    if (cart.length === 0) return;

    closeCartModal();
    renderCheckoutItems();
    resetCheckoutSteps();
    checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
    checkoutModal.classList.remove('active');
    document.body.style.overflow = '';
    resetCheckoutSteps();
}

function resetCheckoutSteps() {
    // Show shipping step, hide others
    document.getElementById('shipping-step').classList.remove('hidden');
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
                 onerror="this.src='https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=200&auto=format&fit=crop'">
            <div class="checkout-item-info">
                <p class="checkout-item-title">${item.title}</p>
                <p class="checkout-item-artist">${item.artist}</p>
            </div>
            <p class="checkout-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
        </div>
    `).join('');

    const subtotal = getCartTotal();
    checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    checkoutTotal.textContent = `$${(subtotal + shipping).toFixed(2)}`;
}

// ==========================================
// Payment Handlers
// ==========================================

async function handleShippingSubmit(event) {
    event.preventDefault();

    // Collect shipping info
    shippingInfo = {
        email: document.getElementById('shipping-email').value,
        name: document.getElementById('shipping-name').value,
        address: document.getElementById('shipping-address').value,
        address2: document.getElementById('shipping-address2').value,
        city: document.getElementById('shipping-city').value,
        state: document.getElementById('shipping-state').value,
        zip: document.getElementById('shipping-zip').value,
        country: document.getElementById('shipping-country').value
    };

    // Move to payment step
    showPaymentStep();
}

function handlePaymentSuccess(orderId) {
    showToast(currentLanguage === 'en' ? 'Payment successful!' : '¡Pago exitoso!');
    showConfirmationStep(orderId);
}

// ==========================================
// Toast Notification
// ==========================================

function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('active');

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// ==========================================
// Mobile Menu
// ==========================================

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.remove('active');
}

// ==========================================
// Filter Functionality
// ==========================================

function initializeFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderGallery(btn.dataset.filter);
        });
    });
}

// ==========================================
// File Upload Handler
// ==========================================

function initializeFileUpload() {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('referenceFiles');
    const fileList = document.getElementById('fileList');

    if (!fileUploadArea) return;

    fileUploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = '#a18a6c';
    });

    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.style.borderColor = '';
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = '';
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        fileList.innerHTML = '';
        Array.from(files).forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span>${file.name}</span>
                <span>${(file.size / 1024 / 1024).toFixed(2)} MB</span>
            `;
            fileList.appendChild(fileItem);
        });
    }
}

// ==========================================
// Form Handlers
// ==========================================

function initializeForms() {
    // Bespoke Form
    const bespokeForm = document.getElementById('bespokeForm');
    if (bespokeForm) {
        bespokeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast(currentLanguage === 'en' ? 'Request submitted! We\'ll be in touch within 24-48 hours.' : '¡Solicitud enviada! Te contactaremos en 24-48 horas.');
            bespokeForm.reset();
            document.getElementById('fileList').innerHTML = '';
        });
    }

    // Newsletter Form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast(currentLanguage === 'en' ? 'Thank you for subscribing!' : '¡Gracias por suscribirte!');
            newsletterForm.reset();
        });
    }

    // Shipping Form
    const shippingForm = document.getElementById('shipping-form');
    if (shippingForm) {
        shippingForm.addEventListener('submit', handleShippingSubmit);
    }
}

// ==========================================
// Event Listeners
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    initializeLanguage();
    renderFeatured();
    updateCartCount();
    initializeFilters();
    initializeFileUpload();
    initializeForms();

    // Product Modal - Add to Cart
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            if (currentProduct) {
                addToCart(currentProduct);
            }
        });
    }

    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (productModal.classList.contains('active')) closeProductModal();
            if (cartModal.classList.contains('active')) closeCartModal();
            if (checkoutModal.classList.contains('active')) closeCheckoutModal();
            closeMobileMenu();
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});

// Make functions available globally
window.showPage = showPage;
window.openCartModal = openCartModal;
window.closeCartModal = closeCartModal;
window.closeProductModal = closeProductModal;
window.closeCheckoutModal = closeCheckoutModal;
window.proceedToCheckout = proceedToCheckout;
window.removeFromCart = removeFromCart;
window.showShippingStep = showShippingStep;
window.closeMobileMenu = closeMobileMenu;
window.toggleLanguage = toggleLanguage;
window.openWompiCheckout = openWompiCheckout;
