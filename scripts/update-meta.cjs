const fs = require('fs');
const path = require('path');

const nameMap = {
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

function formatName(slug) {
  if (nameMap[slug]) return nameMap[slug];
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    if (!file.endsWith('.html')) return;
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const slug = file.replace('.html', '');
    const name = formatName(slug);

    const titleText = `Mabati in ${name} | Roofing Sheets &amp; Prices ${name} Kenya`;
    const descText = `Looking for Mabati in ${name}? Compare roofing sheets, Versatile, Orientile, Resincot &amp; Covermax Box Profile 28G/30G Mabati prices in ${name}, Kenya. Direct factory supply &amp; fast delivery for all roofing in ${name}.`;

    // 1. Update Title
    if (content.includes('<title>')) {
      content = content.replace(/<title>[\s\S]*?<\/title>/i, `<title>${titleText}</title>`);
    } else {
      content = content.replace('<head>', `<head>\n<title>${titleText}</title>`);
    }

    // Helper to replace or insert meta tag
    function setMetaTag(html, attrName, attrVal, contentVal) {
      const regex = new RegExp(`<meta\\s+${attrName}=["']${attrVal}["']\\s+content=["'][^"']*["']\\s*\\/?>`, 'gi');
      const newTag = `<meta ${attrName}="${attrVal}" content="${contentVal}"/>`;
      if (regex.test(html)) {
        return html.replace(regex, newTag);
      } else {
        const regexAlt = new RegExp(`<meta\\s+content=["'][^"']*["']\\s+${attrName}=["']${attrVal}["']\\s*\\/?>`, 'gi');
        if (regexAlt.test(html)) {
          return html.replace(regexAlt, newTag);
        }
        return html.replace('</head>', `  ${newTag}\n</head>`);
      }
    }

    content = setMetaTag(content, 'name', 'description', descText);
    content = setMetaTag(content, 'property', 'og:title', `Mabati in ${name} | Roofing Sheets &amp; Delivery Kenya`);
    content = setMetaTag(content, 'property', 'og:description', descText);
    content = setMetaTag(content, 'name', 'twitter:title', `Mabati in ${name} | Roofing Sheets &amp; Prices`);
    content = setMetaTag(content, 'name', 'twitter:description', descText);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated meta for ${filePath} -> ${name}`);
  });
}

processDirectory(path.join(__dirname, '../locations'));
processDirectory(path.join(__dirname, '../counties'));
console.log('Finished updating meta tags for all location and county pages.');
