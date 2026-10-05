/**
 * Cloudflare Pages Function — proxy Firebase Auth (same-origin cho Chrome mobile).
 * Deploy: wrangler pages deploy frontend (không chỉ frontend/dist).
 */
export async function onRequest(context) {
  const url = new URL(context.request.url)
  const target = new URL(
    `https://trangtranhairsalon-872c5.firebaseapp.com${url.pathname}${url.search}`,
  )

  const headers = new Headers(context.request.headers)
  headers.set('Host', 'trangtranhairsalon-872c5.firebaseapp.com')

  const init = {
    method: context.request.method,
    headers,
    redirect: 'manual',
  }

  if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
    init.body = context.request.body
  }

  return fetch(target.toString(), init)
}
