/**
 * LIQUID GLASS 3D UI - AUTOMATED TEST RUNNER & SUITE
 * Zero-dependency unit and integration testing harness.
 */

const fs = require('fs');
const path = require('path');
const ComponentValidator = require('../generator/validator');
const GenerationEngine = require('../generator/engine');

const rootDir = path.resolve(__dirname, '..');
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    testsFailed++;
  }
}

function runSuite() {
  console.log('====================================================');
  console.log('🧪 RUNNING LIQUID GLASS 3D VERIFICATION SUITE');
  console.log('====================================================\n');

  // Test Suite 1: Master Category Configuration
  console.log('--- TEST SUITE 1: 51 Master UI Categories ---');
  const catPath = path.join(rootDir, 'config', 'categories.json');
  assert(fs.existsSync(catPath), 'config/categories.json exists');
  const categories = JSON.parse(fs.readFileSync(catPath, 'utf8'));
  assert(categories.length === 51, `Categories count is exactly 51 (actual: ${categories.length})`);

  const requiredCategories = [
    'button', 'text-input', 'textarea', 'checkbox', 'radio-button',
    'switch-toggle', 'select-dropdown', 'combobox-autocomplete', 'slider',
    'date-time-picker', 'card', 'modal-dialog', 'drawer-sheet', 'accordion',
    'navbar-app-bar', 'sidebar-nav-rail', 'tabs', 'breadcrumbs', 'pagination',
    'badge', 'chip-tag', 'tooltip', 'popover', 'icon-pack'
  ];

  for (const catId of requiredCategories) {
    const found = categories.find(c => c.id === catId);
    assert(!!found, `Prompt required category '${catId}' is present`);
  }

  // Verify all categories have schema
  let schemaValid = true;
  for (const cat of categories) {
    if (!cat.id || !cat.name || !cat.group || !cat.description || !cat.functional_requirements || !cat.aria_role) {
      schemaValid = false;
      break;
    }
  }
  assert(schemaValid, 'All 51 categories satisfy the complete category schema');

  // Test Suite 2: Master Design System Liquid Glass 01
  console.log('\n--- TEST SUITE 2: Master Design System (Liquid Glass 01) ---');
  const dsJsonPath = path.join(rootDir, 'design-system', 'liquid-glass-01.json');
  const dsCssPath = path.join(rootDir, 'design-system', 'liquid-glass-01.css');
  assert(fs.existsSync(dsJsonPath), 'design-system/liquid-glass-01.json exists');
  assert(fs.existsSync(dsCssPath), 'design-system/liquid-glass-01.css exists');

  const ds = JSON.parse(fs.readFileSync(dsJsonPath, 'utf8'));
  assert(ds.id === 'liquid-glass-01', 'Design system ID is liquid-glass-01');
  assert(!!ds.tokens.colors && !!ds.tokens.depth3D && !!ds.tokens.materials, 'Design tokens contain colors, depth3D, and materials');

  // Test Suite 3: 51 Generated Components & Quality Gates
  console.log('\n--- TEST SUITE 3: Generated Components & Quality Gates ---');
  const componentsDir = path.join(rootDir, 'components');
  assert(fs.existsSync(componentsDir), 'components/ root directory exists');

  let allValid = true;
  let componentsFound = 0;

  for (const cat of categories) {
    const compDir = path.join(componentsDir, cat.id, 'liquid-glass-01');
    if (!fs.existsSync(compDir)) {
      allValid = false;
      console.error(`Missing component directory: ${compDir}`);
      continue;
    }
    componentsFound++;
    const validation = ComponentValidator.validate(compDir, cat, ds);
    if (!validation.passed) {
      allValid = false;
      console.error(`Validation failed for ${cat.id}:`, validation.errors);
    }
  }

  assert(componentsFound === 51, `Found all 51 generated category components (actual: ${componentsFound})`);
  assert(allValid, 'All 51 components pass the Quality Gate validation');

  // Test Suite 4: Master Catalog Scanner
  console.log('\n--- TEST SUITE 4: Master Catalog Scanner ---');
  const catalogPath = path.join(rootDir, 'components', 'catalog.json');
  assert(fs.existsSync(catalogPath), 'components/catalog.json exists');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  assert(catalog.stats.totalCategories === 51, 'Catalog stats report 51 categories');
  assert(catalog.stats.totalComponents >= 51, `Catalog stats report >= 51 components (actual: ${catalog.stats.totalComponents})`);
  assert(catalog.featured && catalog.featured.length > 0, 'Catalog includes featured flagship components');

  // Test Suite 5: Duplicate Protection & Versioning
  console.log('\n--- TEST SUITE 5: Duplicate Protection ---');
  const engine = new GenerationEngine({ rootDir, overwrite: false });
  const dupCheck = engine.resolveComponentDir('button', 'liquid-glass-01');
  assert(dupCheck.versionSlug === 'liquid-glass-02', `Duplicate protection auto-increments version (expected: liquid-glass-02, got: ${dupCheck.versionSlug})`);

  // Test Suite 6: Production Website Build & Static Category Pages
  console.log('\n--- TEST SUITE 6: Website Distribution & Category SSG ---');
  const distDir = path.join(rootDir, 'website', 'dist');
  assert(fs.existsSync(distDir), 'website/dist exists');
  assert(fs.existsSync(path.join(distDir, 'index.html')), 'website/dist/index.html exists');
  assert(fs.existsSync(path.join(distDir, '.nojekyll')), 'website/dist/.nojekyll exists for GitHub Pages');
  assert(fs.existsSync(path.join(distDir, 'catalog.json')), 'website/dist/catalog.json exists');

  const catDistDir = path.join(distDir, 'category');
  assert(fs.existsSync(catDistDir), 'website/dist/category exists');
  const catSubdirs = fs.readdirSync(catDistDir);
  assert(catSubdirs.length === 51, `All 51 dedicated category pages generated (actual: ${catSubdirs.length})`);

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log('====================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runSuite();
