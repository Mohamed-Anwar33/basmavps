import { MetadataRoute } from 'next'

export function GET(): Response {
  const robots: MetadataRoute.Robots = {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/private/', '/admin/', '/dashboard/', '/temp/', '/*.json$', '/.env*'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/private/', '/admin/', '/dashboard/', '/temp/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/private/', '/admin/', '/dashboard/', '/temp/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'Yandex',
        allow: '/',
        disallow: ['/api/', '/_next/', '/private/', '/admin/', '/dashboard/', '/temp/'],
        crawlDelay: 2,
      }
    ],
    sitemap: 'https://basmatdesign.cloud/sitemap.xml',
    host: 'https://basmatdesign.cloud',
  }

  const robotsText = `# بصمة تصميم - Basmat Design
# شركة التصميم والهوية البصرية الأولى
# https://basmatdesign.cloud

User-agent: *
Allow: /
Allow: /services/
Allow: /about
Allow: /portfolio
Allow: /blog/
Allow: /contact
Allow: /order
Allow: /faq
Allow: /how-to-order
Allow: /pricing

# Disallow sensitive areas
Disallow: /api/
Disallow: /_next/
Disallow: /private/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /temp/
Disallow: /*.json$
Disallow: /.env*
Disallow: /node_modules/

# Specific bot configurations
User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /private/
Disallow: /admin/
Disallow: /dashboard/
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /private/
Disallow: /admin/
Disallow: /dashboard/
Crawl-delay: 1

User-agent: Yandex
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /private/
Disallow: /admin/
Disallow: /dashboard/
Crawl-delay: 2

# Block unwanted bots
User-agent: SemrushBot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

# Sitemap location
Sitemap: https://basmatdesign.cloud/sitemap.xml

# Host specification
Host: https://basmatdesign.cloud

# Clean URLs
Clean-param: utm_source&utm_medium&utm_campaign&utm_content&utm_term&gclid&fbclid`

  return new Response(robotsText, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  })
}
