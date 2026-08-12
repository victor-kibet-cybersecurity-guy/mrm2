document.addEventListener('DOMContentLoaded', () => {
  const f = document.querySelector('#smart-quote');
  if (!f) return;

  const sel = f.product;
  sel.innerHTML = PRODUCTS.map(p => `<option value="${p.id}">${esc(p.name)} (${p.gauge}) - ${money(p.price)}/${p.unit}</option>`).join('');

  function upd() {
    const p = PRODUCTS.find(x => x.id === sel.value) || PRODUCTS[0];
    const q = Math.max(1, +f.quantity.value || 1);
    const l = Math.max(1, +f.length.value || 1);
    const total = p.price * q * (p.unit === 'metre' ? l : 1);

    const resultEl = document.querySelector('#quote-result');
    if (resultEl) {
      resultEl.innerHTML = `
        <div style="background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #cbd5e1; margin-top:10px;">
          Estimated Material Cost: <strong style="font-size:1.15rem; color:var(--navy);">${money(total)}</strong><br>
          <span class="small" style="color:var(--muted);">Delivery cost excluded. Final price and stock availability will be confirmed upon request.</span>
        </div>
      `;
    }
  }

  f.addEventListener('input', upd);
  upd();

  f.addEventListener('submit', e => {
    e.preventDefault();
    const p = PRODUCTS.find(x => x.id === sel.value) || PRODUCTS[0];
    const msg = `Hello MRM Roofing Dealer Kenya,

I would like an official quotation:

Product: ${p.name}
Gauge: ${esc(f.gauge.value || p.gauge)}
Colour: ${esc(f.colour.value || 'Not specified')}
Length: ${esc(f.length.value)} metres
Quantity: ${esc(f.quantity.value)} sheets

County: ${esc(f.county.value || 'Kenya')}
Delivery Location: ${esc(f.location.value || 'Direct Delivery')}

Please confirm today's verified price, stock availability and delivery turnaround.

Thank you.`;

    window.open(wa(msg), '_blank');
  });
});
