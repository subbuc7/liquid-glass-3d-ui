/**
 * LIQUID GLASS 3D UI - QUALITY GATE & VALIDATOR
 * Verifies file structure, markup, 3D CSS depth, JS syntax, accessibility, and metadata.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

class ComponentValidator {
  /**
   * Validate a component directory
   * @param {string} componentDir - Path to component directory
   * @param {object} categoryConfig - Category specification
   * @param {object} designSystemConfig - Design system specification
   * @returns {object} { passed: boolean, errors: string[], warnings: string[] }
   */
  static validate(componentDir, categoryConfig = null, designSystemConfig = null) {
    const errors = [];
    const warnings = [];

    // 1. File Structure Check
    const requiredFiles = ['index.html', 'metadata.json', 'preview.svg'];
    for (const file of requiredFiles) {
      const filePath = path.join(componentDir, file);
      if (!fs.existsSync(filePath)) {
        errors.push(`Missing required file: ${file}`);
      } else {
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
          errors.push(`File is empty: ${file}`);
        }
      }
    }

    if (errors.length > 0) {
      return { passed: false, errors, warnings };
    }

    // 2. Metadata Validation
    const metadataPath = path.join(componentDir, 'metadata.json');
    let metadata = {};
    try {
      const metaRaw = fs.readFileSync(metadataPath, 'utf8');
      metadata = JSON.parse(metaRaw);

      const requiredMetaFields = ['id', 'name', 'category', 'designSystem', 'version', 'description'];
      for (const field of requiredMetaFields) {
        if (!metadata[field]) {
          errors.push(`metadata.json missing required field: '${field}'`);
        }
      }

      if (categoryConfig && metadata.category !== categoryConfig.id) {
        errors.push(`Metadata category mismatch: expected '${categoryConfig.id}', got '${metadata.category}'`);
      }
    } catch (err) {
      errors.push(`metadata.json contains invalid JSON: ${err.message}`);
    }

    // 3. HTML & CSS & JS Content Validation
    const htmlPath = path.join(componentDir, 'index.html');
    try {
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');

      // Check basic HTML markup structure
      if (!htmlContent.includes('<') || !htmlContent.includes('>')) {
        errors.push('index.html does not contain valid HTML tags');
      }

      // 3D Depth & Material Check
      const has3DDepth = 
        htmlContent.includes('transform-style') || 
        htmlContent.includes('preserve-3d') || 
        htmlContent.includes('perspective') || 
        htmlContent.includes('translateZ') ||
        htmlContent.includes('rotateX') ||
        htmlContent.includes('rotateY') ||
        htmlContent.includes('box-shadow') ||
        htmlContent.includes('backdrop-filter');

      if (!has3DDepth) {
        errors.push('Quality Gate Failed: Component lacks 3D depth, perspective, or liquid-glass materials');
      }

      // Check for liquid glass material characteristics
      const hasGlassmorphism = 
        htmlContent.includes('backdrop-filter') || 
        htmlContent.includes('-webkit-backdrop-filter') ||
        htmlContent.includes('rgba(');

      if (!hasGlassmorphism) {
        warnings.push('Component may be missing frosted glass backdrop-filter or translucent layers');
      }

      // Check Accessibility Basics (ARIA or semantic tags)
      const hasAccessibility = 
        htmlContent.includes('aria-') || 
        htmlContent.includes('role=') || 
        htmlContent.includes('<button') || 
        htmlContent.includes('<input') || 
        htmlContent.includes('<nav') || 
        htmlContent.includes('<main') ||
        htmlContent.includes('tabindex');

      if (!hasAccessibility) {
        warnings.push('Component lacks explicit ARIA attributes or semantic interactive tags');
      }

      // Check for JavaScript syntax inside <script> tags
      const scriptMatches = htmlContent.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi);
      if (scriptMatches) {
        for (const scriptTag of scriptMatches) {
          const jsCode = scriptTag.replace(/<script[\s\S]*?>/i, '').replace(/<\/script>/i, '').trim();
          if (jsCode) {
            try {
              // Test syntax using Node vm
              new vm.Script(jsCode);
            } catch (jsErr) {
              errors.push(`JavaScript syntax error in component: ${jsErr.message}`);
            }
          }
        }
      }

      // Check for Responsive Layout features
      const hasResponsive = 
        htmlContent.includes('@media') || 
        htmlContent.includes('max-width') || 
        htmlContent.includes('clamp(') || 
        htmlContent.includes('flex') || 
        htmlContent.includes('grid') ||
        htmlContent.includes('viewport');

      if (!hasResponsive) {
        warnings.push('Component may lack explicit responsive layout constraints');
      }

    } catch (htmlErr) {
      errors.push(`Failed to read or validate index.html: ${htmlErr.message}`);
    }

    // 4. SVG Preview Check
    const previewPath = path.join(componentDir, 'preview.svg');
    try {
      const previewContent = fs.readFileSync(previewPath, 'utf8');
      if (!previewContent.includes('<svg') || !previewContent.includes('</svg>')) {
        errors.push('preview.svg is not a valid SVG file');
      }
    } catch (err) {
      errors.push(`Failed to validate preview.svg: ${err.message}`);
    }

    const passed = errors.length === 0;
    return { passed, errors, warnings };
  }
}

module.exports = ComponentValidator;

if (require.main === module) {
  const targetDir = process.argv[2];
  if (!targetDir) {
    console.log('Usage: node validator.js <component_directory>');
    process.exit(1);
  }
  const result = ComponentValidator.validate(targetDir);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.passed ? 0 : 1);
}
