/**
 * WEBSITE BUILDER & SSG GENERATOR
 * Compiles website assets, generates static category pages,
 * bundles catalog data, and outputs production-ready dist/ for GitHub Pages.
 */

const fs = require('fs');
const path = require('path');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function buildWebsite(rootDir = path.resolve(__dirname, '..')) {
  const distDir = path.join(rootDir, 'website', 'dist');
  const websiteSrc = path.join(rootDir, 'website', 'src');
  const componentsDir = path.join(rootDir, 'components');
  const catalogPath = path.join(rootDir, 'components', 'catalog.json');
  const designSystemDir = path.join(rootDir, 'design-system');

  console.log(`[Builder] Compiling website to ${distDir}...`);

  // Ensure clean dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // Read master catalog
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Catalog not found at ${catalogPath}. Run generate-catalog.js first.`);
  }
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  // Copy website src files (HTML, CSS, JS)
  if (fs.existsSync(websiteSrc)) {
    copyDirRecursive(websiteSrc, distDir);
  }

  // Copy design system assets
  const distDs = path.join(distDir, 'design-system');
  copyDirRecursive(designSystemDir, distDs);

  // Copy components directory into dist/components so iframes and assets resolve cleanly
  const distComponents = path.join(distDir, 'components');
  copyDirRecursive(componentsDir, distComponents);

  // Copy catalog.json to dist root and dist/data/
  fs.writeFileSync(path.join(distDir, 'catalog.json'), JSON.stringify(catalog, null, 2), 'utf8');
  const distData = path.join(distDir, 'data');
  if (!fs.existsSync(distData)) fs.mkdirSync(distData, { recursive: true });
  fs.writeFileSync(path.join(distData, 'catalog.json'), JSON.stringify(catalog, null, 2), 'utf8');

  // Generate Static Category Pages for all 51 categories
  const categoriesBaseDir = path.join(distDir, 'category');
  fs.mkdirSync(categoriesBaseDir, { recursive: true });

  const templateHtml = fs.readFileSync(path.join(websiteSrc, 'index.html'), 'utf8');

  for (const cat of catalog.categories) {
    const catPageDir = path.join(categoriesBaseDir, cat.id);
    fs.mkdirSync(catPageDir, { recursive: true });

    // Inject prerendered category context into template
    const customTitle = `${cat.name} 3D Components - Liquid Glass UI`;
    const catPageHtml = templateHtml
      .replace('<title>Liquid Glass 3D UI - Component Library</title>', `<title>${customTitle}</title>`)
      .replace('window.__INITIAL_CATEGORY__ = null;', `window.__INITIAL_CATEGORY__ = "${cat.id}";`);

    fs.writeFileSync(path.join(catPageDir, 'index.html'), catPageHtml, 'utf8');
  }

  // Generate a .nojekyll file to prevent GitHub Pages from ignoring folders starting with underscores or dots
  fs.writeFileSync(path.join(distDir, '.nojekyll'), '', 'utf8');

  console.log(`[Builder] Successfully built website distribution:`);
  console.log(`  - 51 Static Category Endpoints created under /category/<id>/`);
  console.log(`  - Full Component Asset Tree mirrored`);
  console.log(`  - Production output ready at website/dist/`);
}

module.exports = { buildWebsite };

if (require.main === module) {
  buildWebsite();
}
