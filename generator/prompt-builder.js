/**
 * Prompt Builder
 * Strictly separates CATEGORY RULES from DESIGN SYSTEM RULES.
 */

class PromptBuilder {
  /**
   * Build the master generation prompt for a specific component
   * @param {object} categoryConfig
   * @param {object} designSystemConfig
   * @param {object} options
   */
  static buildPrompt(categoryConfig, designSystemConfig, options = {}) {
    const qualityLevel = options.quality || 'Premium';
    
    return `
You are an expert 3D UI Designer and Front-End Engineer specializing in cutting-edge 3D spatial web design.

=== SECTION 1: MASTER DESIGN SYSTEM RULES ===
Design System: "${designSystemConfig.name}" (ID: ${designSystemConfig.id})
Description: ${designSystemConfig.description}

Visual Identity Requirements:
- Surface Materials: Frosted translucent silica (backdrop-filter: blur, alpha overlays)
- Lighting & Specular: Dual-edge lighting (bright top-left border, darker bottom-right ambient shadow)
- 3D Physics: Establish a true 3D spatial hierarchy using CSS transform-style: preserve-3d, perspective, and translateZ layers.
- Elevation & Depression: Hover state must elevate into the viewer plane (+8px to +16px Z-axis) with softened multi-tiered shadows. Active/pressed state must recess into the surface (-2px to -4px Z-axis) with tightened inner shadows.
- Glow & Refraction: Subtle chromatic aura on hover (cyan glow: rgba(0, 240, 255, 0.4), sapphire: rgba(37, 99, 235, 0.35)).
- Aesthetics: Premium liquid glass, NO flat gradients or cheap 2D box-shadows pretending to be 3D.
- Reduced Motion: Must include @media (prefers-reduced-motion: reduce) with graceful decay.

Tokens Summary:
Surface Primary: ${designSystemConfig.tokens.colors.surface.primary}
Surface Elevated: ${designSystemConfig.tokens.colors.surface.elevated}
Border Subtle: ${designSystemConfig.tokens.borders.subtle}
Border Specular: ${designSystemConfig.tokens.borders.highlight}
Cyan Accent: ${designSystemConfig.tokens.colors.accents.cyan}
Font Family: ${designSystemConfig.tokens.typography.fontFamily}

=== SECTION 2: CATEGORY SPECIFIC RULES ===
Category: "${categoryConfig.name}" (ID: ${categoryConfig.id})
Group: ${categoryConfig.group}
Description: ${categoryConfig.description}
ARIA Pattern: ${categoryConfig.aria_role}

Functional Requirements for this Category:
${categoryConfig.functional_requirements.map(req => `- ${req}`).join('\n')}

=== SECTION 3: QUALITY & ARCHITECTURE REQUIREMENTS ===
Quality Level: ${qualityLevel}
1. Self-contained: Output must be a complete HTML file with embedded <style> and <script> tags.
2. Interactivity: Include JavaScript event listeners for realistic physics, hover tilts, click responses, state toggles, and keyboard focus.
3. Accessibility: Proper ARIA roles, tabindex, aria-checked/expanded/selected where appropriate.
4. Responsiveness: Fully fluid and mobile-ready with clamp() and flex/grid.
5. No External CDNs: Do not load external remote fonts or JS libraries so the component is 100% resilient and self-contained.

=== SECTION 4: REQUIRED OUTPUT FORMAT ===
Return a valid JSON object matching this schema:
{
  "html": "<complete self-contained HTML string with DOCTYPE, html, head, style, body, component DOM, and script>",
  "metadata": {
    "id": "${categoryConfig.id}",
    "name": "${categoryConfig.name} - ${designSystemConfig.name}",
    "category": "${categoryConfig.id}",
    "designSystem": "${designSystemConfig.id}",
    "version": "${options.version || '1.0.0'}",
    "generatedDate": "${new Date().toISOString()}",
    "description": "${categoryConfig.description}",
    "tags": ${JSON.stringify(categoryConfig.default_tags || [])},
    "functional_requirements": ${JSON.stringify(categoryConfig.functional_requirements || [])}
  }
}
`;
  }
}

module.exports = PromptBuilder;
