import { MetadataRoute } from 'next'

export function GET(): Response {
  const robots: MetadataRoute.Robots = {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/private/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/private/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/private/'],
      },
    ],
    sitemap: 'https://basmatdesign.com/sitemap.xml',
    host: 'https://basmatdesign.com',
  }

  const robotsText = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /private/

User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /private/

User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /private/

Sitemap: https://basmatdesign.com/sitemap.xml
Host: https://basmatdesign.com`

  return new Response(robotsText, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
