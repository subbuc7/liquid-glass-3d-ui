/**
 * LIQUID GLASS 3D PREVIEW GENERATOR
 * Generates rich, high-resolution vector previews depicting 3D liquid glass components.
 */

const fs = require('fs');
const path = require('path');

function generateComponentSVG(category, designSystem = 'Liquid Glass 01') {
  const catId = category.id;
  const name = category.name;
  
  // Category-specific visual centerpiece
  let innerGraphic = '';
  
  switch(catId) {
    case 'button':
      innerGraphic = `
        <g transform="translate(140, 150) rotate(-4)">
          <!-- 3D Shadow Base -->
          <rect x="0" y="14" width="220" height="68" rx="20" fill="#000" opacity="0.6" filter="url(#dropGlow)" />
          <!-- Button Body -->
          <rect x="0" y="0" width="220" height="68" rx="20" fill="url(#glassGrad)" stroke="url(#borderGrad)" stroke-width="2" />
          <!-- Specular Highlight Top -->
          <path d="M 15 8 Q 110 3 205 8" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.75" />
          <!-- Cyan Core Glow -->
          <rect x="10" y="10" width="200" height="48" rx="14" fill="url(#cyanGlowGrad)" opacity="0.4" />
          <!-- Button Label -->
          <text x="110" y="42" font-family="system-ui, sans-serif" font-weight="700" font-size="19" fill="#f8fafc" text-anchor="middle" filter="url(#textShadow)">Liquid Action</text>
        </g>
      `;
      break;

    case 'checkbox':
      innerGraphic = `
        <g transform="translate(170, 140)">
          <!-- Box Base -->
          <rect x="0" y="10" width="70" height="70" rx="18" fill="#000" opacity="0.5" filter="url(#dropGlow)"/>
          <!-- Box -->
          <rect x="0" y="0" width="70" height="70" rx="18" fill="url(#cyanGlassGrad)" stroke="url(#borderCyanGrad)" stroke-width="2.5"/>
          <!-- Checkmark -->
          <path d="M 20 36 L 31 48 L 50 22" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" filter="url(#highGlow)"/>
          <text x="95" y="44" font-family="system-ui, sans-serif" font-weight="600" font-size="20" fill="#f8fafc">Activated State</text>
        </g>
      `;
      break;

    case 'card':
      innerGraphic = `
        <g transform="translate(100, 95) rotate(-3)">
          <rect x="0" y="20" width="300" height="190" rx="24" fill="#000" opacity="0.6" filter="url(#dropGlow)" />
          <rect x="0" y="0" width="300" height="190" rx="24" fill="url(#glassGrad)" stroke="url(#borderGrad)" stroke-width="2" />
          <path d="M 20 12 L 280 12" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.6" />
          <circle cx="45" cy="45" r="18" fill="url(#cyanGlowGrad)" stroke="#00f0ff" stroke-width="1.5" />
          <rect x="75" y="32" width="130" height="12" rx="6" fill="#f8fafc" opacity="0.9" />
          <rect x="75" y="52" width="80" height="8" rx="4" fill="#94a3b8" opacity="0.6" />
          <!-- Layered inner 3D glass card -->
          <rect x="30" y="90" width="240" height="75" rx="14" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" />
          <text x="50" y="132" font-family="system-ui, sans-serif" font-weight="600" font-size="14" fill="#38bdf8">Volumetric 3D Parallax</text>
        </g>
      `;
      break;

    case 'slider':
      innerGraphic = `
        <g transform="translate(100, 160)">
          <!-- Glass Track -->
          <rect x="0" y="10" width="300" height="16" rx="8" fill="rgba(0,0,0,0.5)" />
          <rect x="0" y="10" width="180" height="16" rx="8" fill="url(#cyanBarGrad)" stroke="rgba(0,240,255,0.6)" stroke-width="1.5" />
          <!-- 3D Thumb Gem -->
          <circle cx="180" cy="18" r="22" fill="url(#gemGrad)" stroke="#ffffff" stroke-width="2.5" filter="url(#dropGlow)" />
          <circle cx="175" cy="13" r="6" fill="#ffffff" opacity="0.8" />
          <!-- Tooltip Bubble -->
          <rect x="150" y="-30" width="60" height="30" rx="10" fill="url(#glassGrad)" stroke="url(#borderCyanGrad)" stroke-width="1.5" />
          <text x="180" y="-10" font-family="system-ui, sans-serif" font-weight="700" font-size="14" fill="#00f0ff" text-anchor="middle">68%</text>
        </g>
      `;
      break;

    case 'icon-pack':
      innerGraphic = `
        <g transform="translate(100, 100)">
          <circle cx="45" cy="45" r="30" fill="url(#glassGrad)" stroke="url(#borderCyanGrad)" stroke-width="2"/>
          <path d="M 35 45 L 55 45 M 45 35 L 45 55" stroke="#00f0ff" stroke-width="3.5" stroke-linecap="round"/>
          <circle cx="145" cy="45" r="30" fill="url(#glassGrad)" stroke="url(#borderCyanGrad)" stroke-width="2"/>
          <polygon points="145,28 152,42 165,42 154,52 158,65 145,56 132,65 136,52 125,42 138,42" fill="none" stroke="#00f0ff" stroke-width="2.5"/>
          <circle cx="245" cy="45" r="30" fill="url(#glassGrad)" stroke="url(#borderCyanGrad)" stroke-width="2"/>
          <path d="M 235 45 Q 245 30 255 45 Q 245 60 235 45" fill="none" stroke="#00f0ff" stroke-width="3"/>
          <circle cx="245" cy="45" r="5" fill="#38bdf8"/>
          <text x="145" y="125" font-family="system-ui, sans-serif" font-weight="700" font-size="16" fill="#f8fafc" text-anchor="middle">12-Piece 3D Optical Family</text>
        </g>
      `;
      break;

    default:
      // High-end procedural 3D wireframe presentation for all other categories
      innerGraphic = `
        <g transform="translate(100, 110)">
          <!-- Multi-tier 3D Glass Stack -->
          <rect x="10" y="20" width="280" height="140" rx="20" fill="#000" opacity="0.6" filter="url(#dropGlow)" />
          <rect x="0" y="0" width="300" height="150" rx="20" fill="url(#glassGrad)" stroke="url(#borderGrad)" stroke-width="2" />
          <path d="M 15 10 L 285 10" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.6" />
          <circle cx="40" cy="40" r="16" fill="url(#cyanGlowGrad)" stroke="#00f0ff" stroke-width="1.5" />
          <rect x="70" y="32" width="120" height="16" rx="8" fill="#f8fafc" opacity="0.9" />
          <rect x="30" y="75" width="240" height="45" rx="12" fill="rgba(255,255,255,0.06)" stroke="url(#borderCyanGrad)" stroke-width="1.5" />
          <text x="150" y="103" font-family="system-ui, sans-serif" font-weight="600" font-size="15" fill="#38bdf8" text-anchor="middle">3D Liquid Glass ${name}</text>
        </g>
      `;
      break;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="500" height="340" viewBox="0 0 500 340" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#040609" />
      <stop offset="50%" stop-color="#070b14" />
      <stop offset="100%" stop-color="#090e1a" />
    </linearGradient>

    <!-- Glass Surface Gradient -->
    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255, 255, 255, 0.18)" />
      <stop offset="40%" stop-color="rgba(255, 255, 255, 0.08)" />
      <stop offset="100%" stop-color="rgba(255, 255, 255, 0.02)" />
    </linearGradient>

    <!-- Border Gradient with Top-Left Specular Highlight -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255, 255, 255, 0.85)" />
      <stop offset="35%" stop-color="rgba(255, 255, 255, 0.3)" />
      <stop offset="100%" stop-color="rgba(255, 255, 255, 0.06)" />
    </linearGradient>

    <!-- Cyan Glow Gradients -->
    <linearGradient id="cyanGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f0ff" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>

    <linearGradient id="cyanGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(0, 240, 255, 0.25)" />
      <stop offset="100%" stop-color="rgba(37, 99, 235, 0.1)" />
    </linearGradient>

    <linearGradient id="borderCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="40%" stop-color="#00f0ff" />
      <stop offset="100%" stop-color="rgba(0, 240, 255, 0.2)" />
    </linearGradient>

    <linearGradient id="cyanBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#00f0ff" />
    </linearGradient>

    <radialGradient id="gemGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="30%" stop-color="#00f0ff" />
      <stop offset="80%" stop-color="#1d4ed8" />
      <stop offset="100%" stop-color="#030712" />
    </radialGradient>

    <!-- Atmospheric Glow Filters -->
    <filter id="dropGlow" x="-20%" y="-20%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <filter id="highGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <filter id="textShadow">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Canvas Background -->
  <rect width="500" height="340" rx="16" fill="url(#bgGrad)" />

  <!-- Background Ambient Radial Halos -->
  <circle cx="120" cy="100" r="140" fill="#00f0ff" opacity="0.12" filter="url(#dropGlow)" />
  <circle cx="380" cy="240" r="160" fill="#8b5cf6" opacity="0.10" filter="url(#dropGlow)" />

  <!-- Subtitle and Badge Header -->
  <g transform="translate(30, 36)">
    <!-- Design System Badge -->
    <rect x="0" y="0" width="130" height="26" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <circle cx="12" cy="13" r="4" fill="#00f0ff" filter="url(#highGlow)"/>
    <text x="24" y="17" font-family="system-ui, sans-serif" font-weight="600" font-size="11" fill="#38bdf8" letter-spacing="0.5">LIQUID GLASS 01</text>
    
    <!-- Category Title -->
    <text x="0" y="52" font-family="system-ui, sans-serif" font-weight="800" font-size="22" fill="#f8fafc">${name}</text>
  </g>

  <!-- Central 3D Component Rendering -->
  ${innerGraphic}

  <!-- Footer Specification Indicators -->
  <g transform="translate(30, 310)">
    <text x="0" y="0" font-family="system-ui, sans-serif" font-weight="500" font-size="12" fill="#64748b">3D Spatial Matrix • Translucent Silica • Accessible</text>
  </g>
</svg>`;
}

module.exports = { generateComponentSVG };

if (require.main === module) {
  const catArg = process.argv[2] || 'button';
  const nameArg = process.argv[3] || 'Button';
  const outArg = process.argv[4];
  const svg = generateComponentSVG({ id: catArg, name: nameArg });
  if (outArg) {
    fs.writeFileSync(outArg, svg, 'utf8');
    console.log(`Wrote preview to ${outArg}`);
  } else {
    console.log(svg);
  }
}
