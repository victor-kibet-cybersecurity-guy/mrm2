document.addEventListener('DOMContentLoaded', () => {
  const out = document.querySelector('#products-grid');
  if (!out) return;

  const ids = ['category', 'gauge', 'thickness', 'colour', 'finish', 'brand', 'availability', 'price', 'sort'];
  const controls = ids.reduce((a, id) => (a[id] = document.querySelector(`#${id}`), a), {});

  const uniq = f => [...new Set(PRODUCTS.flatMap(f))].sort();

  const fill = (el, label, vals) => el.innerHTML = `<option value="">All ${label}</option>` + vals.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join('');

  fill(controls.category, 'categories', uniq(p => [p.category]));
  fill(controls.gauge, 'gauges', uniq(p => [p.gauge]));
  fill(controls.thickness, 'thicknesses', uniq(p => [p.thickness]));
  fill(controls.colour, 'colours', uniq(p => p.colours));
  fill(controls.finish, 'finishes', uniq(p => [p.finish]));
  fill(controls.brand, 'brands', uniq(p => [p.brand]));
  fill(controls.availability, 'availability', uniq(p => [p.availability]));

  // Read URL search params
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('category')) controls.category.value = urlParams.get('category');
  if (urlParams.get('gauge')) controls.gauge.value = urlParams.get('gauge');
  if (urlParams.get('finish')) controls.finish.value = urlParams.get('finish');

  function render() {
    let a = PRODUCTS.filter(p => (
      (!controls.category.value || p.category.toLowerCase().includes(controls.category.value.toLowerCase())) &&
      (!controls.gauge.value || p.gauge === controls.gauge.value) &&
      (!controls.thickness.value || p.thickness === controls.thickness.value) &&
      (!controls.colour.value || p.colours.includes(controls.colour.value)) &&
      (!controls.finish.value || p.finish === controls.finish.value) &&
      (!controls.brand.value || p.brand === controls.brand.value) &&
      (!controls.availability.value || p.availability === controls.availability.value)
    ));

    if (controls.price.value) {
      const [min, max] = controls.price.value.split('-').map(Number);
      a = a.filter(p => p.price >= min && p.price < max);
    }

    if (controls.sort.value === 'low') a.sort((x, y) => x.price - y.price);
    if (controls.sort.value === 'high') a.sort((x, y) => y.price - x.price);
    if (controls.sort.value === 'az') a.sort((x, y) => x.name.localeCompare(y.name));
    if (controls.sort.value === 'featured') a.sort((x, y) => Number(y.featured) - Number(x.featured));
    if (controls.sort.value === 'popular') a.sort((x, y) => y.rating - x.rating);
    if (controls.sort.value === 'newest') a.reverse();

    out.innerHTML = a.length > 0 ? a.map(productCard).join('') : `<div style="grid-column:1 / -1; padding:40px; text-align:center; background:#fff; border-radius:12px; border:1px solid #cbd5e1;"><h3>No roofing products matched your filters</h3><p class="small">Try clearing some filter options or search terms.</p></div>`;
    
    document.querySelector('#product-count').textContent = `Showing ${a.length} roofing products`;
    bindActions();
  }

  Object.values(controls).forEach(c => c.addEventListener('change', render));
  render();
});
