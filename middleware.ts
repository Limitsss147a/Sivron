import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { kv } from '@vercel/kv'

export async function middleware(request: NextRequest) {
  // 1. Content Security Policy (Nonce-based)
  const nonce = crypto.randomUUID()
  const isDev = process.env.NODE_ENV !== 'production'
  
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://ktsmqpzifzjsjgfowvph.supabase.co https://va.vercel-scripts.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://ktsmqpzifzjsjgfowvph.supabase.co;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://ktsmqpzifzjsjgfowvph.supabase.co wss://ktsmqpzifzjsjgfowvph.supabase.co https://vitals.vercel-insights.com;
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()

  request.headers.set('x-nonce', nonce)
  request.headers.set('Content-Security-Policy', cspHeader)

  // 2. Session Management
  const response = await updateSession(request)

  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('x-nonce', nonce)
  // 2. Rate Limiting (10 requests per 10 seconds per IP)
  // Only apply to critical routes (e.g., /api/auth, /api/submissions)
  if (request.nextUrl.pathname.startsWith('/api/') || request.nextUrl.pathname.startsWith('/auth/')) {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const limit = 10
    const window = 10 // 10 seconds

    try {
      const currentRequests = await kv.incr(ip)
      if (currentRequests === 1) {
        await kv.expire(ip, window)
      }
      if (currentRequests > limit) {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })
      }
    } catch (e) {
      // If KV is not configured locally, fail open to avoid breaking dev
      console.warn('Rate limiting failed or KV is not configured:', e)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    '/((?!_next/static|_next/image|favicon.ico|icon-.*|apple-icon.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
