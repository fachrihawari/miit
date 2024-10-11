import { NextRequest, NextResponse } from "next/server"

export async function middleware(req: NextRequest) {
  const username = req.cookies.get('username')
  if (username && req.nextUrl.pathname === '/onboarding') {
    return NextResponse.redirect(new URL('/', req.url))
  } else if (!username && req.nextUrl.pathname !== '/onboarding') {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }
} 

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ]
}