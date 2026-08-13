/**
 * js/seo_manager.js - Automated Content & County SEO Meta Tag Generator
 * Reads current page DOM content, detects products, categories, and county location contexts,
 * generates high-quality SEO meta tags (Title, Description, Keywords, OpenGraph, Twitter Cards, Canonical, JSON-LD),
 * and dynamically injects them into the document head for optimal search engine indexing across Kenya.
 */

(function () {
  'use strict';

  // Comprehensive Kenyan County & Town Registry for Localized SEO
  const KENYA_COUNTIES = [
    'Nairobi', 'Kiambu', 'Nakuru', 'Eldoret', 'Mombasa', 'Machakos', 'Athi River', 'Kitengela',
    'Kisumu', 'Nyeri', 'Meru', 'Kisii', 'Kajiado', 'Naivasha', 'Kericho', 'Narok', 'Embu',
    'Kakamega', 'Bungoma', 'Thika', 'Muranga', 'Nyandarua', 'Laikipia', 'Trans Nzoia', 'Kilifi',
    'Kwale', 'Homa Bay', 'Migori', 'Siaya', 'Bomet', 'Nandi', 'West Pokot', 'Baringo',
    'Tharaka Nithi', 'Kirinyaga', 'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo',
    'Turkana', 'Samburu', 'Elgeyo Marakwet', 'Taita Taveta', 'Tana River', 'Lamuk'
  ];

  const COUNTY_SLUG_MAP = {
    'athi-river': 'Athi River',
    'homa-bay': 'Homa Bay',
    'uasin-gishu': 'Uasin Gishu',
    'west-pokot': 'West Pokot',
    'trans-nzoia': 'Trans Nzoia',
    'taita-taveta': 'Taita Taveta',
    'tharaka-nithi': 'Tharaka Nithi',
    'tana-river': 'Tana River',
    'elgeyo-marakwet': 'Elgeyo Marakwet'
  };

  /**
   * Helper to update or create a meta tag in document head
   */
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

  /**
   * Helper to set canonical link
   */
  function setCanonicalLink(url) {
    if (!url) return;
    let el = document.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      document.head.appendChild(el);
    }
    el.setAttribute('href', url);
  }

  /**
   * Convert relative image/page URLs to absolute URLs for social crawlers
   */
  function toAbsoluteUrl(relUrl) {
    if (!relUrl) return window.location.href;
    if (relUrl.startsWith('http://') || relUrl.startsWith('https://')) return relUrl;
    try {
      return new URL(relUrl, window.location.origin + window.location.pathname).href;
    } catch (e) {
      const clean = relUrl.startsWith('/') ? relUrl : '/' + relUrl;
      return window.location.origin + clean;
    }
  }

  /**
   * Inspect current DOM and extract page content signals
   */
  function extractPageContext() {
    const urlParams = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname.toLowerCase();
    const fullText = document.body ? document.body.innerText : '';

    // 1. Detect Heading & Subtitle Signals
    const h1El = document.querySelector('h1');
    const h2El = document.querySelector('h2');
    const heroText = document.querySelector('.page-hero, .hero');
    const h1Text = h1El ? h1El.innerText.trim() : '';
    const h2Text = h2El ? h2El.innerText.trim() : '';

    // 2. Detect County or Location context
    let detectedCounty = urlParams.get('county') || urlParams.get('location') || urlParams.get('countyName');

    if (!detectedCounty) {
      // Check pathname for county slug (e.g. /counties/kiambu.html or /locations/nairobi.html)
      const match = pathname.match(/\/(?:counties|locations)\/([^/]+)\.html$/);
      if (match && match[1]) {
        const slug = match[1].toLowerCase();
        detectedCounty = COUNTY_SLUG_MAP[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    }

    if (!detectedCounty) {
      // Search DOM text for explicit county indicators
      for (const county of KENYA_COUNTIES) {
        const regex = new RegExp(`\\b${county}\\b`, 'i');
        if (regex.test(h1Text) || regex.test(h2Text) || (heroText && regex.test(heroText.innerText))) {
          detectedCounty = county;
          break;
        }
      }
    }

    // 3. Detect Product or Category context
    let productId = urlParams.get('id');
    let productObj = null;
    if (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS)) {
      if (productId) {
        productObj = PRODUCTS.find(p => p.id === productId);
      }
    }

    const categoryParam = urlParams.get('category');
    const gaugeParam = urlParams.get('gauge');

    return {
      pathname,
      h1Text,
      h2Text,
      heroContent: heroText ? heroText.innerText.trim() : '',
      fullTextSnippet: fullText.slice(0, 500).replace(/\s+/g, ' '),
      county: detectedCounty ? detectedCounty.trim() : '',
      productId,
      product: productObj,
      category: categoryParam,
      gauge: gaugeParam
    };
  }

  /**
   * Generate SEO Meta Package based on DOM Context
   */
  function generateSEOData(ctx) {
    const siteBrand = 'MRM Roofing Dealer Kenya';
    const contactPhone = '0750527506';
    const currentUrl = window.location.href;
    const countySuffix = ctx.county ? ` in ${ctx.county}` : ' Across Kenya';
    const countyLocationText = ctx.county ? `in ${ctx.county}, Kenya` : 'in Nairobi, Kiambu, Nakuru, Eldoret, Mombasa & all 47 Kenyan counties';

    let title = '';
    let description = '';
    let keywords = [
      'Mabati Kenya', 'Roofing sheets Kenya', 'MRM mabati prices', 'Covermax 28G box profile',
      'Versatile roofing sheets', 'Orientile mabati', 'Resincot tile profile', 'Colorplus mabati',
      'Cut to length roofing', 'Roofing accessories Kenya', 'Mabati quotation'
    ];

    if (ctx.county) {
      keywords.push(`Mabati in ${ctx.county}`, `Roofing sheets ${ctx.county}`, `Box profile prices ${ctx.county}`, `MRM dealer ${ctx.county}`);
    }

    // Case 1: Product Detail Page
    if (ctx.product) {
      const p = ctx.product;
      const gaugeLabel = (p.gauge && p.gauge !== 'N/A') ? ` (${p.gauge})` : '';
      title = `${p.name}${gaugeLabel} Price${countySuffix} | ${siteBrand}`;

      const priceText = p.price ? `Starts at KSh ${Math.round(p.price).toLocaleString()} per ${p.unit || 'metre'}. ` : '';
      const gaugeText = (p.gauge && p.gauge !== 'N/A') ? `Gauge: ${p.gauge}. ` : '';
      const finishText = p.finish ? `Finish: ${p.finish}. ` : '';

      description = `${p.name} Mabati price ${countyLocationText}. ${priceText}${gaugeText}${finishText}Direct factory supply, custom cut-to-length orders & fast countywide delivery. Call/WhatsApp ${contactPhone}.`;
      keywords.push(p.name, `${p.name} price`, `${p.name} gauge ${p.gauge || '28G'}`);
    }
    // Case 2: County / Regional Location Page
    else if (ctx.county) {
      title = `Mabati in ${ctx.county} | Roofing Sheets & Prices ${ctx.county} Kenya`;
      description = `Looking for Mabati in ${ctx.county}? Compare Versatile, Orientile, Resincot & Covermax Box Profile 28G/30G Mabati prices in ${ctx.county}, Kenya. Direct factory supply & fast delivery. Hotline: ${contactPhone}.`;
    }
    // Case 3: Products Catalogue
    else if (ctx.pathname.includes('products.html')) {
      if (ctx.category || ctx.gauge) {
        const catLabel = ctx.category || 'Roofing Sheets';
        const gaugeLabel = ctx.gauge ? ` ${ctx.gauge}` : '';
        title = `${catLabel}${gaugeLabel} Mabati Catalog & Prices | ${siteBrand}`;
        description = `Browse ${catLabel}${gaugeLabel} in Kenya. Direct factory supply, current 2026 prices, custom cut-to-length & delivery to all 47 counties. Order via WhatsApp ${contactPhone}.`;
      } else {
        title = `MRM Roofing Sheets Catalog & Price List Kenya | ${siteBrand}`;
        description = `Browse full catalog of Versatile, Orientile, Resincot, Covermax Box Profile & roofing accessories in Kenya. Filter by gauge (28G/30G), finish & colour with countywide delivery.`;
      }
    }
    // Case 4: General Page (About, Contact, Delivery, Gallery, FAQ, etc.)
    else {
      let pageSubject = ctx.h1Text || document.title || 'Roofing Solutions';
      title = `${pageSubject} | ${siteBrand}`;

      if (ctx.pathname.includes('contact.html')) {
        description = `Get instant roofing quotations & Mabati price inquiries in Kenya. Send product specifications, gauge, length & delivery location via WhatsApp to ${contactPhone}.`;
      } else if (ctx.pathname.includes('delivery.html')) {
        description = `Fast, reliable Mabati delivery across all 47 Kenyan counties including Nairobi, Kiambu, Nakuru, Eldoret & Mombasa. Custom lengths & secure site offloading.`;
      } else if (ctx.pathname.includes('gallery.html')) {
        description = `View completed residential, commercial & industrial roofing projects in Kenya featuring Versatile, Orientile, Resincot & Box Profile Mabati.`;
      } else if (ctx.pathname.includes('faq.html')) {
        description = `Frequently asked questions about Mabati gauges (28G vs 30G), box profile coverage, cut-to-length ordering, delivery timelines & payment terms in Kenya.`;
      } else {
        description = `${pageSubject} for high quality coated steel roofing sheets, box profiles & accessories in Kenya. Direct factory distribution & delivery to all 47 counties.`;
      }
    }

    return {
      title,
      description,
      keywords: keywords.join(', '),
      canonicalUrl: currentUrl,
      ogType: ctx.product ? 'product' : 'website',
      image: ctx.product && ctx.product.image ? toAbsoluteUrl(ctx.product.image) : toAbsoluteUrl('images/hero-roof.svg')
    };
  }

  /**
   * Inject Structured Data (JSON-LD) for Search Engines
   */
  function injectStructuredData(seoData, ctx) {
    let scriptEl = document.querySelector('#seo-manager-jsonld');
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.id = 'seo-manager-jsonld';
      document.head.appendChild(scriptEl);
    }

    const schemaGraph = [
      {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${window.location.origin}/#organization`,
        'name': 'MRM Roofing Dealer Kenya',
        'url': window.location.origin,
        'telephone': '+254750527506',
        'priceRange': 'KSh 600 - KSh 2,500 per metre',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': ctx.county || 'Nairobi',
          'addressCountry': 'KE'
        },
        'areaServed': 'Kenya',
        'description': 'Authorized Mabati reseller providing Versatile, Orientile, Resincot, Covermax Box Profile roofing sheets and accessories across all 47 counties in Kenya.'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'name': seoData.title,
        'description': seoData.description,
        'url': seoData.canonicalUrl
      }
    ];

    if (ctx.product) {
      const p = ctx.product;
      schemaGraph.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': p.name,
        'description': seoData.description,
        'image': seoData.image,
        'category': p.category || 'Roofing Sheets',
        'offers': {
          '@type': 'Offer',
          'priceCurrency': 'KES',
          'price': p.price ? String(Math.round(p.price)) : '1000',
          'availability': 'https://schema.org/InStock',
          'url': seoData.canonicalUrl
        }
      });
    }

    scriptEl.textContent = JSON.stringify({ '@graph': schemaGraph }, null, 2);
  }

  /**
   * Main Execution Function
   */
  function runSEOManager() {
    const ctx = extractPageContext();
    const seoData = generateSEOData(ctx);

    // 1. Update Title & Meta Tags
    document.title = seoData.title;
    setMetaTag('name', 'description', seoData.description);
    setMetaTag('name', 'keywords', seoData.keywords);

    // 2. OpenGraph Meta Tags
    setMetaTag('property', 'og:title', seoData.title);
    setMetaTag('property', 'og:description', seoData.description);
    setMetaTag('property', 'og:type', seoData.ogType);
    setMetaTag('property', 'og:url', seoData.canonicalUrl);
    setMetaTag('property', 'og:image', seoData.image);
    setMetaTag('property', 'og:site_name', 'MRM Roofing Dealer Kenya');

    // 3. Twitter Card Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', seoData.title);
    setMetaTag('name', 'twitter:description', seoData.description);
    setMetaTag('name', 'twitter:image', seoData.image);

    // 4. Canonical Link
    setCanonicalLink(seoData.canonicalUrl);

    // 5. JSON-LD Structured Data
    injectStructuredData(seoData, ctx);
  }

  // Export to window object for manual invocation if needed
  window.SEOManager = {
    init: runSEOManager,
    update: runSEOManager,
    extractContext: extractPageContext
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runSEOManager);
  } else {
    runSEOManager();
  }
})();
