/**
 * AUTOMATED 3D COMPONENT GENERATION & PUBLISHING PIPELINE
 * Orchestrates:
 * 1. Load Categories
 * 2. Load Design System
 * 3. AI / Synthesis Generation
 * 4. Quality Gate Validation & Retries
 * 5. Preview Generation
 * 6. Catalog Scan & Database Update
 * 7. Website Build
 */

const fs = require('fs');
const path = require('path');
const GenerationEngine = require('../generator/engine');
const { generateCatalog } = require('./generate-catalog');
const { buildWebsite } = require('./build-website');

async function runPipeline(options = {}) {
  const dsId = options.designSystem || 'liquid-glass-01';
  const mode = options.mode || 'missing'; // 'missing', 'all', or category id
  const quality = options.quality || 'Premium';
  const overwrite = options.overwrite || false;
  const rootDir = path.resolve(__dirname, '..');

  console.log('----------------------------------------------------');
  console.log('🚀 INITIALIZING LIQUID GLASS AUTOMATED PIPELINE');
  console.log(`- Design System : ${dsId}`);
  console.log(`- Mode          : ${mode}`);
  console.log(`- Quality       : ${quality}`);
  console.log(`- Overwrite     : ${overwrite}`);
  console.log('----------------------------------------------------');

  const engine = new GenerationEngine({
    rootDir,
    designSystemId: dsId,
    quality,
    overwrite
  });

  // Step 1: Generate missing or requested components
  console.log('\n[Pipeline Step 1/4] Running Generation Engine & Quality Gates...');
  const genResult = await engine.run(mode);

  // Step 2: Update Catalog
  console.log('\n[Pipeline Step 2/4] Scanning Components and Updating Website Catalog...');
  const catalog = generateCatalog(rootDir);

  // Step 3: Build Website
  console.log('\n[Pipeline Step 3/4] Building Liquid Glass Website Distribution...');
  buildWebsite(rootDir);

  console.log('\n====================================================');
  console.log('✅ PIPELINE COMPLETED SUCCESSFULLY');
  console.log(`- Total 3D Categories : ${catalog.stats.totalCategories}`);
  console.log(`- Total Components    : ${catalog.stats.totalComponents}`);
  console.log(`- Output Directory    : website/dist`);
  console.log('====================================================\n');
}

module.exports = { runPipeline };

if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--design-system' && args[i + 1]) options.designSystem = args[++i];
    if (args[i] === '--mode' && args[i + 1]) options.mode = args[++i];
    if (args[i] === '--quality' && args[i + 1]) options.quality = args[++i];
    if (args[i] === '--overwrite') options.overwrite = true;
  }

  runPipeline(options).catch(err => {
    console.error('❌ Pipeline Failed:', err);
    process.exit(1);
  });
}
