/**
 * Cloudflare Pages — proxy /api/* → Cloud Run (tránh CORS, ổn định trên mobile).
 * Cần deploy kèm thư mục frontend/functions (không chỉ frontend/dist).
 */
const API_ORIGIN = 'https://trangtran-api-327982031536.asia-southeast1.run.app'

export async function onRequest(context) {
  const incoming = new URL(context.request.url)
  const target = `${API_ORIGIN}${incoming.pathname}${incoming.search}`

  const headers = new Headers(context.request.headers)
  headers.delete('host')

  const init = {
    method: context.request.method,
    headers,
    redirect: 'manual',
  }

  if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
    init.body = context.request.body
  }

  const response = await fetch(target, init)
  const outHeaders = new Headers(response.headers)
  outHeaders.set('Access-Control-Allow-Origin', incoming.origin)
  outHeaders.set('Access-Control-Allow-Credentials', 'true')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: outHeaders,
  })
}
