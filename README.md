# Liquid Glass 3D UI — Automated Component Library & Publishing System

An automated, GitHub-based 3D spatial UI component library and generative publishing engine. The repository functions simultaneously as the source of truth, automated generation pipeline, quality gate verification suite, and self-updating GitHub Pages showcase.

---

## Table of Contents

1. [Architectural Overview](#architectural-overview)
2. [Master Design System: Liquid Glass 01](#master-design-system-liquid-glass-01)
3. [Master Category System (51 Categories)](#master-category-system-51-categories)
4. [AI Generation Engine & Provider Configuration](#ai-generation-engine--provider-configuration)
5. [Quality Gate & Automated Validation](#quality-gate--automated-validation)
6. [Component Storage & Duplicate Protection](#component-storage--duplicate-protection)
7. [Automatic Catalog Generation](#automatic-catalog-generation)
8. [Showcase Website & Dedicated Category Pages](#showcase-website--dedicated-category-pages)
9. [GitHub Actions Automated Publishing](#github-actions-automated-publishing)
10. [Creating Future Design Packs](#creating-future-design-packs)
11. [Adding and Editing Categories](#adding-and-editing-categories)
12. [Security Best Practices](#security-best-practices)
13. [CLI Reference & Testing](#cli-reference--testing)

---

## Architectural Overview

The system eliminates manual uploads and administrative steps. When a workflow run or CLI command is triggered, the pipeline autonomously executes:

```
Trigger (Manual / CI)
    ↓
Load Master Category Rules (config/categories.json)
    ↓
Load Design System Rules (design-system/<pack>.json)
    ↓
AI Generation / High-Fidelity Synthesizer
    ↓
Quality Gate Check (DOM, CSS 3D Depth, JS Syntax, A11y, Files)
    ↓ (Automatic Retry with Diagnostics if Failed)
Generate High-Resolution 3D Previews (preview.svg)
    ↓
Duplicate Protection & Categorized Storage (components/<cat>/<pack>/)
    ↓
Scan Components & Rebuild Master Catalog (catalog.json)
    ↓
Build Website Distribution (website/dist/ + 51 static category endpoints)
    ↓
Git Commit & Push
    ↓
Automated Deploy to GitHub Pages
```

---

## Master Design System: Liquid Glass 01

The library is anchored by **Liquid Glass 01**, a 3D design language engineering physical depth rather than superficial 2D shadows:

- **Translucent Silica Surfaces**: Multi-tiered `backdrop-filter: blur(...)` combined with translucent gradient backdrops.
- **Specular Refraction**: Dual-edge directional illumination where top-left borders feature crisp highlights (`rgba(255,255,255,0.85)`) falling off to soft ambient occlusion on bottom-right edges.
- **3D Spatial Depth**: Built on hardware-accelerated CSS 3D transforms (`transform-style: preserve-3d`, `perspective: 1200px`, and `translateZ()` layers).
- **Interactive Physics**:
  - *Hover*: Elevates into the viewer space (+8px to +18px Z-axis) accompanied by dynamic cursor parallax tilt and chromatic cyan-glow auras.
  - *Active / Pressed*: Visually recesses into the mounting plate (-2px to -4px Z-axis) with deepened inner shadows.
- **Accessibility & Reduced Motion**: Standard ARIA roles and full `@media (prefers-reduced-motion: reduce)` decay rules.

---

## Master Category System (51 Categories)

The system is configured with 51 distinct UI categories defined in `config/categories.json`:

| Group | Categories |
| :--- | :--- |
| **Forms & Inputs** | Button, Text Input, Textarea, Checkbox, Radio Button, Switch / Toggle, Select / Dropdown, Combobox / Autocomplete, Slider, Date / Time Picker, Chip / Tag, Segmented Control, Rating / Star Picker, File Upload / Dropzone, Color Picker, Floating Action Button (FAB), Split Button / Action Menu |
| **Surfaces & Layout** | Card, Accordion, Pricing Table, Divider / Glass Separator |
| **Navigation** | Navbar / App Bar, Sidebar / Navigation Rail, Tabs, Breadcrumbs, Pagination, Stepper / Wizard, Bottom Navigation Bar, Floating Dock |
| **Feedback & Status** | Badge, Alert / Callout, Toast / Notification, Progress Bar, Spinner / Loading Indicator, Skeleton Loader, Empty State |
| **Data & Display** | Avatar / Avatar Group, Table / Data Grid, Tree View, Timeline, Statistic / Metric Card, KPI Gauge / Circular Meter |
| **Overlays & Disclosures**| Modal / Dialog, Drawer / Sheet, Tooltip, Popover, Command Palette / Spotlight |
| **Media & Creative** | Icon Pack (12-piece 3D family), Audio Player, Video Player, Carousel / Slider Showcase |

---

## AI Generation Engine & Provider Configuration

The engine (`generator/engine.js`) supports pluggable AI backends as well as a zero-dependency deterministic synthesizer.

### 1. Configuring External AI Providers
Add your preferred API key to your environment or GitHub Actions Secrets:

- **OpenAI**: Set `OPENAI_API_KEY`
- **Google Gemini**: Set `GEMINI_API_KEY`
- **Anthropic**: Set `ANTHROPIC_API_KEY`

When an API key is present, the engine automatically constructs structured prompts using `generator/prompt-builder.js`, feeding:
1. Design System Tokens and Visual Rules
2. Category-Specific Functional Requirements and ARIA patterns
3. Quality Gate Constraints

### 2. High-Fidelity Local Synthesizer
When running offline or in environments without external API credentials, the built-in `ComponentSynthesizer` activates automatically, producing fully compliant, interactive 3D components for all 51 categories.

---

## Quality Gate & Automated Validation

Never publish broken AI output. `generator/validator.js` enforces strict pre-publication gates:

1. **File Structure**: Requires `index.html`, `metadata.json`, and `preview.svg`. Empty files are rejected.
2. **Markup & Semantics**: Validates HTML formatting, doctype, and DOM hierarchy.
3. **True 3D CSS & Materials**: Verifies that components use `transform-style: preserve-3d`, `translateZ`, `perspective`, and `backdrop-filter`.
4. **JavaScript Syntax Verification**: Isolates and executes component `<script>` blocks inside a Node.js `vm.Script` sandbox to catch syntax errors before release.
5. **Accessibility**: Ensures ARIA attributes, semantic buttons/inputs, or keyboard tab indices exist.
6. **Responsive Layout**: Checks for viewport constraints, clamp, flex, or grid adaptability.

**Automatic Retries**: If validation fails, the generator re-attempts generation up to 3 times, passing the exact error feedback to the generation agent.

---

## Component Storage & Duplicate Protection

Generated components are filed automatically by category:

```
components/
├── button/
│   ├── liquid-glass-01/
│   │   ├── index.html
│   │   ├── metadata.json
│   │   └── preview.svg
│   └── liquid-glass-02/      <-- Preserved on subsequent runs!
├── card/
│   └── liquid-glass-01/
└── slider/
    └── liquid-glass-01/
```

### Duplicate Protection Rules
- Existing components are **never overwritten** unless the `--overwrite` flag is explicitly provided.
- If `liquid-glass-01` already exists in a category, a new generation run automatically allocates `liquid-glass-02`, `liquid-glass-03`, etc., preserving version history.

---

## Automatic Catalog Generation

Run `node scripts/generate-catalog.js` (or `npm run catalog`) to scan the filesystem and produce `catalog.json`:

- Crawls all 51 category folders in `components/`.
- Extracts `metadata.json`, files paths, and preview links.
- Joins with `config/categories.json` for groups and ARIA roles.
- Writes synchronized outputs to:
  - `components/catalog.json`
  - `website/public/data/catalog.json`
  - `website/catalog.json`

---

## Showcase Website & Dedicated Category Pages

The website is a static, zero-dependency 3D browser designed for instant loading and GitHub Pages compatibility:

- **Homepage**: 3D hero section, live counters (51 categories, 51 components), design system selector, search bar, category navigation pills, featured showcase, and complete 51-component grid.
- **Dedicated Static Category Pages**: Every category has a dedicated page under `website/dist/category/<category-id>/index.html` (e.g. `/category/button/`, `/category/card/`).
- **Interactive Component Detail Modal**:
  - Live interactive preview embedded in an isolated iframe.
  - Multi-device viewport toggles (Desktop 100%, Tablet 768px, Mobile 375px).
  - Code inspection tabs (HTML, Metadata JSON, Functional Specs).
  - One-click "Copy Code" button with toast notification.
  - Direct links to full-screen preview and GitHub source tree.

---

## GitHub Actions Automated Publishing

The repository includes `.github/workflows/generate.yml` for on-demand generation and deployment.

### How to Manually Trigger Generation:
1. Navigate to the **Actions** tab in your GitHub repository.
2. Select **Generate 3D Components & Publish**.
3. Click **Run workflow** and configure inputs:
   - **Design System**: `Liquid Glass 01` (or future packs like `Crystal 02`)
   - **Generation Mode**: `Generate all missing`, `Regenerate all`, or `Single category`
   - **Category**: (Optional category ID when single category is chosen)
   - **Quality**: `Premium`
4. The workflow will automatically generate components, validate quality, update the catalog, commit changes to `main`, and publish to GitHub Pages.

---

## Creating Future Design Packs

The system enforces separation between **Category Rules** and **Design System Rules**:

1. Create `design-system/crystal-02.json` with token specifications (color palette, refraction index, blur, shadows).
2. Create `design-system/crystal-02.css` containing material classes and custom properties.
3. Trigger generation for `crystal-02`:
   ```bash
   node scripts/run-pipeline.js --design-system crystal-02 --mode all
   ```
4. The generator produces all 51 categories adhering to Crystal 02 visual identity while preserving existing Liquid Glass components!

---

## Adding and Editing Categories

To modify or expand categories:
1. Open `config/categories.json`.
2. Add a new category entry or adjust `functional_requirements`:
   ```json
   {
     "id": "new-component",
     "name": "New Component",
     "group": "Forms & Inputs",
     "description": "Component description...",
     "functional_requirements": ["hover", "active", "focus", "a11y"],
     "aria_role": "region",
     "default_tags": ["3d", "liquid-glass"]
   }
   ```
3. Run `npm run generate` to synthesize the new category.

---

## Security Best Practices

- **Zero Hardcoded Secrets**: No API keys or tokens are stored in the codebase.
- **GitHub Secrets**: Store credentials in repository secrets:
  - `OPENAI_API_KEY`
  - `GEMINI_API_KEY`
  - `ANTHROPIC_API_KEY`
- **Output Sanitization**: The catalog builder and website compiler never expose environment variables or secret keys to output bundles.

---

## CLI Reference & Testing

### Running the Test Suite
```bash
npm test
```
Runs 45 automated assertions across categories, design system tokens, 51 generated components, quality gates, duplicate protection, and SSG category builds.

### Executing the Full Pipeline
```bash
# Generate missing components, update catalog, and build site
npm run generate

# Regenerate all with duplicate protection override
node scripts/run-pipeline.js --mode all --overwrite

# Build website bundle only
npm run build

# Rebuild master catalog only
npm run catalog
```
