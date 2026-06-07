/**
 * ============================================================
 * EZMUSH BAKERS - script.js
 * Main JavaScript for Ezmush Bakers Website
 * Author: Ezmush Bakers Dev Team
 * Version: 1.0.0
 * ============================================================
 */

'use strict';

/* ============================================================
   1. DOM READY - Initialize Everything
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initSearchBar();
  initProductFilter();
  initCart();
  initScrollReveal();
  initSmoothScroll();
  initActiveNavLink();
  initNewsletterForm();
  initContactForm();
  initGalleryLightbox();
});

/* ============================================================
   2. NAVBAR - Scroll Behaviour & Sticky
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Add scrolled class on scroll
  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  // Run on load to handle page refresh at scroll position
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
}

/* ============================================================
   3. MOBILE MENU - Hamburger Toggle
   ============================================================ */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ============================================================
   4. SEARCH BAR - Toggle & Live Search
   ============================================================ */
function initSearchBar() {
  const searchToggle = document.getElementById('searchToggle');
  const searchBar    = document.getElementById('searchBar');
  const searchClose  = document.getElementById('searchClose');
  const searchInput  = document.getElementById('searchInput');
  if (!searchToggle || !searchBar) return;

  // Open search
  searchToggle.addEventListener('click', () => {
    searchBar.classList.toggle('open');
    if (searchBar.classList.contains('open')) {
      setTimeout(() => searchInput?.focus(), 300);
    }
  });

  // Close search
  searchClose?.addEventListener('click', () => {
    searchBar.classList.remove('open');
    if (searchInput) searchInput.value = '';
    // Show all products when search cleared
    filterProductsBySearch('');
  });

  // Live search through products
  searchInput?.addEventListener('input', (e) => {
    filterProductsBySearch(e.target.value.trim().toLowerCase());
  });

  // Close search on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchBar.classList.contains('open')) {
      searchBar.classList.remove('open');
      if (searchInput) searchInput.value = '';
      filterProductsBySearch('');
    }
  });
}

/**
 * Filter product cards based on search query.
 * @param {string} query - The search string (lowercased).
 */
function filterProductsBySearch(query) {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    const name = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
    const desc = card.querySelector('.product-desc')?.textContent.toLowerCase() || '';
    const cat  = card.querySelector('.product-category')?.textContent.toLowerCase() || '';
    const match = !query || name.includes(query) || desc.includes(query) || cat.includes(query);
    card.style.display = match ? '' : 'none';
  });
}

/* ============================================================
   5. PRODUCT FILTER - Category Buttons
   ============================================================ */
function initProductFilter() {
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      // Filter cards with animation
      productCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden');
          // Re-trigger animation
          card.style.animation = 'none';
          requestAnimationFrame(() => {
            card.style.animation = '';
          });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ============================================================
   6. SHOPPING CART
   ============================================================ */

// Cart state
let cart = [];

function initCart() {
  const cartBtn     = document.getElementById('cartBtn');
  const cartClose   = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const addToCartBtns = document.querySelectorAll('.add-cart-btn');

  // Open Cart
  cartBtn?.addEventListener('click', openCart);

  // Close Cart
  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  // Add to Cart buttons
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const name  = btn.dataset.name;
      const price = parseInt(btn.dataset.price, 10);
      addToCart(name, price);
    });
  });

  // Checkout Button - Build WhatsApp message
  const checkoutBtn = document.getElementById('checkoutBtn');
  checkoutBtn?.addEventListener('click', (e) => {
    if (cart.length === 0) {
      e.preventDefault();
      showToast('Your basket is empty.');
      return;
    }
    const msg = buildWhatsAppOrderMessage();
    checkoutBtn.href = `https://wa.me/923001234567?text=${encodeURIComponent(msg)}`;
  });

  // Load cart from session (optional persistence)
  renderCart();
}

/**
 * Add an item to cart, or increment its quantity.
 * @param {string} name  - Product name.
 * @param {number} price - Product price in PKR.
 */
function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  renderCart();
  updateCartCount();
  openCart();
  showToast(`${name} added to basket!`);
}

/**
 * Remove an item from cart.
 * @param {string} name - Product name.
 */
function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name);
  renderCart();
  updateCartCount();
}

/**
 * Change quantity of a cart item.
 * @param {string} name  - Product name.
 * @param {number} delta - +1 or -1.
 */
function changeQty(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(name);
  } else {
    renderCart();
    updateCartCount();
  }
}

/**
 * Render cart items in the sidebar.
 */
function renderCart() {
  const cartItems  = document.getElementById('cartItems');
  const cartEmpty  = document.getElementById('cartEmpty');
  const cartFooter = document.getElementById('cartFooter');
  const cartTotalEl = document.getElementById('cartTotal');
  if (!cartItems) return;

  // Clear previous items (keep the empty state element)
  cartItems.querySelectorAll('.cart-item').forEach(el => el.remove());

  if (cart.length === 0) {
    cartEmpty.style.display = 'flex';
    if (cartFooter) cartFooter.style.display = 'none';
    return;
  }

  cartEmpty.style.display = 'none';
  if (cartFooter) cartFooter.style.display = 'block';

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <div class="cart-item-info">
        <p class="cart-item-name">${escapeHtml(item.name)}</p>
        <p class="cart-item-price">Rs. ${(item.price * item.qty).toLocaleString()}</p>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" data-name="${escapeHtml(item.name)}" data-action="dec" aria-label="Decrease quantity">
          <i class="fa-solid fa-minus"></i>
        </button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" data-name="${escapeHtml(item.name)}" data-action="inc" aria-label="Increase quantity">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    `;
    cartItems.appendChild(itemEl);
  });

  // Total
  if (cartTotalEl) cartTotalEl.textContent = `Rs. ${total.toLocaleString()}`;

  // Qty btn events
  cartItems.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name   = btn.dataset.name;
      const action = btn.dataset.action;
      changeQty(name, action === 'inc' ? 1 : -1);
    });
  });
}

/**
 * Update the cart badge count.
 */
function updateCartCount() {
  const cartCount = document.getElementById('cartCount');
  if (!cartCount) return;
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = total;
  if (total > 0) {
    cartCount.classList.add('visible');
  } else {
    cartCount.classList.remove('visible');
  }
}

function openCart() {
  document.getElementById('cartSidebar')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartSidebar')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

/**
 * Build a formatted WhatsApp order message.
 * @returns {string} - Formatted order string.
 */
function buildWhatsAppOrderMessage() {
  let message = 'Assalam-o-Alaikum! I would like to place an order from Ezmush Bakers:\n\n';
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    message += `${index + 1}. ${item.name} x${item.qty} = Rs. ${itemTotal.toLocaleString()}\n`;
  });

  message += `\n*Total: Rs. ${total.toLocaleString()}*`;
  message += '\n\nPlease confirm availability and delivery charges. Thank you!';
  return message;
}

/* ============================================================
   7. SCROLL REVEAL ANIMATIONS
   ============================================================ */
function initScrollReveal() {
  // Add reveal class to elements
  const targets = [
    '.category-card',
    '.product-card',
    '.why-card',
    '.review-card',
    '.about-feat',
    '.contact-item',
    '.city-tag',
    '.gallery-item',
    '.offer-card',
    '.section-header',
  ];

  targets.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('reveal');
    });
  });

  // Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ============================================================
   8. SMOOTH SCROLL
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const navbarH = document.getElementById('navbar')?.offsetHeight || 74;
      const targetY = target.getBoundingClientRect().top + window.scrollY - navbarH;

      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   9. ACTIVE NAV LINK - Highlight on Scroll
   ============================================================ */
function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const navbarH = document.getElementById('navbar')?.offsetHeight || 74;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, {
    rootMargin: `-${navbarH}px 0px -55% 0px`,
    threshold: 0,
  });

  sections.forEach(section => observer.observe(section));
}

/* ============================================================
   10. NEWSLETTER FORM
   ============================================================ */
function initNewsletterForm() {
  const newsletterBtn   = document.getElementById('newsletterBtn');
  const newsletterEmail = document.getElementById('newsletterEmail');
  if (!newsletterBtn || !newsletterEmail) return;

  newsletterBtn.addEventListener('click', () => {
    const email = newsletterEmail.value.trim();
    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address.');
      newsletterEmail.focus();
      return;
    }
    // Simulate subscription success
    showToast('Thank you for subscribing! Welcome to Ezmush Bakers.');
    newsletterEmail.value = '';
  });

  // Allow pressing Enter in the email field
  newsletterEmail.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') newsletterBtn.click();
  });
}

/* ============================================================
   11. CONTACT FORM - WhatsApp Integration
   ============================================================ */
function initContactForm() {
  const formSubmitBtn = document.getElementById('formSubmitBtn');
  if (!formSubmitBtn) return;

  formSubmitBtn.addEventListener('click', () => {
    const name  = document.getElementById('fname')?.value.trim();
    const phone = document.getElementById('fphone')?.value.trim();
    const city  = document.getElementById('fcity')?.value;
    const msg   = document.getElementById('fmsg')?.value.trim();

    // Validation
    if (!name) {
      showToast('Please enter your full name.');
      document.getElementById('fname')?.focus();
      return;
    }
    if (!phone) {
      showToast('Please enter your WhatsApp number.');
      document.getElementById('fphone')?.focus();
      return;
    }
    if (!city) {
      showToast('Please select your city.');
      return;
    }
    if (!msg) {
      showToast('Please describe your order or query.');
      document.getElementById('fmsg')?.focus();
      return;
    }

    // Build WhatsApp message from form
    const waMessage = `Assalam-o-Alaikum! My name is ${name}.\n\n` +
                      `Phone: ${phone}\nCity: ${city}\n\n` +
                      `Message: ${msg}\n\n` +
                      `(Sent from Ezmush Bakers website)`;

    window.open(`https://wa.me/923001234567?text=${encodeURIComponent(waMessage)}`, '_blank');

    showToast('Redirecting to WhatsApp...');

    // Clear form
    document.getElementById('fname').value = '';
    document.getElementById('fphone').value = '';
    document.getElementById('fcity').value = '';
    document.getElementById('fmsg').value = '';
  });
}

/* ============================================================
   12. GALLERY LIGHTBOX (Simple)
   ============================================================ */
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item img');
  if (!galleryItems.length) return;

  // Create lightbox elements
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.style.cssText = `
    position:fixed; inset:0; background:rgba(26,15,8,0.92); z-index:9999;
    display:flex; align-items:center; justify-content:center;
    opacity:0; pointer-events:none; transition:opacity 0.3s ease;
    backdrop-filter:blur(4px); cursor:zoom-out; padding:1rem;
  `;

  const lightboxImg = document.createElement('img');
  lightboxImg.style.cssText = `
    max-width:90vw; max-height:85vh; border-radius:12px;
    box-shadow:0 20px 80px rgba(0,0,0,0.6);
    transform:scale(0.9); transition:transform 0.35s ease;
    object-fit:contain;
  `;

  const closeLightbox = document.createElement('button');
  closeLightbox.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  closeLightbox.style.cssText = `
    position:absolute; top:1.5rem; right:1.5rem; width:44px; height:44px;
    background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2);
    border-radius:50%; display:flex; align-items:center; justify-content:center;
    color:#fff; font-size:1.2rem; cursor:pointer; transition:background 0.2s;
  `;
  closeLightbox.addEventListener('mouseenter', () => {
    closeLightbox.style.background = 'rgba(255,255,255,0.2)';
  });
  closeLightbox.addEventListener('mouseleave', () => {
    closeLightbox.style.background = 'rgba(255,255,255,0.1)';
  });

  lightbox.appendChild(lightboxImg);
  lightbox.appendChild(closeLightbox);
  document.body.appendChild(lightbox);

  // Open lightbox
  galleryItems.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.style.opacity = '1';
      lightbox.style.pointerEvents = 'all';
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        lightboxImg.style.transform = 'scale(1)';
      });
    });
  });

  // Close lightbox
  const closeLB = () => {
    lightbox.style.opacity = '0';
    lightbox.style.pointerEvents = 'none';
    lightboxImg.style.transform = 'scale(0.9)';
    document.body.style.overflow = '';
  };

  lightbox.addEventListener('click', (e) => {
    if (e.target !== lightboxImg) closeLB();
  });
  closeLightbox.addEventListener('click', closeLB);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLB();
  });
}

/* ============================================================
   13. TOAST NOTIFICATION
   ============================================================ */
let toastTimeout;

/**
 * Show a toast notification message.
 * @param {string} message - The message to display.
 * @param {number} [duration=3000] - Duration in milliseconds.
 */
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add('show');

  to
