/**
 * AUTOMATIC CATALOG SCANNER & COMPILER
 * Scans the components directory across all categories and packs,
 * extracts metadata, validates assets, and builds the website's master database.
 */

const fs = require('fs');
const path = require('path');

function generateCatalog(rootDir = path.resolve(__dirname, '..')) {
  const componentsDir = path.join(rootDir, 'components');
  const configPath = path.join(rootDir, 'config', 'categories.json');
  const designSystemDir = path.join(rootDir, 'design-system');

  if (!fs.existsSync(configPath)) {
    throw new Error(`Master category config not found at ${configPath}`);
  }

  const categories = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const categoryMap = new Map();
  for (const cat of categories) {
    categoryMap.set(cat.id, {
      ...cat,
      components: []
    });
  }

  const allComponents = [];
  const designSystemSet = new Set();

  if (fs.existsSync(componentsDir)) {
    const categoryFolders = fs.readdirSync(componentsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const catId of categoryFolders) {
      const catFolder = path.join(componentsDir, catId);
      const packFolders = fs.readdirSync(catFolder, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const packSlug of packFolders) {
        const compDir = path.join(catFolder, packSlug);
        const metadataPath = path.join(compDir, 'metadata.json');
        const indexPath = path.join(compDir, 'index.html');
        const previewPath = path.join(compDir, 'preview.svg');

        if (!fs.existsSync(metadataPath)) continue;

        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          const hasPreview = fs.existsSync(previewPath);
          const hasHtml = fs.existsSync(indexPath);

          const componentEntry = {
            id: `${catId}-${packSlug}`,
            slug: packSlug,
            categoryId: catId,
            categoryName: categoryMap.has(catId) ? categoryMap.get(catId).name : catId,
            categoryGroup: categoryMap.has(catId) ? categoryMap.get(catId).group : 'Components',
            name: metadata.name || `${catId} - ${packSlug}`,
            designSystem: metadata.designSystem || 'liquid-glass-01',
            version: metadata.version || '1.0.0',
            description: metadata.description || '',
            tags: metadata.tags || [],
            functionalRequirements: metadata.functional_requirements || [],
            generatedDate: metadata.generatedDate || new Date().toISOString(),
            files: {
              html: `components/${catId}/${packSlug}/index.html`,
              metadata: `components/${catId}/${packSlug}/metadata.json`,
              preview: `components/${catId}/${packSlug}/preview.svg`
            },
            hasPreview,
            hasHtml
          };

          designSystemSet.add(componentEntry.designSystem);
          allComponents.push(componentEntry);

          if (categoryMap.has(catId)) {
            categoryMap.get(catId).components.push(componentEntry);
          }
        } catch (err) {
          console.warn(`[Catalog] Error reading ${metadataPath}: ${err.message}`);
        }
      }
    }
  }

  // Sort components by generated date descending
  allComponents.sort((a, b) => new Date(b.generatedDate) - new Date(a.generatedDate));

  // Determine featured components (e.g. core interactive 3D components)
  const featuredIds = ['button', 'card', 'checkbox', 'slider', 'icon-pack', 'switch-toggle', 'tabs', 'modal-dialog'];
  const featuredComponents = allComponents.filter(c => featuredIds.includes(c.categoryId)).slice(0, 8);

  // Group breakdown
  const groupStats = {};
  for (const cat of categories) {
    const grp = cat.group || 'General';
    if (!groupStats[grp]) {
      groupStats[grp] = { count: 0, categories: [] };
    }
    const catData = categoryMap.get(cat.id);
    groupStats[grp].count += (catData ? catData.components.length : 0);
    groupStats[grp].categories.push(cat.id);
  }

  const catalog = {
    generatedAt: new Date().toISOString(),
    stats: {
      totalCategories: categories.length,
      totalComponents: allComponents.length,
      designSystems: Array.from(designSystemSet),
      categoryGroups: groupStats
    },
    categories: Array.from(categoryMap.values()),
    components: allComponents,
    featured: featuredComponents,
    recent: allComponents.slice(0, 10)
  };

  // Write catalog to targets
  const targets = [
    path.join(rootDir, 'components', 'catalog.json'),
    path.join(rootDir, 'website', 'public', 'data', 'catalog.json'),
    path.join(rootDir, 'website', 'catalog.json')
  ];

  for (const target of targets) {
    const dir = path.dirname(target);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(target, JSON.stringify(catalog, null, 2), 'utf8');
    console.log(`[Catalog] Wrote catalog to ${path.relative(rootDir, target)}`);
  }

  console.log(`[Catalog] Total Categories: ${categories.length}, Indexed Components: ${allComponents.length}`);
  return catalog;
}

module.exports = { generateCatalog };

if (require.main === module) {
  generateCatalog();
}
