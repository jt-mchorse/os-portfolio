import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'public', 'project-screenshots')
fs.mkdirSync(OUT, { recursive: true })

const targets = [
  { id: 'ams-platform', url: 'https://atlantamediaservices.com' },
  { id: 'shelton-ai', url: 'https://www.sheltonai.com' },
  { id: 'smartsheet', url: 'https://www.smartsheet.com' },
  { id: 'wire-pulse', url: 'https://www.wirepulse.io' },
  { id: 'american-logistics', url: 'https://americanlogistics.com' },
  { id: 'lilt', url: 'https://lilt.com' },
  { id: 'iservice', url: 'https://dealerbuilt.com/solutions/iservice/' },
  { id: 'veteran-crowd', url: 'https://www.veterancrowd.com/home' },
]

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
})

for (const t of targets) {
  const page = await ctx.newPage()
  console.log(`→ ${t.id} (${t.url})`)
  try {
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 45_000 })
  } catch (e) {
    console.warn(`  load timeout, falling back to domcontentloaded: ${e.message}`)
    try {
      await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    } catch (err) {
      console.error(`  ✗ failed: ${err.message}`)
      await page.close()
      continue
    }
  }
  // give any lazy images / cookie banners a beat
  await page.waitForTimeout(2500)
  // hide common cookie banners
  await page
    .evaluate(() => {
      const sels = [
        '#onetrust-banner-sdk',
        '#onetrust-consent-sdk',
        '[id*="cookie"i]',
        '[class*="cookie-banner"i]',
        '[class*="CookieBanner"]',
        '[aria-label*="cookie"i]',
      ]
      for (const s of sels)
        document.querySelectorAll(s).forEach((el) => el.remove())
    })
    .catch(() => {})

  const out = path.join(OUT, `${t.id}.png`)
  await page.screenshot({
    path: out,
    fullPage: false,
    clip: { x: 0, y: 0, width: 1440, height: 900 },
  })
  console.log(`  ✓ saved ${out}`)
  await page.close()
}

await browser.close()
console.log('\nDone.')
