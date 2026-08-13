/**
 * js/seo.js - Dynamic SEO, Breadcrumbs & Schema.org Manager
 * Automatically updates document.title, meta[name="description"], canonical link,
 * OpenGraph, Twitter tags, Breadcrumb Navigation Bar UI, and BreadcrumbList JSON-LD schema.
 */

(function () {
  const countyNameMap = {
    'athi-river': 'Athi River',
    'homa-bay': 'Homa Bay',
    'uasin-gishu': 'Uasin Gishu',
    'west-pokot': 'West Pokot',
    'trans-nzoia': 'Trans Nzoia',
    'elgeyo-marakwet': 'Elgeyo Marakwet',
    'taita-taveta': 'Taita Taveta',
    'tharaka-nithi': 'Tharaka Nithi',
    'tana-river': 'Tana River'
  };

  function formatSlugName(slug) {
    if (!slug) return '';
    const clean = slug.toLowerCase().trim();
    if (countyNameMap[clean]) return countyNameMap[clean];
    return clean
      .split(/[\s-]+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  function setMetaTag(attrName, attrVal, contentVal) {
    if (!contentVal) return;
    let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', contentVal);
  }

  function setCanonical(hrefVal) {
    if (!hrefVal) return;
    let el = document.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      document.head.appendChild(el);
    }
    el.setAttribute('href', hrefVal);
  }

  function toAbsoluteUrl(relUrl) {
    if (!relUrl) return window.location.href;
    if (relUrl.startsWith('http://') || relUrl.startsWith('https://')) {
      return relUrl;
    }
    try {
      return new URL(relUrl, window.location.origin + window.location.pathname).href;
    } catch (e) {
      const clean = relUrl.startsWith('/') ? relUrl : '/' + relUrl;
      return window.location.origin + clean;
    }
  }

  function injectBreadcrumbSchema(items) {
    let scriptEl = document.querySelector('#breadcrumb-jsonld');
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.id = 'breadcrumb-jsonld';
      document.head.appendChild(scriptEl);
    }

    const itemListElement = items.map((item, idx) => {
      let fullUrl = item.url;
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        const a = document.createElement('a');
        a.href = item.url;
        fullUrl = a.href;
      }
      return {
        '@type': 'ListItem',
        'position': idx + 1,
        'name': item.name,
        'item': fullUrl
      };
    });

    scriptEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': itemListElement
    }, null, 2);
  }

  function renderBreadcrumbUI(items) {
    let breadcrumbEl = document.querySelector('.breadcrumbs') || document.querySelector('#breadcrumbs-target');

    if (!breadcrumbEl) {
      const container = document.querySelector('.page-hero .container') ||
                        document.querySelector('main .section .container') ||
                        document.querySelector('main .container');
      if (container) {
        breadcrumbEl = document.createElement('nav');
        breadcrumbEl.className = 'breadcrumbs';
        breadcrumbEl.setAttribute('aria-label', 'Breadcrumb navigation');
        container.insertBefore(breadcrumbEl, container.firstChild);
      }
    }

    if (!breadcrumbEl) return;

    if (breadcrumbEl.tagName.toLowerCase() !== 'nav') {
      breadcrumbEl.setAttribute('aria-label', 'Breadcrumb navigation');
    }

    const html = items.map((item, idx) => {
      const isLast = idx === items.length - 1;
      if (isLast) {
        return `<span class="current" aria-current="page">${escapeHTML(item.name)}</span>`;
      } else {
        return `<a href="${item.url}">${escapeHTML(item.name)}</a><span class="separator">/</span>`;
      }
    }).join(' ');

    breadcrumbEl.innerHTML = html;
  }

  function escapeHTML(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function updateSEO(overrideOptions = {}) {
    const urlParams = new URLSearchParams(window.location.search);
    const path = window.location.pathname.toLowerCase();
    const currentUrl = window.location.href;

    const isSubDir = path.includes('/locations/') || path.includes('/counties/');
    const homeRel = isSubDir ? '../index.html' : 'index.html';
    const productsRel = isSubDir ? '../products.html' : 'products.html';
    const locationsRel = isSubDir ? '../locations.html' : 'locations.html';

    let breadcrumbsItems = [
      { name: 'Home', url: homeRel }
    ];

    // 1. Detect County / Location
    let countyName = overrideOptions.county ||
      overrideOptions.location ||
      urlParams.get('county') ||
      urlParams.get('location') ||
      urlParams.get('countyName');

    if (!countyName) {
      if (isSubDir) {
        const match = path.match(/\/([^/]+)\.html$/);
        if (match && match[1]) {
          countyName = formatSlugName(match[1]);
        }
      }
    } else {
      countyName = formatSlugName(countyName);
    }

    // 2. Detect Product if on product page or passed in
    let product = overrideOptions.product;
    if (!product && (path.includes('product-details.html') || urlParams.has('id'))) {
      const pId = urlParams.get('id');
      if (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS)) {
        product = PRODUCTS.find(p => p.id === pId) || PRODUCTS[0];
      }
    }

    setCanonical(currentUrl);

    // 3. Case A: Product Details Page
    if (product) {
      const locationSuffix = countyName ? ` in ${countyName}` : ' in Kenya';
      const gaugeLabel = (product.gauge && product.gauge !== 'N/A') ? ` (${product.gauge})` : '';
      const pageTitle = `${product.name}${gaugeLabel} Price${locationSuffix} | MRM Roofing Dealer Kenya`;

      const priceStr = product.price ? `Starts at KSh ${Math.round(product.price).toLocaleString()} per ${product.unit || 'metre'}. ` : '';
      const gaugeStr = (product.gauge && product.gauge !== 'N/A') ? `Gauge: ${product.gauge}${product.thickness ? ` (${product.thickness})` : ''}. ` : '';
      const finishStr = product.finish ? `Finish: ${product.finish}. ` : '';
      const widthStr = (product.width && product.width !== 'N/A') ? `Coverage width: ${product.width}. ` : '';
      const colorsStr = (product.colours && product.colours.length > 0) ? `Colours: ${product.colours.join(', ')}. ` : '';

      const pageDesc = `${product.name} Mabati price${locationSuffix}. ${priceStr}${gaugeStr}${finishStr}${widthStr}${colorsStr}Direct factory supply & delivery to ${countyName || 'Nairobi, Kiambu, Nakuru, Eldoret, Mombasa & all 47 counties'}.`;

      const rawImg = product.image || 'images/project-01.webp';
      const absoluteImg = toAbsoluteUrl(rawImg);
      const productPageRelUrl = `product-details.html?id=${encodeURIComponent(product.id)}`;
      const absoluteProductUrl = toAbsoluteUrl(productPageRelUrl);

      document.title = pageTitle;
      setMetaTag('name', 'description', pageDesc);

      // OpenGraph Protocol Tags for Social Sharing
      setMetaTag('property', 'og:title', `${product.name}${gaugeLabel} Price & Specs${locationSuffix}`);
      setMetaTag('property', 'og:description', pageDesc);
      setMetaTag('property', 'og:image', absoluteImg);
      setMetaTag('property', 'og:image:secure_url', absoluteImg);
      setMetaTag('property', 'og:image:type', rawImg.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg');
      setMetaTag('property', 'og:image:width', '1200');
      setMetaTag('property', 'og:image:height', '630');
      setMetaTag('property', 'og:image:alt', `${product.name} roofing sheet specification preview`);
      setMetaTag('property', 'og:url', absoluteProductUrl);
      setMetaTag('property', 'og:type', 'product');
      setMetaTag('property', 'og:site_name', 'MRM Roofing Dealer Kenya');

      // Product-specific OpenGraph tags
      if (product.price) {
        setMetaTag('property', 'product:price:amount', String(Math.round(product.price)));
        setMetaTag('property', 'product:price:currency', 'KES');
      }
      setMetaTag('property', 'product:availability', product.availability || 'in stock');
      if (product.category) {
        setMetaTag('property', 'product:category', product.category);
      }
      setMetaTag('property', 'product:brand', product.brand || 'MRM Roofing Dealer Kenya');

      // Twitter Card Metadata
      setMetaTag('name', 'twitter:card', 'summary_large_image');
      setMetaTag('name', 'twitter:title', `${product.name}${gaugeLabel} Price${locationSuffix}`);
      setMetaTag('name', 'twitter:description', pageDesc);
      setMetaTag('name', 'twitter:image', absoluteImg);
      setMetaTag('name', 'twitter:image:alt', `${product.name} roofing sheet preview`);

      breadcrumbsItems = [
        { name: 'Home', url: homeRel },
        { name: 'Roofing Sheets', url: productsRel },
        { name: product.name, url: productPageRelUrl }
      ];

      renderBreadcrumbUI(breadcrumbsItems);
      injectBreadcrumbSchema(breadcrumbsItems);
      return;
    }

    // 4. Case B: Location / County Page
    if (countyName || isSubDir || path.includes('locations.html')) {
      if (path.endsWith('locations.html')) {
        breadcrumbsItems = [
          { name: 'Home', url: homeRel },
          { name: 'Service Locations', url: locationsRel }
        ];
      } else {
        const pageLabel = countyName ? `Mabati in ${countyName}` : 'Location Overview';
        breadcrumbsItems = [
          { name: 'Home', url: homeRel },
          { name: 'Locations', url: locationsRel },
          { name: pageLabel, url: window.location.pathname.split('/').pop() + window.location.search }
        ];

        if (countyName) {
          const pageTitle = `Mabati in ${countyName} | Roofing Sheets & Prices ${countyName} Kenya`;
          const pageDesc = `Looking for Mabati in ${countyName}? Compare roofing sheets, Versatile, Orientile, Resincot & Covermax Box Profile 28G/30G Mabati prices in ${countyName}, Kenya. Direct factory supply & fast delivery for all roofing in ${countyName}.`;

          document.title = pageTitle;
          setMetaTag('name', 'description', pageDesc);

          setMetaTag('property', 'og:title', `Mabati in ${countyName} | Roofing Sheets & Delivery Kenya`);
          setMetaTag('property', 'og:description', pageDesc);
          setMetaTag('property', 'og:url', currentUrl);
          setMetaTag('property', 'og:type', 'website');
          setMetaTag('property', 'og:site_name', 'MRM Roofing Dealer Kenya');

          setMetaTag('name', 'twitter:card', 'summary_large_image');
          setMetaTag('name', 'twitter:title', `Mabati in ${countyName} | Roofing Sheets & Prices`);
          setMetaTag('name', 'twitter:description', pageDesc);
        }
      }

      renderBreadcrumbUI(breadcrumbsItems);
      injectBreadcrumbSchema(breadcrumbsItems);
      return;
    }

    // 5. Case C: Products Catalog Page
    if (path.includes('products.html')) {
      const catParam = urlParams.get('category');
      const gaugeParam = urlParams.get('gauge');
      let pageTitle = 'MRM Roofing Sheets & Accessories Catalog Kenya | Prices & Profiles';
      let pageDesc = "Browse Versatile, Orientile, Resincot, Covermax Box Profile & roofing accessories in Kenya. Filter by profile, gauge (28G/30G), colour & finish. Delivery to Nairobi, Kiambu, Nakuru, Eldoret, Mombasa, Kisumu & all 47 counties.";

      breadcrumbsItems = [
        { name: 'Home', url: homeRel },
        { name: 'Roofing Catalog', url: productsRel }
      ];

      if (catParam || gaugeParam) {
        pageTitle = `${catParam || ''} ${gaugeParam || ''} Mabati in Kenya | MRM Roofing Sheets Catalog`.trim();
        pageDesc = `Shop ${catParam || 'roofing sheets'} ${gaugeParam || ''} in Kenya. Direct factory supply, current prices & countywide delivery to Nairobi, Kiambu, Nakuru, Eldoret, Mombasa & all 47 counties.`;
        breadcrumbsItems.push({ name: `${catParam || ''} ${gaugeParam || ''}`.trim(), url: `products.html${window.location.search}` });
      }

      document.title = pageTitle;
      setMetaTag('name', 'description', pageDesc);
      setMetaTag('property', 'og:title', pageTitle);
      setMetaTag('property', 'og:description', pageDesc);
      setMetaTag('name', 'twitter:title', pageTitle);
      setMetaTag('name', 'twitter:description', pageDesc);

      renderBreadcrumbUI(breadcrumbsItems);
      injectBreadcrumbSchema(breadcrumbsItems);
      return;
    }

    // 6. Case D: Other pages (Delivery, Gallery, Contact, About, FAQ, Blog, etc.)
    const pageNameMap = {
      'delivery.html': 'Delivery Information',
      'gallery.html': 'Project Gallery',
      'contact.html': 'Contact & Quotations',
      'about.html': 'About Us',
      'faq.html': 'Frequently Asked Questions',
      'blog.html': 'Roofing Guides & News'
    };

    const filename = path.split('/').pop();
    if (pageNameMap[filename]) {
      breadcrumbsItems = [
        { name: 'Home', url: homeRel },
        { name: pageNameMap[filename], url: filename }
      ];
      renderBreadcrumbUI(breadcrumbsItems);
      injectBreadcrumbSchema(breadcrumbsItems);
    }
  }

  window.updateSEO = updateSEO;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => updateSEO());
  } else {
    updateSEO();
  }
})();
