#!/usr/bin/env node
/**
 * Generates SVG placeholder screenshots for each project.
 * Run: node scripts/generate-placeholders.js
 */
const fs = require('fs')
const path = require('path')

const projects = [
  { id: 'ams-platform', title: 'AI Event Platform', company: 'Atlanta Media Services', color1: '#1a1a2e', color2: '#16213e', accent: '#6366f1' },
  { id: 'shelton-ai', title: 'Private Markets Intelligence', company: 'SheltonAI', color1: '#0d1117', color2: '#161b22', accent: '#22c55e' },
  { id: 'smartsheet', title: 'Enterprise SaaS', company: 'Smartsheet', color1: '#0a2a4a', color2: '#0d3b6e', accent: '#0070f3' },
  { id: 'wire-pulse', title: 'Asset Intelligence Dashboard', company: 'Wire Pulse', color1: '#1a1a1a', color2: '#2d2d2d', accent: '#f59e0b' },
  { id: 'american-logistics', title: 'Healthcare Logistics Suite', company: 'American Logistics', color1: '#0f2027', color2: '#203a43', accent: '#c084fc' },
  { id: 'lilt', title: 'Enterprise Marketing Platform', company: 'Lilt', color1: '#001524', color2: '#001f3f', accent: '#60a5fa' },
  { id: 'iservice', title: 'Dealer Service Suite', company: 'iService', color1: '#1a0533', color2: '#2d0a4e', accent: '#e879f9' },
  { id: 'veteran-crowd', title: 'Veteran Rewards Platform', company: 'Veteran Crowd', color1: '#0a1628', color2: '#0d2137', accent: '#ef4444' },
]

const outDir = path.join(__dirname, '../public/project-screenshots')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

projects.forEach(({ id, title, company, color1, color2, accent }) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="bar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${accent};stop-opacity:0.9" />
      <stop offset="100%" style="stop-color:${accent};stop-opacity:0.2" />
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#bg)"/>
  <!-- Decorative bars -->
  <rect x="40" y="180" width="200" height="6" rx="3" fill="url(#bar)" opacity="0.7"/>
  <rect x="40" y="200" width="140" height="6" rx="3" fill="url(#bar)" opacity="0.5"/>
  <rect x="40" y="220" width="170" height="6" rx="3" fill="url(#bar)" opacity="0.4"/>
  <!-- Right panel mockup -->
  <rect x="460" y="120" width="280" height="160" rx="8" fill="${accent}" opacity="0.08"/>
  <rect x="460" y="120" width="280" height="160" rx="8" fill="none" stroke="${accent}" stroke-width="1" opacity="0.2"/>
  <!-- Dots row -->
  <circle cx="480" cy="148" r="5" fill="${accent}" opacity="0.6"/>
  <circle cx="500" cy="148" r="5" fill="${accent}" opacity="0.4"/>
  <circle cx="520" cy="148" r="5" fill="${accent}" opacity="0.2"/>
  <!-- Text placeholders inside panel -->
  <rect x="480" y="168" width="120" height="5" rx="2" fill="white" opacity="0.15"/>
  <rect x="480" y="183" width="80" height="5" rx="2" fill="white" opacity="0.1"/>
  <rect x="480" y="198" width="100" height="5" rx="2" fill="white" opacity="0.08"/>
  <!-- Centered label -->
  <text x="400" y="340" text-anchor="middle" fill="white" opacity="0.9" font-family="system-ui,sans-serif" font-size="22" font-weight="600">${title}</text>
  <text x="400" y="370" text-anchor="middle" fill="white" opacity="0.45" font-family="system-ui,sans-serif" font-size="14">${company}</text>
  <!-- Accent bar bottom -->
  <rect x="340" y="390" width="120" height="3" rx="1.5" fill="${accent}" opacity="0.6"/>
</svg>`

  fs.writeFileSync(path.join(outDir, `${id}.png`), svg)
  console.log(`  ✓ ${id}.png (SVG placeholder)`)
})

console.log(`\n${projects.length} placeholders written to public/project-screenshots/`)
