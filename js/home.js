document.addEventListener('DOMContentLoaded', () => {
  // Render Featured Products
  const featuredEl = document.querySelector('#featured-products');
  if (featuredEl) {
    featuredEl.innerHTML = PRODUCTS.filter(p => p.featured).slice(0, 8).map(productCard).join('');
  }

  // Render Categories Grid
  const catEl = document.querySelector('#category-grid');
  if (catEl) {
    const cats = [...new Set(PRODUCTS.map(p => p.category))].slice(0, 8);
    const icons = ['⌂', '▱', '▤', '◫', '◇', '▥', '↧', '◩'];
    catEl.innerHTML = cats.map((c, i) => `
      <a class="category-card reveal" href="products.html">
        <div class="icon-box">${icons[i % icons.length]}</div>
        <strong>${esc(c)}</strong>
        <p class="small">Explore profiles, gauges, finishes and request current pricing.</p>
      </a>
    `).join('');
  }

  // Render Home Accessories
  const accEl = document.querySelector('#home-accessories');
  if (accEl) {
    accEl.innerHTML = PRODUCTS.filter(p => ['Ridges', 'Valleys', 'Flashing', 'Gutters', 'Downpipes', 'Roof Nails', 'Roof Sealants', 'Roof Insulation'].includes(p.category)).slice(0, 4).map(productCard).join('');
  }

  // Populate Calculator Product Select
  const calcSelect = document.querySelector('#calc-product');
  if (calcSelect) {
    calcSelect.innerHTML = PRODUCTS.filter(p => p.unit === 'metre').map(p => `<option value="${p.id}">${esc(p.name)} (${p.gauge}) - ${money(p.price)}/m</option>`).join('');
  }

  // --- INTERACTIVE ROOF VISUALIZER ENGINE ---
  const visualizerBox = document.querySelector('#roof-visualizer-wrap');
  if (visualizerBox) {
    const visualizerColors = {
      'Charcoal Grey': '#3a4148',
      'Maroon': '#6f2634',
      'Tile Red': '#b84c36',
      'Chocolate': '#674838',
      'Brick Red': '#a14538',
      'Forest Green': '#3f654e',
      'Sky Blue': '#386a9b'
    };

    let selectedStyle = 'Bungalow';
    let selectedProfile = 'Versatile Tile';
    let selectedColorName = 'Charcoal Grey';
    let selectedColorHex = '#3a4148';
    let selectedFinish = 'Textured';

    function updateVisualizer() {
      const houseSvg = document.querySelector('#visualizer-house-svg');
      const quoteBtn = document.querySelector('#vis-quote-btn');

      if (houseSvg) {
        // Update SVG Roof color and pattern
        const roofPath = houseSvg.querySelector('#svg-roof-path');
        const ridgePath = houseSvg.querySelector('#svg-ridge-path');
        if (roofPath) roofPath.setAttribute('fill', selectedColorHex);
        if (ridgePath) ridgePath.setAttribute('stroke', selectedFinish === 'Textured' ? '#f59e0b' : '#ffffff');
      }

      if (quoteBtn) {
        const message = `Hello MRM Roofing Dealer Kenya, I customized my roof using the online visualizer:\n- House Style: ${selectedStyle}\n- Profile: ${selectedProfile}\n- Colour: ${selectedColorName}\n- Finish: ${selectedFinish}\nPlease provide a price estimate and confirm stock.`;
        quoteBtn.href = wa(message);
      }
    }

    // Bind Swatches
    const swatchesContainer = document.querySelector('#swatches');
    if (swatchesContainer) {
      swatchesContainer.innerHTML = Object.entries(visualizerColors).map(([name, hex]) => `
        <button class="swatch ${name === selectedColorName ? 'active' : ''}" title="${name}" aria-label="${name}" data-color-name="${name}" data-color-hex="${hex}" style="background:${hex}; width:38px; height:38px; border-radius:50%; border:3px solid white; box-shadow:0 0 0 2px ${name === selectedColorName ? '#e65100' : '#cbd5e1'}; cursor:pointer;"></button>
      `).join('');

      swatchesContainer.querySelectorAll('.swatch').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedColorName = btn.dataset.colorName;
          selectedColorHex = btn.dataset.colorHex;
          swatchesContainer.querySelectorAll('.swatch').forEach(b => b.style.boxShadow = '0 0 0 2px #cbd5e1');
          btn.style.boxShadow = '0 0 0 2px #e65100';
          updateVisualizer();
        });
      });
    }

    // Bind Select controls
    const styleSel = document.querySelector('#vis-style');
    const profileSel = document.querySelector('#vis-profile');
    const finishSel = document.querySelector('#vis-finish');

    if (styleSel) styleSel.addEventListener('change', e => { selectedStyle = e.target.value; updateVisualizer(); });
    if (profileSel) profileSel.addEventListener('change', e => { selectedProfile = e.target.value; updateVisualizer(); });
    if (finishSel) finishSel.addEventListener('change', e => { selectedFinish = e.target.value; updateVisualizer(); });

    updateVisualizer();
  }

  // --- INTERACTIVE KENYA COUNTY DELIVERY LOOKUP ---
  const countySelect = document.querySelector('#county-lookup-select');
  const countyResult = document.querySelector('#county-lookup-result');

  if (countySelect && countyResult) {
    const countyData = {
      'Nairobi': { hub: 'Athi River Central Hub', turnaround: '24 Hours', feeNote: 'Direct factory dispatch available' },
      'Kiambu': { hub: 'Athi River / Thika Service Centre', turnaround: '24 Hours', feeNote: 'Regular delivery routes' },
      'Nakuru': { hub: 'Nakuru Regional Service Hub', turnaround: '24-48 Hours', feeNote: 'Dedicated truck delivery' },
      'Uasin Gishu': { hub: 'Eldoret Service Centre', turnaround: '24-48 Hours', feeNote: 'Daily county dispatches' },
      'Mombasa': { hub: 'Mariakani Main Production Plant', turnaround: '24 Hours', feeNote: 'Coastal region factory pickup or delivery' },
      'Machakos': { hub: 'Athi River Production Operations', turnaround: '24 Hours', feeNote: 'Same-day / 24hr dispatches' },
      'Kisumu': { hub: 'Kisumu Western Depot', turnaround: '24-48 Hours', feeNote: 'Western Kenya delivery coverage' },
      'Kakamega': { hub: 'Kisumu / Kakamega Route', turnaround: '48 Hours', feeNote: 'Scheduled county delivery' },
      'Meru': { hub: 'Meru Eastern Service Centre', turnaround: '48 Hours', feeNote: 'Direct delivery available' },
      'Nyeri': { hub: 'Nyeri Central Highlands Hub', turnaround: '24-48 Hours', feeNote: 'Highland route coverage' },
      'Kilifi': { hub: 'Mariakani Plant', turnaround: '24 Hours', feeNote: 'Coastal highway dispatch' },
      'Kajiado': { hub: 'Kitengela / Athi River Depot', turnaround: '24 Hours', feeNote: 'Immediate dispatch route' },
      'Narok': { hub: 'Nakuru / South Rift Depot', turnaround: '48 Hours', feeNote: 'Rift valley route' },
      'Kericho': { hub: 'Kericho / South Rift Depot', turnaround: '24-48 Hours', feeNote: 'Tea belt coverage' }
    };

    function renderCountyInfo(cName) {
      const info = countyData[cName] || { hub: 'Regional Distribution Network', turnaround: '24-72 Hours', feeNote: 'Countrywide route coverage to all 47 counties' };
      const waMsg = `Hello MRM Roofing Dealer Kenya, I am located in ${cName} County. What is the delivery cost, stock availability and turnaround time for roofing sheets to my area?`;

      countyResult.innerHTML = `
        <div class="card-pad" style="background:#fff; border:1px solid #cbd5e1; border-radius:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div>
              <span class="dealer-badge">Delivery Route Active</span>
              <h3 style="margin:8px 0 4px; color:var(--navy); font-size:1.2rem;">${esc(cName)} County</h3>
              <p class="small" style="margin:0;"><strong>Serving Depot/Plant:</strong> ${esc(info.hub)}</p>
              <p class="small" style="margin:4px 0 0;"><strong>Estimated Delivery Turnaround:</strong> ${esc(info.turnaround)} (${esc(info.feeNote)})</p>
            </div>
            <a class="btn btn-orange" href="${wa(waMsg)}" target="_blank" rel="noopener">Request Delivery Quote for ${esc(cName)}</a>
          </div>
        </div>
      `;
    }

    countySelect.addEventListener('change', e => renderCountyInfo(e.target.value));
    renderCountyInfo(countySelect.value || 'Nairobi');
  }

  bindActions();
});
