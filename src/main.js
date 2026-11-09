import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { products, money } from './data/products.js';

gsap.registerPlugin(ScrollTrigger);

const productGrid = document.querySelector('#product-grid');
const productFilters = document.querySelector('#product-filters');
const cartDrawer = document.querySelector('#cart-drawer');
const cartItems = document.querySelector('#cart-items');
const cartEmpty = document.querySelector('#cart-empty');
const cartSummary = document.querySelector('#cart-summary');
const shippingProgressMessage = document.querySelector('#shipping-progress-message');
const shippingProgressTrack = document.querySelector('.shipping-progress-track');
const shippingProgressFill = document.querySelector('#shipping-progress-fill');
const overlay = document.querySelector('#overlay');
const searchPanel = document.querySelector('#search-panel');
const searchInput = document.querySelector('#search-input');
const searchResults = document.querySelector('#search-results');
const quickView = document.querySelector('#quick-view');
const quickViewContent = document.querySelector('#quick-view-content');
const toast = document.querySelector('#toast');
const mobileMenu = document.querySelector('#mobile-nav');
const menuToggle = document.querySelector('.menu-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelector('[data-year]').textContent = String(new Date().getFullYear());
const safeRead = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
let cart = safeRead('tayf-cart', []);
let wishlist = new Set(safeRead('tayf-wishlist', []));
let selectedColors = {};
let activePanel = '';
let activeProductFilter = 'all';
let toastTimer;
let productCardsTween;

const productById = id => products.find(product => product.id === id);
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const cartCount = () => cart.reduce((sum, item) => sum + item.qty, 0);
const selectedColorIndex = id => selectedColors[id] ?? 0;
const colorName = (product, index) => product.colorNames[index] ?? product.colorNames[0];
const deliveryThreshold = 8000;
const productFilterOptions = [
  { id: 'all', label: 'All pieces', matches: () => true },
  { id: 'clothing', label: 'Clothing', matches: product => product.type !== 'Accessories' },
  { id: 'accessories', label: 'Accessories', matches: product => product.type === 'Accessories' }
];

function persist() {
  try {
    localStorage.setItem('tayf-cart', JSON.stringify(cart));
    localStorage.setItem('tayf-wishlist', JSON.stringify([...wishlist]));
  } catch { /* Keep the demo usable when browser storage is unavailable. */ }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2500);
}

function renderProductFilters() {
  productFilters.innerHTML = productFilterOptions.map(option => {
    const count = products.filter(option.matches).length;
    return `<button class="product-filter" type="button" data-filter="${option.id}" aria-pressed="${activeProductFilter === option.id}">${option.label}<span>${String(count).padStart(2, '0')}</span></button>`;
  }).join('');
}

function renderProducts() {
  const activeOption = productFilterOptions.find(option => option.id === activeProductFilter) ?? productFilterOptions[0];
  const visibleProducts = products.filter(activeOption.matches);
  productGrid.innerHTML = visibleProducts.map((product, index) => `
    <article class="product-card reveal-up" data-product-card="${product.id}">
      <div class="product-media">
        <img class="product-photo primary" src="${product.image}" alt="${escapeHtml(product.name)} in ${escapeHtml(colorName(product, selectedColorIndex(product.id)))}" loading="${index < 4 ? 'eager' : 'lazy'}" />
        <img class="product-photo alternate" src="${product.alternate}" alt="" loading="lazy" />
        ${product.badge ? `<span class="product-badge">${escapeHtml(product.badge)}</span>` : ''}
        <div class="product-actions"><button class="mini-action quick-trigger" data-quick="${product.id}" aria-label="Quick view ${escapeHtml(product.name)}">↗</button><button class="mini-action wishlist-trigger" data-wishlist="${product.id}" aria-label="${wishlist.has(product.id) ? 'Remove from' : 'Add to'} wishlist: ${escapeHtml(product.name)}" aria-pressed="${wishlist.has(product.id)}">${wishlist.has(product.id) ? '♥' : '♡'}</button></div>
        <div class="color-dots" aria-label="Available colors">${product.colors.map((color, colorIndex) => `<button class="color-dot" data-color="${product.id}" data-color-index="${colorIndex}" style="--swatch:${color}" aria-label="${escapeHtml(colorName(product, colorIndex))}" aria-pressed="${selectedColorIndex(product.id) === colorIndex}"></button>`).join('')}</div>
        <button class="quick-add" data-add="${product.id}">Quick add <span aria-hidden="true">＋</span></button>
      </div>
      <div class="product-info"><div class="product-info-top"><span class="product-name">${escapeHtml(product.name)}</span><span class="product-price">${product.oldPrice ? `<del>${money(product.oldPrice)}</del>` : ''}${money(product.price)}</span></div><p class="product-type">${escapeHtml(product.type)}</p></div>
    </article>`).join('');
  if (!reducedMotion) animateProductCards();
}

function animateProductCards() {
  productCardsTween?.scrollTrigger?.kill();
  productCardsTween?.kill();
  const cards = gsap.utils.toArray('.product-card.reveal-up');
  productCardsTween = gsap.fromTo(cards, { autoAlpha: 0, y: 64, scale: .965 }, {
    autoAlpha: 1, y: 0, scale: 1, ease: 'none', stagger: { each: .08, from: 'start' },
    scrollTrigger: { trigger: '#new-arrivals', start: 'top 92%', end: 'bottom 58%', scrub: .8, invalidateOnRefresh: true }
  });
}

function updateCounts() {
  document.querySelectorAll('.cart-count').forEach(node => { node.textContent = String(cartCount()); });
  document.querySelector('.cart-trigger')?.setAttribute('aria-label', `Shopping bag, ${cartCount()} ${cartCount() === 1 ? 'item' : 'items'}`);
}

function updateShippingProgress(subtotal) {
  const remaining = Math.max(0, deliveryThreshold - subtotal);
  const progress = Math.min(100, (subtotal / deliveryThreshold) * 100);
  const message = remaining === 0 ? 'Complimentary delivery unlocked' : `${money(remaining)} to complimentary delivery`;
  shippingProgressMessage.textContent = message;
  shippingProgressFill.style.width = `${progress}%`;
  shippingProgressTrack.setAttribute('aria-valuenow', String(Math.min(deliveryThreshold, Math.round(subtotal))));
  shippingProgressTrack.setAttribute('aria-valuetext', remaining === 0 ? message : `${money(remaining)} remaining for complimentary delivery`);
}

function renderCart() {
  updateCounts();
  const visibleItems = cart.map(item => ({ ...item, product: productById(item.id) })).filter(item => item.product);
  cart = visibleItems.map(({ id, qty, colorIndex }) => ({ id, qty, colorIndex }));
  const subtotal = visibleItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  updateShippingProgress(subtotal);
  if (!visibleItems.length) {
    cartItems.innerHTML = '';
    cartEmpty.classList.add('is-empty');
    cartSummary.classList.add('is-hidden');
    document.querySelector('#cart-subtotal').textContent = money(0);
    return;
  }
  cartEmpty.classList.remove('is-empty');
  cartSummary.classList.remove('is-hidden');
  cartItems.innerHTML = visibleItems.map(({ product, qty, colorIndex }) => `
    <article class="cart-line" data-cart-line="${product.id}::${colorIndex}">
      <div class="cart-line-image"><img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy" /></div>
      <div class="cart-line-detail"><span class="cart-line-name">${escapeHtml(product.name)}</span><span class="cart-line-color">${escapeHtml(colorName(product, colorIndex))}</span><div class="quantity"><button data-qty="-1" data-key="${product.id}::${colorIndex}" aria-label="Decrease quantity">−</button><span>${qty}</span><button data-qty="1" data-key="${product.id}::${colorIndex}" aria-label="Increase quantity">＋</button></div></div>
      <div><span class="cart-line-price">${money(product.price * qty)}</span><button class="remove-line" data-remove="${product.id}::${colorIndex}">Remove</button></div>
    </article>`).join('');
  document.querySelector('#cart-subtotal').textContent = money(subtotal);
  persist();
}

function addToCart(id, colorIndex = selectedColorIndex(id)) {
  const product = productById(id);
  if (!product) return;
  const existing = cart.find(item => item.id === id && item.colorIndex === colorIndex);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1, colorIndex });
  persist();
  renderCart();
  showToast(`${product.name} added to your bag`);
}

function syncOverlay() {
  const hasPanel = Boolean(activePanel);
  overlay.hidden = !hasPanel;
  document.body.classList.toggle('locked', hasPanel || mobileMenu.classList.contains('is-open'));
  requestAnimationFrame(() => overlay.classList.toggle('is-visible', hasPanel));
  cartDrawer.classList.toggle('is-open', activePanel === 'cart');
  cartDrawer.setAttribute('aria-hidden', String(activePanel !== 'cart'));
  searchPanel.classList.toggle('is-open', activePanel === 'search');
  searchPanel.setAttribute('aria-hidden', String(activePanel !== 'search'));
  quickView.classList.toggle('is-open', activePanel === 'quick');
  quickView.setAttribute('aria-hidden', String(activePanel !== 'quick'));
  if (!hasPanel) overlay.classList.remove('is-visible');
}

function openPanel(name) {
  closeMobileMenu();
  activePanel = name;
  syncOverlay();
  if (name === 'cart') renderCart();
  if (name === 'search') {
    renderSearch('');
    window.setTimeout(() => searchInput.focus(), 80);
  }
}

function closePanels() {
  activePanel = '';
  syncOverlay();
}

function toggleMobileMenu() {
  const open = !mobileMenu.classList.contains('is-open');
  mobileMenu.classList.toggle('is-open', open);
  mobileMenu.inert = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('locked', open || Boolean(activePanel));
}

function closeMobileMenu() {
  mobileMenu.classList.remove('is-open');
  mobileMenu.inert = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
  document.body.classList.toggle('locked', Boolean(activePanel));
}

function renderSearch(query) {
  const normalized = query.trim().toLowerCase();
  const matches = products.filter(product => !normalized || `${product.name} ${product.type} ${product.colorNames.join(' ')}`.toLowerCase().includes(normalized));
  searchResults.innerHTML = matches.length ? matches.slice(0, 8).map(product => `
    <button class="search-result" data-quick="${product.id}" aria-label="View ${escapeHtml(product.name)}"><img src="${product.image}" alt="" loading="lazy" /><span><strong>${escapeHtml(product.name)}</strong><span>${money(product.price)}</span></span></button>`).join('') : '<p class="search-empty">No pieces found. Try another word.</p>';
}

function openQuickView(id) {
  const product = productById(id);
  if (!product) return;
  quickViewContent.innerHTML = `<div class="quick-view-image"><img src="${product.image}" alt="${escapeHtml(product.name)}" /></div><div class="quick-view-detail"><p class="eyebrow">${escapeHtml(product.type)} · TAYF / CAIRO</p><h2 id="quick-view-title">${escapeHtml(product.name)}</h2><div class="quick-view-price">${product.oldPrice ? `<del>${money(product.oldPrice)}</del> ` : ''}${money(product.price)}</div><p>${escapeHtml(product.description)}</p><div class="quick-colors" aria-label="Choose a color">${product.colors.map((color, index) => `<button data-quick-color="${index}" style="background:${color}" aria-label="${escapeHtml(colorName(product, index))}" aria-pressed="${selectedColorIndex(id) === index}"></button>`).join('')}</div><button class="button button-dark" data-add="${product.id}">Add to bag <span>＋</span></button></div>`;
  openPanel('quick');
}

document.addEventListener('click', event => {
  const target = event.target.closest('button, a');
  if (!target) return;
  if (target.matches('[data-filter]')) {
    activeProductFilter = target.dataset.filter;
    productFilters.querySelectorAll('[data-filter]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === activeProductFilter));
    });
    renderProducts();
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return;
  }
  if (target.matches('.menu-toggle')) { toggleMobileMenu(); return; }
  if (target.matches('.cart-trigger')) { openPanel('cart'); return; }
  if (target.matches('.search-trigger')) { openPanel('search'); return; }
  if (target.matches('.account-trigger')) { showToast('Your TAYF account is coming soon.'); return; }
  if (target.matches('[data-close]') || target === overlay) { closePanels(); return; }
  if (target.closest('.mobile-nav a')) { closeMobileMenu(); return; }
  if (target.matches('.checkout-button')) { showToast('Checkout is a front-end demo. Your bag is saved.'); return; }
  if (target.matches('[data-add]')) { addToCart(target.dataset.add); return; }
  if (target.matches('[data-quick]')) { openQuickView(target.dataset.quick); return; }
  if (target.matches('[data-wishlist]')) {
    const id = target.dataset.wishlist;
    wishlist.has(id) ? wishlist.delete(id) : wishlist.add(id);
    persist();
    renderProducts();
    showToast(wishlist.has(id) ? 'Saved to your wishlist' : 'Removed from your wishlist');
    return;
  }
  if (target.matches('[data-color]')) {
    selectedColors[target.dataset.color] = Number(target.dataset.colorIndex);
    const card = target.closest('.product-card');
    card.querySelectorAll('[data-color]').forEach(button => button.setAttribute('aria-pressed', String(button === target)));
    const product = productById(target.dataset.color);
    card.querySelector('.product-photo.primary').alt = `${product.name} in ${colorName(product, selectedColorIndex(product.id))}`;
    return;
  }
  if (target.matches('[data-quick-color]')) {
    const parent = target.closest('.quick-view-detail');
    parent.querySelectorAll('[data-quick-color]').forEach(button => button.setAttribute('aria-pressed', String(button === target)));
    selectedColors[parent.querySelector('[data-add]').dataset.add] = Number(target.dataset.quickColor);
    return;
  }
  if (target.matches('[data-qty]')) {
    const [id, color] = target.dataset.key.split('::');
    const item = cart.find(entry => entry.id === id && entry.colorIndex === Number(color));
    if (!item) return;
    item.qty += Number(target.dataset.qty);
    if (item.qty <= 0) cart = cart.filter(entry => entry !== item);
    persist(); renderCart(); return;
  }
  if (target.matches('[data-remove]')) {
    const [id, color] = target.dataset.remove.split('::');
    cart = cart.filter(item => !(item.id === id && item.colorIndex === Number(color)));
    persist(); renderCart(); return;
  }
});

overlay.addEventListener('click', closePanels);
searchInput.addEventListener('input', () => renderSearch(searchInput.value));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { closePanels(); closeMobileMenu(); }
});
document.querySelector('#newsletter-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = document.querySelector('#newsletter-email');
  const feedback = document.querySelector('#newsletter-feedback');
  if (!input.value.trim() || !input.validity.valid) {
    feedback.textContent = 'Please enter a valid email address so we know where to write.';
    feedback.className = 'form-note is-error';
    input.focus();
    return;
  }
  feedback.textContent = 'You’re on the list. Look out for a little TAYF soon.';
  feedback.className = 'form-note is-success';
  event.currentTarget.reset();
});

renderProductFilters();
renderProducts();
renderCart();

const lenis = reducedMotion ? null : new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: .85, touchMultiplier: 1.5 });
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

if (!reducedMotion) {
  const entrance = gsap.timeline({ delay: .15 });
  entrance.fromTo('.announcement span, .announcement a', { y: -8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .55, stagger: .08, ease: 'power2.out' })
    .fromTo('.site-header > *, .hero-meta', { y: -12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .7, stagger: .06, ease: 'power2.out' }, '-=.2')
    .fromTo('.hero-eyebrow', { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .7, ease: 'power3.out' }, '-=.24')
    .fromTo('.hero h1', { y: 34, autoAlpha: 0, clipPath: 'inset(0 0 100% 0)' }, { y: 0, autoAlpha: 1, clipPath: 'inset(0)', duration: 1.05, ease: 'power3.out' }, '-=.18')
    .fromTo('.hero-description, .hero-arabic, .hero-links', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .7, stagger: .1, ease: 'power2.out' }, '-=.38')
    .fromTo('.scroll-cue, .hero-index, .hero-side-note', { autoAlpha: 0 }, { autoAlpha: 1, duration: .65, stagger: .08 }, '-=.2');

  const cinematicOpening = gsap.timeline({
    scrollTrigger: {
      trigger: '.hero', start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * (window.innerWidth > 1000 ? 1.15 : .95))}`,
      scrub: .9, pin: true, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true,
      onEnter: () => document.querySelector('.site-header').classList.add('is-cinematic'),
      onEnterBack: () => document.querySelector('.site-header').classList.add('is-cinematic'),
      onLeave: () => {
        const header = document.querySelector('.site-header');
        header.classList.remove('is-cinematic');
        header.classList.add('is-scrolled');
      },
      onLeaveBack: () => document.querySelector('.site-header').classList.remove('is-cinematic', 'is-scrolled')
    }
  });
  cinematicOpening.to('.hero-image', { left: '0%', width: '100%', ease: 'none' }, 0)
    .to('.hero-copy', { xPercent: -13, y: -26, scale: .92, autoAlpha: 0, ease: 'none' }, 0)
    .to('.hero-meta, .hero-side-note, .hero-index, .scroll-cue', { y: -16, autoAlpha: 0, ease: 'none' }, 0)
    .fromTo('.hero-scroll-lockup', { xPercent: -50, y: 68, scale: .82, autoAlpha: 0 }, { xPercent: -50, y: 0, scale: 1, autoAlpha: 1, ease: 'none' }, .15)
    .to('.hero-shade', { autoAlpha: .58, ease: 'none' }, .24);

  const scrubReveal = (element, distance = 44) => gsap.fromTo(element, { autoAlpha: 0, y: distance }, {
    autoAlpha: 1, y: 0, ease: 'none',
    scrollTrigger: { trigger: element, start: 'top 92%', end: 'top 62%', scrub: .75, invalidateOnRefresh: true }
  });

  gsap.utils.toArray('.reveal-up:not(.product-card):not(.collection-card):not(.social-tile):not(.campaign-copy):not(.campaign-top):not(.campaign-bottom)').forEach(element => scrubReveal(element));

  const collectionCards = gsap.utils.toArray('.collection-card');
  gsap.fromTo(collectionCards, {
    autoAlpha: .2,
    x: index => window.innerWidth > 680 ? [-30, 26, 20][index] : 0,
    y: index => [44, 74, 56][index],
    scale: .97
  }, {
    autoAlpha: 1, x: 0, y: 0, scale: 1, ease: 'none', stagger: { each: .12, from: 'start' },
    scrollTrigger: { trigger: '.collection-grid', start: 'top 90%', end: 'center 40%', scrub: .85, invalidateOnRefresh: true }
  });
  gsap.fromTo('.social-tile', { autoAlpha: .22, y: 72, scale: .97 }, {
    autoAlpha: 1, y: 0, scale: 1, ease: 'none', stagger: { each: .075, from: 'start' },
    scrollTrigger: { trigger: '.social-grid', start: 'top 92%', end: 'bottom 62%', scrub: .8, invalidateOnRefresh: true }
  });

  gsap.utils.toArray('.intro-statement, .section-heading h2, .campaign-copy h2, .story-copy h2, .newsletter h2').forEach(heading => {
    gsap.fromTo(heading, { clipPath: 'inset(0 0 100% 0)', y: 24 }, {
      clipPath: 'inset(0)', y: 0, ease: 'none',
      scrollTrigger: { trigger: heading, start: 'top 91%', end: 'top 55%', scrub: .8, invalidateOnRefresh: true }
    });
  });

  gsap.utils.toArray('.image-reveal:not(.hero-image)').forEach(image => {
    const reveal = gsap.timeline({
      scrollTrigger: { trigger: image, start: 'top 92%', end: 'top 38%', scrub: .8, invalidateOnRefresh: true }
    });
    reveal.fromTo(image, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0)', ease: 'none' }, 0);
    const imageContent = image.querySelector('img');
    if (imageContent && image.matches('.collection-image, .story-image')) {
      reveal.fromTo(imageContent, { scale: 1.075 }, { scale: 1, ease: 'none' }, 0);
    }
  });

  gsap.fromTo('.story-stamp', { autoAlpha: 0, scale: .78, rotation: -13 }, {
    autoAlpha: 1, scale: 1, rotation: 9, ease: 'none',
    scrollTrigger: { trigger: '.story', start: 'top 82%', end: 'center 56%', scrub: .8, invalidateOnRefresh: true }
  });

  gsap.fromTo('.newsletter-mark', { yPercent: 22, rotation: -9 }, {
    yPercent: -10, rotation: 0, ease: 'none',
    scrollTrigger: { trigger: '.newsletter', start: 'top bottom', end: 'bottom top', scrub: .85, invalidateOnRefresh: true }
  });

  gsap.fromTo('.hero-image img', { scale: 1.035, yPercent: 0 }, {
    scale: 1.16, yPercent: 7, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .8, invalidateOnRefresh: true }
  });
  gsap.to('.scroll-progress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: () => ScrollTrigger.maxScroll(window), scrub: .25 } });
  const editorialMotion = gsap.matchMedia();
  editorialMotion.add('(min-width: 1001px)', () => {
    const campaign = gsap.timeline({
      scrollTrigger: { trigger: '.campaign', start: 'top top', end: '+=58%', scrub: .9, pin: true, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true }
    });
    campaign.fromTo('.campaign-image img', { scale: 1.06, yPercent: -2 }, { scale: 1.22, yPercent: 5, ease: 'none' }, 0)
      .fromTo('.campaign-copy', { y: 56, autoAlpha: .35 }, { y: 0, autoAlpha: 1, ease: 'none' }, 0)
      .fromTo('.campaign-top, .campaign-bottom', { autoAlpha: .35 }, { autoAlpha: 1, ease: 'none' }, .12);
  });
  editorialMotion.add('(max-width: 1000px)', () => {
    gsap.utils.toArray('.campaign-copy, .campaign-top, .campaign-bottom').forEach(element => scrubReveal(element, 30));
    gsap.fromTo('.campaign-image img', { scale: 1.06, yPercent: -2 }, {
      scale: 1.16, yPercent: 5, ease: 'none',
      scrollTrigger: { trigger: '.campaign', start: 'top bottom', end: 'bottom top', scrub: .85, invalidateOnRefresh: true }
    });
  });
} else {
  document.querySelectorAll('.reveal-up').forEach(element => { element.style.opacity = '1'; element.style.transform = 'none'; });
  document.querySelectorAll('.image-reveal').forEach(element => { element.style.clipPath = 'none'; });
}

window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

// Sticky navigation also has a native scroll fallback if reduced motion is enabled.
window.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  if (!header.classList.contains('is-cinematic')) header.classList.toggle('is-scrolled', window.scrollY > window.innerHeight - 100);
}, { passive: true });
