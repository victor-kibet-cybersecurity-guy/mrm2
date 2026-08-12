document.addEventListener('DOMContentLoaded', () => {
  const galleryGrid = document.querySelector('#gallery-grid');
  const filterWrap = document.querySelector('#gallery-filter-wrap');
  const modal = document.querySelector('#gallery-modal');
  const modalImg = document.querySelector('#gallery-modal-img');
  const modalCaption = document.querySelector('#gallery-modal-caption');

  const galleryItems = [
    { id: 1, title: "Modern Residential Villa in Nakuru", category: "Residential Roofs", profile: "Versatile", color: "Charcoal", img: "images/hero-roof.svg" },
    { id: 2, title: "Executive Maisonette in Kiambu", category: "Residential Roofs", profile: "Orientile", color: "Maroon", img: "images/gallery-1.svg" },
    { id: 3, title: "Commercial Complex Roof in Eldoret", category: "Commercial Roofs", profile: "Box Profile", color: "Charcoal", img: "images/covermax-28g-charcoal.svg" },
    { id: 4, title: "Residential Bungalow in Athi River", category: "Residential Roofs", profile: "Versatile", color: "Tile Red", img: "images/gallery-1.svg" },
    { id: 5, title: "Warehouse Facility in Mariakani", category: "Commercial Roofs", profile: "Corrugated", color: "Green", img: "images/corrugated-30g-galvanized.svg" },
    { id: 6, title: "Contemporary Residence in Nyeri", category: "Residential Roofs", profile: "Orientile", color: "Charcoal", img: "images/hero-roof.svg" }
  ];

  function renderGallery(filter = 'All') {
    if (!galleryGrid) return;

    const filtered = filter === 'All' ? galleryItems : galleryItems.filter(item => 
      item.category === filter || item.profile === filter || item.color === filter
    );

    galleryGrid.innerHTML = filtered.map(item => `
      <div class="gallery-card reveal" data-img="${item.img}" data-title="${esc(item.title)}">
        <img src="${item.img}" alt="${esc(item.title)} project preview" loading="lazy">
        <div class="caption">
          <strong>${esc(item.title)}</strong>
          <div class="meta" style="margin-top:4px;">
            <span class="chip">${esc(item.profile)}</span>
            <span class="chip">${esc(item.color)}</span>
          </div>
        </div>
      </div>
    `).join('');

    // Bind Lightbox
    galleryGrid.querySelectorAll('.gallery-card').forEach(card => {
      card.addEventListener('click', () => {
        if (modalImg) modalImg.src = card.dataset.img;
        if (modalCaption) modalCaption.textContent = card.dataset.title;
        if (modal) modal.classList.add('open');
      });
    });
  }

  if (filterWrap) {
    const filters = ['All', 'Residential Roofs', 'Commercial Roofs', 'Versatile', 'Orientile', 'Box Profile', 'Corrugated', 'Charcoal', 'Maroon', 'Tile Red', 'Green'];
    filterWrap.innerHTML = filters.map((f, i) => `
      <button class="btn ${i === 0 ? 'btn-primary' : 'btn-outline'} g-filter-btn" data-filter="${f}" style="padding:6px 14px; font-size:.84rem;">${f}</button>
    `).join('');

    filterWrap.querySelectorAll('.g-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterWrap.querySelectorAll('.g-filter-btn').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-outline');
        });
        btn.classList.remove('btn-outline');
        btn.classList.add('btn-primary');
        renderGallery(btn.dataset.filter);
      });
    });
  }

  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal || e.target.id === 'modal-close-btn') {
        modal.classList.remove('open');
      }
    });
  }

  renderGallery('All');
});
