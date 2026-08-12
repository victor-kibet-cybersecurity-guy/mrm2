document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('#product-detail');
  if (!root) return;

  const id = new URLSearchParams(location.search).get('id');
  const p = PRODUCTS.find(x => x.id === id) || PRODUCTS[0];

  updatePageMeta(p);

  // Breadcrumbs element update
  const breadcrumbEl = document.querySelector('#breadcrumbs-target');
  if (breadcrumbEl) {
    breadcrumbEl.innerHTML = `
      <a href="index.html">Home</a> / <a href="products.html">Roofing Sheets</a> / <a href="products.html">${esc(p.category)}</a> / <span>${esc(p.name)}</span>
    `;
  }

  root.innerHTML = `
    <div>
      <div class="detail-main-img">
        <img src="images/${p.id}.svg" onerror="this.onerror=null;this.src='${getProductSvg(p)}'" alt="${esc(p.name)} roofing sheet specification preview">
      </div>
      <div class="small" style="margin-top:10px;">High quality coated steel MRM profile preview.</div>
    </div>
    <div>
      <span class="dealer-badge">Mabati Dealer Supply</span>
      <h1 style="margin:8px 0 12px; color:var(--navy); font-size:2rem;">${esc(p.name)}</h1>
      <div class="meta" style="margin-bottom:12px;">
        <span class="chip">Gauge: ${esc(p.gauge)}</span>
        <span class="chip">Profile: ${esc(p.profile || 'Roof Profile')}</span>
        <span class="chip">Finish: ${esc(p.finish)}</span>
        <span class="chip">Width: ${esc(p.width)}</span>
      </div>
      <div class="price" style="font-size:1.8rem; font-weight:800;">${money(p.price)} <small>/ ${p.unit}</small></div>
      <div class="price-note" style="margin-bottom:16px;">Reference price. Request today's exact quotation.</div>

      <p style="color:var(--muted); line-height:1.6;">${esc(p.description)}</p>

      <div class="card card-pad" style="background:#f8fafc; border:1px solid #cbd5e1; margin:20px 0;">
        <h3 style="margin-top:0; font-size:1.1rem; color:var(--navy);">Calculate Instant Material Estimate</h3>
        <div class="form-grid">
          <div class="field">
            <label>Select Colour</label>
            <select id="d-colour">${p.colours.map(c => `<option>${c}</option>`).join('')}</select>
          </div>
          <div class="field">
            <label>Sheet Length (m)</label>
            <select id="d-length">
              <option>2.0</option>
              <option>2.5</option>
              <option selected>3.0</option>
              <option>3.5</option>
              <option>4.0</option>
              <option>4.5</option>
              <option>5.0</option>
              <option>6.0</option>
              <option value="custom">Cut-to-Length Request</option>
            </select>
          </div>
          <div class="field">
            <label>Quantity of Sheets</label>
            <input id="d-qty" type="number" min="1" value="10">
          </div>
        </div>

        <div class="result-box" id="d-total" style="margin-top:16px;"></div>

        <div class="hero-buttons" style="margin-top:18px;">
          <a class="btn btn-orange" id="d-wa" target="_blank" rel="noopener">Send Quote Request to WhatsApp</a>
          <a class="btn btn-primary" href="contact.html#smart-quote">Add to Quotation Builder</a>
          <a class="btn btn-outline" href="tel:+254750527506">Call 0750527506</a>
        </div>
      </div>
    </div>
  `;

  const update = () => {
    const lVal = document.querySelector('#d-length').value;
    const l = lVal === 'custom' ? 3.0 : +lVal;
    const q = +document.querySelector('#d-qty').value || 1;
    const selectedColour = document.querySelector('#d-colour').value;
    const tot = p.price * q * (p.unit === 'metre' ? l : 1);

    document.querySelector('#d-total').innerHTML = `
      Estimated Total Material Cost: <strong style="font-size:1.2rem; color:var(--navy);">${money(tot)}</strong><br>
      <span class="small">Reference estimate for ${q} sheets @ ${lVal === 'custom' ? 'Custom Length' : l + 'm'}. Final price depends on daily stock and delivery location.</span>
    `;

    const msg = `Hello MRM Roofing Dealer Kenya, I am requesting a quote for:\n- Product: ${p.name}\n- Gauge: ${p.gauge}\n- Colour: ${selectedColour}\n- Length: ${lVal === 'custom' ? 'Cut to Length' : l + ' metres'}\n- Quantity: ${q} sheets\n- Estimated Material Subtotal: ${money(tot)}\nPlease confirm current stock, final price and delivery turnaround.`;
    document.querySelector('#d-wa').href = wa(msg);
  };

  ['d-length', 'd-qty', 'd-colour'].forEach(id => {
    const el = document.querySelector('#' + id);
    if (el) el.addEventListener('input', update);
  });

  update();

  // Specification Table
  const specsEl = document.querySelector('#specs');
  if (specsEl) {
    specsEl.innerHTML = `
      <table class="spec-table">
        <tr><th>Specification</th><th>Details</th></tr>
        ${[
          ['Product Name', p.name],
          ['Brand/Manufacturer', 'MRM Reference Quality'],
          ['Profile Category', p.category],
          ['Gauge (Thickness)', `${p.gauge} (${p.thickness})`],
          ['Effective Cover Width', p.width],
          ['Available Finishes', p.finish],
          ['Available Colours', p.colours.join(', ')],
          ['Standard Sheet Lengths', '2.0m, 2.5m, 3.0m, 3.5m, 4.0m, 4.5m, 5.0m, 6.0m & Cut-to-Length'],
          ['Reference Price', `${money(p.price)} per ${p.unit}`],
          ['Countrywide Delivery', 'Available to all 47 counties in Kenya']
        ].map(r => `<tr><td><strong>${esc(r[0])}</strong></td><td>${esc(r[1])}</td></tr>`).join('')}
      </table>
    `;
  }

  // Related products
  const relatedEl = document.querySelector('#related-products');
  if (relatedEl) {
    relatedEl.innerHTML = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4).map(productCard).join('');
  }

  bindActions();
});

// Dynamic Meta Tags & OpenGraph Updater for Product Pages
function updatePageMeta(p) {
  if (typeof window.updateSEO === 'function') {
    window.updateSEO({ product: p });
  } else if (typeof window.updateDynamicPageMeta === 'function') {
    window.updateDynamicPageMeta({ product: p });
  }
}

// JSON-LD Schemas (BreadcrumbList + Product)
function injectSchemas(p) {
  const oldB = document.querySelector('#breadcrumb-schema-jsonld');
  if (oldB) oldB.remove();

  const bScript = document.createElement('script');
  bScript.type = 'application/ld+json';
  bScript.id = 'breadcrumb-schema-jsonld';
  bScript.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'index.html' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Roofing Sheets', 'item': 'products.html' },
      { '@type': 'ListItem', 'position': 3, 'name': p.name, 'item': `product-details.html?id=${encodeURIComponent(p.id)}` }
    ]
  });
  document.head.appendChild(bScript);

  const oldP = document.querySelector('#product-schema-jsonld');
  if (oldP) oldP.remove();

  const pScript = document.createElement('script');
  pScript.type = 'application/ld+json';
  pScript.id = 'product-schema-jsonld';
  pScript.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': p.name,
    'description': p.description,
    'image': `images/${p.id}.svg`,
    'brand': { '@type': 'Brand', 'name': 'MRM Roofing Dealer Kenya' },
    'sku': p.id,
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'KES',
      'price': String(Math.round(p.price)),
      'availability': 'https://schema.org/InStock',
      'url': `product-details.html?id=${encodeURIComponent(p.id)}`
    }
  });
  document.head.appendChild(pScript);
}

document.addEventListener('DOMContentLoaded', () => {
  const pId = new URLSearchParams(location.search).get('id');
  const item = PRODUCTS.find(x => x.id === pId) || PRODUCTS[0];
  if (item) injectSchemas(item);
});
