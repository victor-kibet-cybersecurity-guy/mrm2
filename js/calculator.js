document.addEventListener('DOMContentLoaded', () => {
  const f = document.querySelector('#roof-calculator');
  if (!f) return;

  f.addEventListener('submit', e => {
    e.preventDefault();
    const L = +f.length.value;
    const W = +f.width.value;
    const pitch = +f.pitch.value || 25;
    const sheetLength = +f.sheet.value || 3.0;
    const waste = +f.waste.value || 10;
    const roofType = f.roofType ? f.roofType.value : 'Gable';
    
    const prod = PRODUCTS.find(p => p.id === f.product.value) || PRODUCTS[0];

    // Pitch slope factor calculation
    const pitchFactor = 1 / Math.cos(pitch * Math.PI / 180);
    const grossArea = L * W * pitchFactor;
    const netAreaWithWaste = grossArea * (1 + waste / 100);

    // Cover width (approx 0.9m to 1.05m depending on profile)
    const coverWidth = parseFloat(prod.width) / 1000 || 1.0;
    const sheetCoverageArea = sheetLength * coverWidth;
    const sheetsCount = Math.ceil(netAreaWithWaste / sheetCoverageArea);

    // Accessory Estimates based on Roof Geometry
    const estimatedRidges = Math.ceil(L / 0.9); // approx 0.9m effective ridge length
    const estimatedFastenersPacks = Math.ceil((sheetsCount * 8) / 100); // 8 screws per sheet, 100 per pack
    const estimatedGutters = Math.ceil((L * 2) / 3.0); // 3m gutter lengths along eaves

    const sheetTotalCost = sheetsCount * sheetLength * prod.price;
    const ridgesCost = estimatedRidges * 780;
    const fastenersCost = estimatedFastenersPacks * 420;
    const totalMaterialCost = Math.round(sheetTotalCost + ridgesCost + fastenersCost);

    const resultBox = document.querySelector('#roof-result');
    if (!resultBox) return;

    const breakdownMsg = `Hello MRM Roofing Dealer Kenya, I calculated a roof estimate on your website:
- Roof Dimensions: ${L}m x ${W}m (${roofType}, Pitch: ${pitch}°)
- Estimated Area: ${netAreaWithWaste.toFixed(1)} m²
- Selected Product: ${prod.name} (${prod.gauge})
- Sheet Length: ${sheetLength}m
- Total Sheets Required: ${sheetsCount} sheets
- Estimated Ridges: ${estimatedRidges} pcs
- Estimated Fasteners: ${estimatedFastenersPacks} packs (100s)
- Estimated Material Total: ${money(totalMaterialCost)}
Please confirm current stock, final price and delivery to my location.`;

    resultBox.innerHTML = `
      <div class="quote-summary-card">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--navy); padding-bottom:12px; margin-bottom:14px;">
          <h3 style="margin:0; color:var(--navy);">Professional Roof Estimate Summary</h3>
          <span class="dealer-badge">Reference Calculation</span>
        </div>

        <table class="summary-table">
          <tr>
            <td>Estimated Roof Surface Area</td>
            <td><strong>${netAreaWithWaste.toFixed(1)} m²</strong> (incl. ${waste}% waste)</td>
          </tr>
          <tr>
            <td>Selected Roofing Profile</td>
            <td><strong>${esc(prod.name)}</strong> (${esc(prod.gauge)})</td>
          </tr>
          <tr>
            <td>Required Sheet Quantity</td>
            <td><strong>${sheetsCount} sheets</strong> @ ${sheetLength}m length</td>
          </tr>
          <tr>
            <td>Estimated Ridge Caps</td>
            <td><strong>${estimatedRidges} pcs</strong> (approx.)</td>
          </tr>
          <tr>
            <td>Estimated Self-Tapping Fasteners</td>
            <td><strong>${estimatedFastenersPacks} packs</strong> (100 pcs/pack)</td>
          </tr>
          <tr>
            <td>Estimated Eaves Gutters</td>
            <td><strong>${estimatedGutters} pcs</strong> (3m lengths)</td>
          </tr>
          <tr>
            <td>Estimated Material Subtotal</td>
            <td style="font-size:1.2rem; color:var(--navy); font-weight:800;">${money(totalMaterialCost)}</td>
          </tr>
          <tr>
            <td>Delivery Status</td>
            <td style="color:var(--amber);"><strong>Delivery Excluded</strong> (Calculated by route & county)</td>
          </tr>
        </table>

        <div style="background:#f1f5f9; padding:12px 16px; border-radius:10px; margin:16px 0;" class="small">
          <strong>Note:</strong> Final material requirements depend on site measurements, overlapping laps, valleys and builder specifications.
        </div>

        <div class="hero-buttons" style="margin-top:20px;">
          <a class="btn btn-orange" href="${wa(breakdownMsg)}" target="_blank" rel="noopener">Send Estimate to WhatsApp</a>
          <button class="btn btn-outline" type="button" onclick="window.print()">Print Estimate</button>
          <a class="btn btn-primary" href="contact.html#smart-quote">Request Final Official Quote</a>
        </div>
      </div>
    `;
  });
});
