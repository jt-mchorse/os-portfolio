/**
 * Generate favicon set from the primary brand logo.
 *
 * Source: public/branding/primary-logo.png
 * Crops the LCS shield mark (top portion of the logo) and emits the favicon
 * set Next.js consumes from src/app/.
 */
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SRC = path.join(ROOT, 'public', 'branding', 'primary-logo.png')
const APP = path.join(ROOT, 'src', 'app')
const PUB = path.join(ROOT, 'public')

if (!fs.existsSync(SRC)) {
  console.error('Missing source logo at', SRC)
  process.exit(1)
}

const meta = await sharp(SRC).metadata()
console.log(`Source: ${meta.width} × ${meta.height}`)

// Crop just the LCS shield mark — the logo image is "mark above text".
// The mark occupies roughly the top 48% of the image; text starts ~52% down.
const cropTop = Math.round(meta.height * 0.10)
const cropHeight = Math.round(meta.height * 0.42)
const cropSide = Math.round(meta.width * 0.18)
const cropWidth = meta.width - cropSide * 2

console.log(`Crop: ${cropWidth} × ${cropHeight} from (${cropSide}, ${cropTop})`)

const markBuffer = await sharp(SRC)
  .extract({ left: cropSide, top: cropTop, width: cropWidth, height: cropHeight })
  .toBuffer()

// Pad to a square with the brand cream background so it tiles cleanly at all sizes
const dim = Math.max(cropWidth, cropHeight) + 80
const squareBuffer = await sharp({
  create: {
    width: dim,
    height: dim,
    channels: 4,
    background: { r: 250, g: 250, b: 249, alpha: 1 },
  },
})
  .composite([
    {
      input: markBuffer,
      gravity: 'center',
    },
  ])
  .png()
  .toBuffer()

// Square version with NAVY background — used for app/maskable icons
const navyBuffer = await sharp({
  create: {
    width: dim,
    height: dim,
    channels: 4,
    background: { r: 26, g: 41, b: 76, alpha: 1 }, // brand navy
  },
})
  .composite([
    {
      input: markBuffer,
      gravity: 'center',
    },
  ])
  .png()
  .toBuffer()

// ─── Emit Next.js App Router icon files ────────────────────────────────────
async function write(buffer, destPath, size) {
  const out = await sharp(buffer).resize(size, size).png().toBuffer()
  fs.writeFileSync(destPath, out)
  console.log(`✓ ${path.relative(ROOT, destPath)}  (${size}×${size})`)
}

// src/app/icon.png — 32×32 default
await write(squareBuffer, path.join(APP, 'icon.png'), 32)

// src/app/apple-icon.png — 180×180
await write(navyBuffer, path.join(APP, 'apple-icon.png'), 180)

// public/icon-192.png and icon-512.png for PWA / OG fallback
await write(navyBuffer, path.join(PUB, 'icon-192.png'), 192)
await write(navyBuffer, path.join(PUB, 'icon-512.png'), 512)

// public/favicon.ico — multi-size .ico (sharp doesn't emit ICO; ship a 32×32 PNG renamed)
const ico = await sharp(squareBuffer).resize(32, 32).png().toBuffer()
fs.writeFileSync(path.join(PUB, 'favicon.png'), ico)
console.log(`✓ public/favicon.png (32×32)`)

console.log('\nDone.')
