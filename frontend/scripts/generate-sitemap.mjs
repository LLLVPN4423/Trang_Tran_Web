/**
 * Sinh sitemap.xml lúc build — thêm URL từng dịch vụ/sản phẩm đang bật từ API.
 * Không làm fail build nếu API tạm không phản hồi (giữ URL tĩnh).
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../public/sitemap.xml')

const SITE = (process.env.SITEMAP_SITE_URL || 'https://trangtran-hair.pages.dev').replace(/\/$/, '')
const API = (
  process.env.VITE_API_URL ||
  process.env.SITEMAP_API_URL ||
  'https://trangtran-api-327982031536.asia-southeast1.run.app'
).replace(/\/$/, '')

const today = new Date().toISOString().slice(0, 10)

/** Chỉ URL công khai đáng index — bỏ login/register/booking (ít giá trị SEO). */
const STATIC_ROUTES = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/catalog', priority: '0.9', changefreq: 'weekly' },
  { loc: '/appointment', priority: '0.95', changefreq: 'weekly' },
  { loc: '/khu-vuc', priority: '0.9', changefreq: 'monthly' },
  { loc: '/shop', priority: '0.8', changefreq: 'weekly' },
  // Phase 1A legal pages (public, indexable)
  { loc: '/chinh-sach-bao-mat', priority: '0.5', changefreq: 'monthly' },
  { loc: '/dieu-khoan-giao-dich', priority: '0.5', changefreq: 'monthly' },
  { loc: '/chinh-sach-thanh-toan', priority: '0.5', changefreq: 'monthly' },
  { loc: '/chinh-sach-giao-hang-doi-tra', priority: '0.5', changefreq: 'monthly' },
  { loc: '/lien-he-khieu-nai', priority: '0.4', changefreq: 'monthly' },
  { loc: '/thong-tin-kinh-doanh', priority: '0.5', changefreq: 'monthly' },
]

async function fetchJson(path) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 25_000)
  try {
    const res = await fetch(`${API}${path}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`${path} → ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

function urlEntry(loc, priority, changefreq) {
  return `  <url><loc>${SITE}${loc}</loc><lastmod>${today}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
}

async function main() {
  const entries = STATIC_ROUTES.map((r) => urlEntry(r.loc, r.priority, r.changefreq))

  try {
    const services = await fetchJson('/api/services')
    if (Array.isArray(services)) {
      for (const s of services) {
        if (!s?.id || s.isActive === false) continue
        entries.push(urlEntry(`/catalog/service/${encodeURIComponent(s.id)}`, '0.75', 'weekly'))
      }
    }
  } catch (err) {
    console.warn('[sitemap] Bỏ qua dịch vụ:', err.message ?? err)
  }

  try {
    const products = await fetchJson('/api/products')
    if (Array.isArray(products)) {
      for (const p of products) {
        if (!p?.id || p.isActive === false) continue
        entries.push(urlEntry(`/catalog/product/${encodeURIComponent(p.id)}`, '0.65', 'weekly'))
      }
    }
  } catch (err) {
    console.warn('[sitemap] Bỏ qua sản phẩm:', err.message ?? err)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n${entries.join('\n\n')}\n\n</urlset>\n`
  writeFileSync(OUT, xml, 'utf8')
  console.log(`[sitemap] ${entries.length} URL → ${OUT}`)
}

main()
