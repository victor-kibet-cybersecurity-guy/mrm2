const PHONE='0750527506', INTL='254750527506';

// Round price to whole integer e.g., KSh 875 instead of KSh 875.34
const money = n => 'KSh ' + Math.round(n).toLocaleString('en-KE');

const esc = s => String(s ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

const wa = msg => `https://wa.me/${INTL}?text=${encodeURIComponent(msg)}`;

const PRODUCT_IMAGE_MAP = {
  'ordinary-30g-glossy': 'dumuzaz-30g', 'ordinary-28g-glossy': 'dumuzaz-28g',
  'roman-tiles-30g-glossy': 'roman-tile-30g-glossy', 'roman-tiles-28g-glossy': 'roman-tile-28g-glossy',
  'roman-tiles-28g-matte': 'roman-tile-28g-matte', 'roman-tiles-30g-matte': 'roman-tile-30g-glossy',
  'pvc-downpipe': 'rainwater-downpipe', 'roofing-nails-1kg': 'roofing-nails',
  'roof-sealant-300ml': 'roof-sealant', 'polycarbonate-clear-6mm': 'roofing-placeholder',
  'transparent-corrugated': 'roofing-placeholder', 'foil-insulation-10m': 'roofing-placeholder'
};
function getProductImage(p, mobile = false) {
  const base = PRODUCT_IMAGE_MAP[p.id] || p.id;
  return `images/${base}${mobile ? '-mobile' : ''}.webp`;
}

// SVG Data URI fallback generator for product cards if SVG file missing
function getProductSvg(p) {
  const colorMap = {
    'Charcoal': '#3a4148',
    'Tile Red': '#b84c36',
    'Maroon': '#6f2634',
    'Chocolate': '#674838',
    'Brick Red': '#a14538',
    'Sky Blue': '#386a9b',
    'Green': '#3f654e',
    'Silver': '#a3acb5',
    'Clear': '#e2e8f0'
  };
  const primaryColor = colorMap[p.colours?.[0]] || '#3a4148';
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
    <rect width="400" height="300" fill="#f8fafc"/>
    <rect x="30" y="40" width="340" height="220" rx="12" fill="${primaryColor}"/>
    <path d="M30 80 L370 80 M30 120 L370 120 M30 160 L370 160 M30 200 L370 200" stroke="#ffffff" stroke-width="2" opacity="0.3"/>
    <rect x="45" y="210" width="100" height="32" rx="6" fill="rgba(255,255,255,0.2)"/>
    <text x="95" y="231" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">${esc(p.gauge || '28G')}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function productCard(p) {
  const colorSwatches = (p.colours || []).map(c => {
    const hex = { Charcoal:'#3a4148', Maroon:'#6f2634', 'Tile Red':'#b84c36', Chocolate:'#674838', Green:'#3f654e', 'Sky Blue':'#386a9b', Silver:'#a3acb5' }[c] || '#64748b';
    return `<span class="swatch-mini" style="background:${hex}" title="${esc(c)}"></span>`;
  }).join(' ');

  const quoteMsg = `Hello MRM Roofing Dealer Kenya, I am interested in ${p.name} (${p.gauge}, ${p.finish}). Please send today's confirmed price, available colours and delivery estimate.`;

  // Product cards are injected after the page's reveal observer is registered.
  // Mark them visible immediately so they cannot remain transparent on mobile.
  return `<article class="card product-card reveal visible">
    <button class="fav" data-wish="${p.id}" aria-label="Add ${esc(p.name)} to wishlist">♡</button>
    <div class="product-card-img-wrap">
      <img loading="lazy" decoding="async" src="${getProductImage(p)}" srcset="${getProductImage(p, true)} 640w, ${getProductImage(p)} 1200w" sizes="(max-width:767px) 100vw, 25vw" onerror="this.onerror=null;this.src='${getProductSvg(p)}'" alt="${esc(p.name)} MRM roofing sheet preview">
    </div>
    <div class="card-pad">
      <span class="tag">${esc(p.category)}</span>
      <h3>${esc(p.name)}</h3>
      <div class="meta">
        <span class="chip">${esc(p.gauge)}</span>
        <span class="chip">${esc(p.profile || 'Roof Profile')}</span>
        <span class="chip">${esc(p.finish)}</span>
      </div>
      <div class="color-swatches-row">
        <small class="small">Colours:</small> ${colorSwatches}
      </div>
      <div class="price">${money(p.price)} <small>/ ${esc(p.unit)}</small></div>
      <div class="price-note">Reference price. Request today's quotation.</div>
      <div class="product-actions">
        <a class="btn btn-primary" href="product-details.html?id=${encodeURIComponent(p.id)}">View Details</a>
        <a class="btn btn-orange" href="${wa(quoteMsg)}" target="_blank" rel="noopener">Get Quote</a>
      </div>
    </div>
  </article>`;
}

function bindActions() {
  document.querySelectorAll('[data-wish]').forEach(b => {
    let ids = JSON.parse(localStorage.getItem('wishlist') || '[]');
    b.classList.toggle('active', ids.includes(b.dataset.wish));
    b.addEventListener('click', () => {
      let a = JSON.parse(localStorage.getItem('wishlist') || '[]');
      a = a.includes(b.dataset.wish) ? a.filter(x => x !== b.dataset.wish) : [...a, b.dataset.wish];
      localStorage.setItem('wishlist', JSON.stringify(a));
      b.classList.toggle('active');
    });
  });

  document.querySelectorAll('[data-quote]').forEach(b => {
    b.addEventListener('click', () => addQuote(b.dataset.quote));
  });
}

function addQuote(id) {
  let q = JSON.parse(localStorage.getItem('quoteCart') || '[]');
  if (!q.some(x => x.id === id)) q.push({ id, qty: 1, length: 3, colour: '' });
  localStorage.setItem('quoteCart', JSON.stringify(q));
  location.href = 'contact.html#quote-cart';
}

// Dynamic Meta & SEO manager
function updateDynamicPageMeta(options = {}) {
  if (typeof window.updateSEO === 'function') {
    window.updateSEO(options);
  }
  if (window.SEOManager && typeof window.SEOManager.update === 'function') {
    window.SEOManager.update();
  }
}

// Expose globally
window.updateDynamicPageMeta = updateDynamicPageMeta;

// Back to Top button scroll handler
function setupBackToTop() {
  const totopBtns = document.querySelectorAll('.totop');
  if (!totopBtns.length) return;

  function handleScroll() {
    const hero = document.querySelector('.hero, .page-hero');
    let threshold = 250;
    if (hero) {
      const rect = hero.getBoundingClientRect();
      const heroBottom = window.scrollY + rect.bottom;
      threshold = Math.max(heroBottom - 50, 180);
    }
    const isPastHero = window.scrollY > threshold;
    totopBtns.forEach(btn => {
      btn.classList.toggle('show', isPastHero);
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  totopBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  });
}

// Mobile Slide-in Navigation & Nested Accordions
function setupMobileNavAndAccordions() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!menuToggle || !navLinks) return;

  // Create or retrieve backdrop element
  let backdrop = document.querySelector('.nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);
  }

  function closeNav() {
    navLinks.classList.remove('open');
    menuToggle.classList.remove('active');
    menuToggle.textContent = '\u2630';
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
    menuToggle.innerHTML = '☰';
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '\u2630';
    backdrop.classList.remove('show');
    document.body.classList.remove('nav-open');
  }

  function openNav() {
    navLinks.classList.add('open');
    menuToggle.classList.add('active');
    menuToggle.textContent = '\u2715';
    menuToggle.setAttribute('aria-label', 'Close navigation menu');
    menuToggle.innerHTML = '✕';
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.textContent = '\u2715';
    backdrop.classList.add('show');
    document.body.classList.add('nav-open');
  }

  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (navLinks.classList.contains('open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  backdrop.addEventListener('click', closeNav);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeNav();
    }
  });

  // Setup top-level nav items and nested mega menu accordions
  const navItems = navLinks.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const mainLink = item.querySelector(':scope > a');
    const subMenu = item.querySelector('.mega-menu, .dropdown-menu');

    if (mainLink && subMenu) {
      // Add or format chevron indicator
      if (!mainLink.querySelector('.nav-item-chevron')) {
        const chevron = document.createElement('span');
        chevron.className = 'nav-item-chevron';
        chevron.textContent = '▾';
        mainLink.innerHTML = mainLink.innerHTML.replace('▾', '').trim();
        mainLink.appendChild(chevron);
      }

      mainLink.addEventListener('click', (e) => {
        if (window.innerWidth <= 1050) {
          // Prevent navigating away immediately when tapping dropdown header on mobile
          e.preventDefault();
          e.stopPropagation();
          const isOpen = item.classList.contains('open');

          // Close other top level nav-items
          navItems.forEach(other => {
            if (other !== item) other.classList.remove('open');
          });

          item.classList.toggle('open', !isOpen);
        }
      });
    }

    // Setup nested accordions inside mega-menu
    const megaMenu = item.querySelector('.mega-menu');
    if (megaMenu) {
      const megaCols = megaMenu.querySelectorAll('.mega-col');
      megaCols.forEach(col => {
        const titleEl = col.querySelector('.mega-title, h4');
        if (titleEl) {
          // Add toggle icon if not present
          if (!titleEl.querySelector('.mega-col-icon')) {
            const icon = document.createElement('span');
            icon.className = 'mega-col-icon';
            icon.textContent = '+';
            titleEl.appendChild(icon);
          }

          // Wrap child links in .mega-col-links if not already wrapped
          let linksWrapper = col.querySelector('.mega-col-links');
          if (!linksWrapper) {
            linksWrapper = document.createElement('div');
            linksWrapper.className = 'mega-col-links';
            const links = Array.from(col.querySelectorAll('a'));
            links.forEach(link => linksWrapper.appendChild(link));
            col.appendChild(linksWrapper);
          }

          titleEl.addEventListener('click', (e) => {
            if (window.innerWidth <= 1050) {
              e.preventDefault();
              e.stopPropagation();
              const isColOpen = col.classList.contains('open');

              // Toggle column accordion
              col.classList.toggle('open', !isColOpen);
            }
          });
        }
      });
    }
  });

  // Close nav drawer when clicking direct navigation links (that aren't accordions)
  navLinks.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && !link.closest('.nav-item > a') && !link.closest('.mega-title, h4')) {
      closeNav();
    }
  });
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  try {
    localStorage.setItem('mrm_theme', isDark ? 'dark' : 'light');
  } catch (e) {}

  document.querySelectorAll('.theme-toggle').forEach(btn => {
    const icon = btn.querySelector('.theme-icon');
    const label = btn.querySelector('.theme-label');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
    if (label) label.textContent = isDark ? 'Light' : 'Dark';
    btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    btn.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  });
}

function initTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem('mrm_theme');
  } catch (e) {}
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(currentTheme);
}

// Initialize theme state immediately to prevent layout / color flash
initTheme();

function setupThemeToggleUI() {
  const navActions = document.querySelectorAll('.nav-actions');
  navActions.forEach(actions => {
    if (!actions.querySelector('.theme-toggle')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'theme-toggle';
      toggleBtn.innerHTML = '<span class="theme-icon">🌙</span><span class="theme-label">Dark</span>';

      toggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });

      actions.insertBefore(toggleBtn, actions.firstChild);
    }
  });

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  applyTheme(isDark ? 'dark' : 'light');
}

function setupSocialLinks() {
  const socialIconsHTML = `
    <div class="social-links" aria-label="Social Media">
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Facebook">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </a>
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Instagram">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
      </a>
      <a href="https://x.com" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Twitter / X">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
    </div>
  `;

  // Social links are intentionally limited to the footer.
  const footerGrids = document.querySelectorAll('.footer-grid');
  footerGrids.forEach(grid => {
    const firstCol = grid.firstElementChild;
    if (firstCol && !firstCol.querySelector('.footer-social')) {
      const socialDiv = document.createElement('div');
      socialDiv.className = 'footer-social';
      socialDiv.innerHTML = `
        <span class="social-label">Follow Us:</span>
        ${socialIconsHTML}
      `;
      firstCol.appendChild(socialDiv);
    }
  });
}

function setupFloatingWhatsAppIcon() {
  const whatsappIcon = `
    <svg viewBox="0 0 448 512" role="img" aria-hidden="true" focusable="false">
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L.1 480l117.7-30.9c32.4 17.7 68.9 27 106 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.8l-6.7-4-69.8 18.3L72 359.1l-4.4-7c-18.5-29.4-28.2-63.4-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.7-186.6 184.7zm101.2-138.2c-5.5-2.8-32.8-16.1-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.8-10.5-6.6z"/>
    </svg>`;

  document.querySelectorAll('.float-btn.whatsapp').forEach(link => {
    link.innerHTML = whatsappIcon;
    link.setAttribute('title', 'Chat with us on WhatsApp');
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
}

function setupFAQAccordion() {
  const accordionButtons = document.querySelectorAll('.accordion-btn');
  accordionButtons.forEach(btn => {
    // Skip nav-item accordions managed by mobile drawer
    if (btn.closest('.nav-item')) return;

    const item = btn.closest('.accordion-item');
    if (!item) return;

    const panel = item.querySelector('.accordion-panel');
    const isInitiallyOpen = item.classList.contains('open');

    btn.setAttribute('aria-expanded', isInitiallyOpen ? 'true' : 'false');
    if (panel) {
      panel.setAttribute('aria-hidden', isInitiallyOpen ? 'false' : 'true');
    }

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Toggle state on current accordion item
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      if (panel) {
        panel.setAttribute('aria-hidden', !isOpen ? 'false' : 'true');
      }
    });
  });
}

function normalizeSiteChrome() {
  const nested = /\/(counties|locations)\//.test(location.pathname.replace(/\\/g, '/'));
  const root = nested ? '../' : '';
  const headerNav = document.querySelector('.site-header .nav');

  document.querySelectorAll('.brand-text > span:first-child').forEach(name => {
    name.textContent = 'MRM Roofing Dealer Kenya';
  });
  document.querySelectorAll('.brand-text').forEach(brand => {
    if (!brand.querySelector('.brand-subtitle')) {
      const subtitle = document.createElement('small');
      subtitle.className = 'brand-subtitle';
      subtitle.textContent = 'Supplying MRM roofing products in Kenya.';
      brand.appendChild(subtitle);
    }
  });

  let navActions = headerNav?.querySelector('.nav-actions');
  if (headerNav && !navActions) {
    navActions = document.createElement('div');
    navActions.className = 'nav-actions';
    navActions.innerHTML = `<a class="btn btn-outline" href="https://wa.me/${INTL}" target="_blank" rel="noopener">WhatsApp</a>`;
    headerNav.appendChild(navActions);
  }

  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle && !menuToggle.hasAttribute('aria-expanded')) {
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  if (!document.querySelector('.floating')) {
    document.body.insertAdjacentHTML('beforeend', `<div class="floating">
      <a class="float-btn whatsapp" href="https://wa.me/${INTL}" aria-label="WhatsApp ${PHONE}" target="_blank" rel="noopener">WA</a>
      <a class="float-btn call" href="tel:+${INTL}" aria-label="Call ${PHONE}">☎</a>
      <button class="float-btn totop" type="button" aria-label="Back to top">↑</button>
    </div>`);
  }

  let mobileNav = document.querySelector('.mobile-bottom');
  if (!mobileNav) {
    mobileNav = document.createElement('nav');
    mobileNav.className = 'mobile-bottom';
    mobileNav.setAttribute('aria-label', 'Mobile navigation');
    document.body.appendChild(mobileNav);
  }
  mobileNav.innerHTML = `
    <a href="${root}index.html"><span aria-hidden="true">⌂</span>Home</a>
    <a href="${root}products.html"><span aria-hidden="true">▦</span>Products</a>
    <a class="m-quote" href="${root}contact.html#smart-quote"><span aria-hidden="true">＋</span>Quote</a>
    <a class="m-wa" href="https://wa.me/${INTL}" target="_blank" rel="noopener"><span aria-hidden="true">●</span>WhatsApp</a>
    <a class="m-call" href="tel:+${INTL}"><span aria-hidden="true">☎</span>Call</a>`;

  const footer = document.querySelector('.footer');
  if (footer) {
    footer.innerHTML = `<div class="container">
      <div class="footer-intro">
        <a class="brand" href="${root}index.html" aria-label="MRM Roofing Dealer Kenya home"><span class="brand-mark">MRM</span><span class="brand-text"><span>MRM Roofing Dealer Kenya</span><small class="brand-subtitle">Supplying MRM roofing products in Kenya.</small></span></a>
        <p><strong>Phone:</strong> <a href="tel:+${INTL}">${PHONE}</a> &nbsp; <strong>WhatsApp:</strong> <a href="https://wa.me/${INTL}">${PHONE}</a> &nbsp; <strong>Hours:</strong> Mon–Sat, 8:00–17:30</p>
      </div>
      <div class="footer-grid footer-links-grid">
        <div><h3>Products</h3><a href="${root}products.html">Roofing Sheets</a><a href="${root}products.html?q=Versatile">Versatile</a><a href="${root}products.html?q=Orientile">Orientile</a><a href="${root}products.html?q=Covermax">Covermax</a><a href="${root}products.html?q=Resincot">Resincot</a></div>
        <div><h3>Customer Support</h3><a href="${root}contact.html#smart-quote">Get Roofing Quote</a><a href="${root}faq.html">Frequently Asked Questions</a><a href="${root}delivery.html">Delivery Information</a><a href="${root}index.html#roof-calculator">Roofing Calculator</a></div>
        <div><h3>Locations</h3><a href="${root}locations/nairobi.html">Nairobi</a><a href="${root}locations/mombasa.html">Mombasa</a><a href="${root}locations/nakuru.html">Nakuru</a><a href="${root}locations/eldoret.html">Eldoret</a><a href="${root}locations/kisumu.html">Kisumu</a></div>
        <div><h3>Company</h3><a href="${root}about.html">About This Dealer</a><a href="${root}about.html#privacy-policy">Privacy Policy</a><a href="${root}about.html#terms">Terms</a><a href="${root}delivery.html#policy">Delivery Policy</a><a href="${root}contact.html#terms">Quotation Terms</a></div>
      </div>
      <div class="footer-bottom"><p>© <span data-year></span> MRM Roofing Dealer Kenya.</p></div>
    </div>`;
  }

  if (/\/about\.html$/i.test(location.pathname) && !document.querySelector('#privacy-policy')) {
    document.querySelector('main')?.insertAdjacentHTML('beforeend', `<section class="section alt" id="privacy-policy"><div class="container grid grid-2"><article class="card card-pad"><h2>Privacy Policy</h2><p>Information submitted through quotation forms is used to respond to roofing enquiries, prepare quotations and coordinate requested delivery support. Do not submit payment-card details through website forms.</p></article><article class="card card-pad" id="terms"><h2>Website Terms</h2><p>Displayed prices are reference prices and may change with gauge, finish, length, stock and delivery location. A quotation becomes valid only after direct confirmation. Product trademarks belong to their respective owners.</p></article></div></section>`);
  }

  document.querySelectorAll('.chip').forEach(chip => {
    if (/verified purchase/i.test(chip.textContent)) chip.remove();
  });
  document.querySelectorAll('.section-head').forEach(head => {
    if (/verified customer reviews|280\+ reviews|4\.9\s*\/\s*5/i.test(head.textContent)) {
      const tag = head.querySelector('.tag');
      if (tag) tag.textContent = 'Customer Feedback';
      Array.from(head.children).slice(1).forEach(child => child.remove());
      const description = head.querySelector('p');
      if (description) description.textContent = 'Feedback shared by customers about roofing enquiries, product selection and delivery support.';
    }
  });

  const currentPath = location.pathname.replace(/\\/g, '/').replace(/\/index\.html$/, '/');
  document.querySelectorAll('.nav-links a, .mobile-bottom a').forEach(link => {
    if (!link.href || !link.href.startsWith(location.origin) && location.protocol !== 'file:') return;
    const linkPath = new URL(link.href, location.href).pathname.replace(/\\/g, '/').replace(/\/index\.html$/, '/');
    const isActive = linkPath === currentPath;
    link.classList.toggle('active-page', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  document.querySelectorAll('.footer [data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}

function optimizePageImages() {
  document.querySelectorAll('img').forEach((img, index) => {
    img.decoding = 'async';
    if (index > 1 && !img.closest('.hero')) img.loading = 'lazy';
    const match = img.getAttribute('src')?.match(/^(.*\/)?project-(\d{2})\.webp$/);
    if (match && !img.hasAttribute('srcset')) {
      img.srcset = `${match[1] || ''}project-${match[2]}-mobile.webp 640w, ${img.getAttribute('src')} 1200w`;
      img.sizes = '(max-width: 720px) 92vw, (max-width: 1100px) 46vw, 380px';
    }
    if (!img.hasAttribute('width') && img.naturalWidth) img.width = img.naturalWidth;
    if (!img.hasAttribute('height') && img.naturalHeight) img.height = img.naturalHeight;
  });
}

function setupUI() {
  normalizeSiteChrome();
  setupThemeToggleUI();
  setupSocialLinks();
  setupFloatingWhatsAppIcon();
  updateDynamicPageMeta();
  setupBackToTop();
  setupMobileNavAndAccordions();
  setupFAQAccordion();
  optimizePageImages();

  // Reveal Animations
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  }), { threshold: .1 });
  document.querySelectorAll('.reveal').forEach(e => io.observe(e));

  // Dynamic Year
  document.querySelectorAll('[data-year]').forEach(e => e.textContent = new Date().getFullYear());

  bindActions();
}

document.addEventListener('DOMContentLoaded', setupUI);
