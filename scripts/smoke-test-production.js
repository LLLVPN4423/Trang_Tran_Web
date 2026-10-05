#!/usr/bin/env node
/**
 * Smoke test production (Cloud Run API + Cloudflare Pages).
 * Usage: node scripts/smoke-test-production.js
 */

const fs = require('fs')
const path = require('path')

const API =
  process.env.VITE_API_URL ||
  readEnv('VITE_API_URL') ||
  'https://trangtran-api-327982031536.asia-southeast1.run.app'
const FRONTEND =
  process.env.FRONTEND_URL ||
  readEnv('FRONTEND_URL') ||
  'https://trangtran-hair.pages.dev'

const results = []
let failed = 0

function readEnv(key) {
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) return null
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    if (trimmed.slice(0, eq).trim() === key) return trimmed.slice(eq + 1).trim()
  }
  return null
}

function pass(name, detail = '') {
  results.push({ ok: true, name, detail })
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`)
}

function fail(name, detail = '') {
  failed++
  results.push({ ok: false, name, detail })
  console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`)
}

async function request(method, urlPath, { body, origin, auth, expectStatus } = {}) {
  const url = urlPath.startsWith('http') ? urlPath : `${API}${urlPath}`
  const headers = { Accept: 'application/json' }
  if (body) headers['Content-Type'] = 'application/json'
  if (origin) headers.Origin = origin
  if (auth) headers.Authorization = `Bearer ${auth}`

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = null
  const text = await res.text()
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (expectStatus && !expectStatus.includes(res.status)) {
    throw new Error(`expected ${expectStatus.join('|')}, got ${res.status}: ${text.slice(0, 200)}`)
  }
  return { status: res.status, data, headers: res.headers }
}

async function testApi() {
  console.log('\n=== API (Cloud Run) ===\n')

  try {
    const health = await request('GET', '/api/health')
    if (health.status !== 200) throw new Error(`status ${health.status}`)
    if (health.data?.persistence?.mode !== 'firestore') {
      throw new Error(`persistence=${health.data?.persistence?.mode}`)
    }
    if (!health.data?.firebase?.adminAllowlistConfigured) {
      throw new Error('admin allowlist not configured')
    }
    pass('GET /api/health', `firestore, admin UIDs=${health.data.firebase.adminAllowlistCount}`)
  } catch (e) {
    fail('GET /api/health', e.message)
  }

  try {
    const cors = await request('OPTIONS', '/api/services', { origin: FRONTEND })
    const allowOrigin = cors.headers.get('access-control-allow-origin')
    if (allowOrigin !== FRONTEND && allowOrigin !== '*') {
      throw new Error(`CORS origin=${allowOrigin}`)
    }
    pass('CORS preflight', allowOrigin)
  } catch (e) {
    fail('CORS preflight', e.message)
  }

  let services = []
  let products = []
  let promotions = []

  try {
    const res = await request('GET', '/api/services', { origin: FRONTEND })
    if (res.status !== 200 || !Array.isArray(res.data) || res.data.length === 0) {
      throw new Error(`services count=${res.data?.length ?? 0}`)
    }
    services = res.data
    pass('GET /api/services', `${services.length} items`)
  } catch (e) {
    fail('GET /api/services', e.message)
  }

  try {
    const res = await request('GET', '/api/products', { origin: FRONTEND })
    if (res.status !== 200 || !Array.isArray(res.data) || res.data.length === 0) {
      throw new Error(`products count=${res.data?.length ?? 0}`)
    }
    products = res.data
    pass('GET /api/products', `${products.length} items`)
  } catch (e) {
    fail('GET /api/products', e.message)
  }

  try {
    const res = await request('GET', '/api/promotions', { origin: FRONTEND })
    if (res.status !== 200 || !Array.isArray(res.data)) {
      throw new Error(`status ${res.status}`)
    }
    promotions = res.data
    pass('GET /api/promotions', `${promotions.length} active`)
  } catch (e) {
    fail('GET /api/promotions', e.message)
  }

  if (services[0]) {
    try {
      const res = await request('GET', `/api/services/${encodeURIComponent(services[0].id)}`)
      if (res.status !== 200 || res.data?.id !== services[0].id) throw new Error('not found')
      pass('GET /api/services/:id', services[0].id)
    } catch (e) {
      fail('GET /api/services/:id', e.message)
    }
  }

  if (products[0]) {
    try {
      const res = await request('GET', `/api/products/${encodeURIComponent(products[0].id)}`)
      if (res.status !== 200 || res.data?.id !== products[0].id) throw new Error('not found')
      pass('GET /api/products/:id', products[0].id)
    } catch (e) {
      fail('GET /api/products/:id', e.message)
    }
  }

  try {
    const res = await request('GET', '/api/loyalty/rules')
    if (res.status !== 200) throw new Error(`status ${res.status}`)
    pass('GET /api/loyalty/rules')
  } catch (e) {
    fail('GET /api/loyalty/rules', e.message)
  }

  try {
    const res = await request('GET', '/api/shipping/zones')
    if (res.status !== 200 || !Array.isArray(res.data) || res.data.length < 4) {
      throw new Error(`expected 4+ zones, got ${res.data?.length}`)
    }
    pass('GET /api/shipping/zones', `${res.data.length} zones`)
  } catch (e) {
    fail('GET /api/shipping/zones', e.message)
  }

  // Auth required endpoints
  for (const [name, path] of [
    ['GET /api/orders (no auth)', '/api/orders'],
    ['GET /api/customers (no auth)', '/api/customers'],
    ['GET /api/health/admin (no auth)', '/api/health/admin'],
    ['GET /api/customers/me (no auth)', '/api/customers/me'],
    ['GET /api/appointments/me (no auth)', '/api/appointments/me'],
    ['GET /api/admin/revenue/summary (no auth)', '/api/admin/revenue/summary?from=2026-01-01&to=2026-01-07'],
  ]) {
    try {
      const res = await request('GET', path)
      if (res.status !== 401 && res.status !== 403) {
        throw new Error(`expected 401/403, got ${res.status}`)
      }
      pass(name, String(res.status))
    } catch (e) {
      fail(name, e.message)
    }
  }

  // Guest appointment
  try {
    const res = await request('POST', '/api/appointments', {
      origin: FRONTEND,
      body: {
        customerName: 'Smoke Test',
        customerPhone: '0999888777',
        serviceInterest: 'Cắt tóc',
        notes: 'auto smoke test — có thể xóa',
      },
      expectStatus: [201],
    })
    if (!res.data?.id || !res.data?.accessToken) throw new Error('missing id/token')
    pass('POST /api/appointments (guest)', res.data.id)

    const get = await request('GET', `/api/appointments/${res.data.id}?token=${encodeURIComponent(res.data.accessToken)}`)
    if (get.status !== 200) throw new Error(`token get ${get.status}`)
    pass('GET /api/appointments/:id?token', res.data.id)

    const denied = await request('GET', `/api/appointments/${res.data.id}`)
    if (denied.status !== 401 && denied.status !== 403) {
      throw new Error(`expected 401/403 without token, got ${denied.status}`)
    }
    pass('GET /api/appointments/:id (no token)', String(denied.status))
  } catch (e) {
    fail('Guest appointment flow', e.message)
  }

  // Guest order — bank transfer + pickup (default)
  if (products[0]) {
    try {
      const res = await request('POST', '/api/orders', {
        origin: FRONTEND,
        body: {
          customerName: 'Smoke Test Order',
          customerPhone: '0999888776',
          customerEmail: null,
          notes: 'auto smoke test — có thể xóa',
          paymentMethod: 'BankTransfer',
          fulfillmentMethod: 'Pickup',
          items: [{ itemId: products[0].id, itemType: 'Product', quantity: 1 }],
        },
        expectStatus: [201],
      })
      if (!res.data?.id || !res.data?.accessToken) throw new Error('missing id/token')
      if (res.data.paymentMethod !== 'BankTransfer') throw new Error('paymentMethod mismatch')
      if (res.data.fulfillmentMethod !== 'Pickup') throw new Error('fulfillment mismatch')
      pass('POST /api/orders (guest, CK + lấy tại tiệm)', `${res.data.id} — ${res.data.totalAmount}đ`)

      const get = await request('GET', `/api/orders/${res.data.id}?token=${encodeURIComponent(res.data.accessToken)}`)
      if (get.status !== 200) throw new Error(`token get ${get.status}`)
      pass('GET /api/orders/:id?token', res.data.id)

      const denied = await request('GET', `/api/orders/${res.data.id}`)
      if (denied.status !== 401 && denied.status !== 403) {
        throw new Error(`expected 401/403 without token, got ${denied.status}`)
      }
      pass('GET /api/orders/:id (no token)', String(denied.status))
    } catch (e) {
      fail('Guest order flow (CK + pickup)', e.message)
    }
  }

  // COD + delivery
  if (products[0]) {
    try {
      const res = await request('POST', '/api/orders', {
        origin: FRONTEND,
        body: {
          customerName: 'Smoke COD',
          customerPhone: '0999888775',
          customerEmail: null,
          notes: 'smoke COD — có thể xóa',
          paymentMethod: 'COD',
          fulfillmentMethod: 'Delivery',
          deliveryAddress: '123 Test St, Sóc Trăng',
          shippingZone: 'SocTrangCity',
          items: [{ itemId: products[0].id, itemType: 'Product', quantity: 1 }],
        },
        expectStatus: [201],
      })
      if (res.data?.paymentMethod !== 'COD') throw new Error('expected COD')
      if (res.data?.fulfillmentMethod !== 'Delivery') throw new Error('expected Delivery')
      if (!res.data?.deliveryAddress) throw new Error('missing deliveryAddress')
      if (res.data?.fulfillmentStatus !== 'AwaitingApproval') throw new Error('expected AwaitingApproval')
      if (!res.data?.shippingFee || res.data.shippingFee < 1) throw new Error('missing shippingFee')
      pass('POST /api/orders (COD + giao hàng)', `${res.data.paymentCode} + ship ${res.data.shippingFee}đ`)
    } catch (e) {
      fail('COD + delivery order', e.message)
    }
  }

  // Reject service in product order
  if (products[0] && services[0]) {
    try {
      const res = await request('POST', '/api/orders', {
        origin: FRONTEND,
        body: {
          customerName: 'Smoke Bad',
          customerPhone: '0999888774',
          items: [
            { itemId: products[0].id, itemType: 'Product', quantity: 1 },
            { itemId: services[0].id, itemType: 'Service', quantity: 1 },
          ],
        },
        expectStatus: [400],
      })
      pass('POST /api/orders rejects Service items', String(res.status))
    } catch (e) {
      fail('Reject service in order', e.message)
    }
  }

  // Delivery without address
  if (products[0]) {
    try {
      await request('POST', '/api/orders', {
        origin: FRONTEND,
        body: {
          customerName: 'Smoke No Addr',
          customerPhone: '0999888773',
          fulfillmentMethod: 'Delivery',
          items: [{ itemId: products[0].id, itemType: 'Product', quantity: 1 }],
        },
        expectStatus: [400],
      })
      pass('POST /api/orders rejects delivery without address')
    } catch (e) {
      fail('Delivery without address validation', e.message)
    }
  }

  if (promotions[0]) {
    try {
      const res = await request('POST', '/api/promotions/validate', {
        body: { code: promotions[0].code, subtotalAmount: 500000 },
      })
      if (res.status !== 200) throw new Error(`status ${res.status}`)
      pass('POST /api/promotions/validate', promotions[0].code)
    } catch (e) {
      fail('POST /api/promotions/validate', e.message)
    }
  }
}

async function testFrontend() {
  console.log('\n=== Frontend (Cloudflare Pages) ===\n')

  try {
    const res = await fetch(`${FRONTEND}/`)
    const html = await res.text()
    if (res.status !== 200) throw new Error(`status ${res.status}`)
    if (!html.includes('id="root"')) throw new Error('missing root')
    pass('GET / (SPA shell)', '200')
  } catch (e) {
    fail('GET / (SPA shell)', e.message)
  }

  const routes = ['/catalog', '/shop', '/booking', '/appointment', '/login', '/register', '/admin', '/admin/revenue', '/account']
  for (const route of routes) {
    try {
      const res = await fetch(`${FRONTEND}${route}`)
      const html = await res.text()
      if (res.status !== 200) throw new Error(`status ${res.status}`)
      if (!html.includes('id="root"')) throw new Error('not SPA fallback')
      pass(`SPA route ${route}`)
    } catch (e) {
      fail(`SPA route ${route}`, e.message)
    }
  }

  try {
    const indexRes = await fetch(`${FRONTEND}/`)
    const indexHtml = await indexRes.text()
    const match = indexHtml.match(/src="(\/assets\/index-[^"]+\.js)"/)
    if (!match) throw new Error('main bundle not found in index.html')
    const mainJs = match[1]
    pass('index.html references main bundle', mainJs)

    const jsRes = await fetch(`${FRONTEND}${mainJs}`)
    if (jsRes.status !== 200) throw new Error(`main js ${jsRes.status}`)
    const js = await jsRes.text()
    if (!js.includes('trangtran-api') && !js.includes('327982031536')) {
      throw new Error('VITE_API_URL not embedded in bundle')
    }
    if (/typeof window[^;]{0,40}\?window\.location\.origin[^:]{0,80}:.+?apiUrl/.test(js)) {
      throw new Error('bundle uses Pages /api (window.location.origin) — catalog will break without Functions')
    }
    if (!js.includes('Moroccanoil') && !js.includes('paymentMethod')) {
      throw new Error('checkout P1 strings not in bundle')
    }
    if (!js.includes('trangtranhairsalon-872c5')) {
      throw new Error('Firebase config not embedded')
    }
    pass('Main bundle has API + Firebase config')

    const adminMatch = js.match(/AdminLayout-[^"]+\.js/)
    if (!adminMatch) throw new Error('AdminLayout chunk ref not found')
    const adminRes = await fetch(`${FRONTEND}/assets/${adminMatch[0]}`)
    if (adminRes.status !== 200) throw new Error(`admin chunk ${adminRes.status}`)
    pass('Admin lazy chunk exists', adminMatch[0])
  } catch (e) {
    fail('Frontend bundle integrity', e.message)
  }

  try {
    const res = await fetch(`${FRONTEND}/index.html`, { headers: { 'Cache-Control': 'no-cache' } })
    const cc = res.headers.get('cache-control') || ''
    if (!/no-cache|no-store|must-revalidate/i.test(cc)) {
      fail('index.html cache headers', cc || '(none)')
    } else {
      pass('index.html cache headers', cc)
    }
  } catch (e) {
    fail('index.html cache headers', e.message)
  }

  try {
    const res = await fetch(`${API}/api/services`, { headers: { Origin: FRONTEND } })
    if (res.status !== 200) throw new Error(`cross-origin API ${res.status}`)
    pass('Browser-origin API call simulation', `${(await res.json()).length} services`)
  } catch (e) {
    fail('Browser-origin API call simulation', e.message)
  }
}

async function main() {
  console.log(`\nSmoke test production`)
  console.log(`  API:      ${API}`)
  console.log(`  Frontend: ${FRONTEND}`)

  await testApi()
  await testFrontend()

  console.log('\n=== Summary ===\n')
  const passed = results.filter((r) => r.ok).length
  console.log(`  ${passed}/${results.length} passed, ${failed} failed\n`)

  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
