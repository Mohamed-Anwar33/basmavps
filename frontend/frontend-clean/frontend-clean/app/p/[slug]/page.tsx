import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { notFound } from "next/navigation"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"

type PageItem = {
  _id: string
  slug: string
  title: string | { ar: string; en: string }
  metaDescription?: string | { ar: string; en: string }
  content?: string | { ar: string; en: string }
  seoKeywords?: string[]
  isPublished?: boolean
}

export async function generateStaticParams() {
  // Optional: leave empty to render on-demand
  return []
}

export const dynamic = "force-dynamic"

export default async function PublicPage({ params }: { params: { slug: string } }) {
  const slug = params.slug
  let page: PageItem | null = null

  try {
    const res = await fetch(`${API_BASE}/pages/${slug}`, { cache: 'no-store' })
    if (res.status === 404) return notFound()
    if (!res.ok) throw new Error('Failed')
    page = await res.json()
  } catch {
    return notFound()
  }

  if (!page?.isPublished) return notFound()

  // Helper function to get text content from multilingual or string field
  const getTextContent = (field: string | { ar: string; en: string } | undefined): string => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field.ar || field.en || '';
  };

  // Helper function to get HTML content from multilingual or string field
  const getHtmlContent = (field: string | { ar: string; en: string } | undefined): string => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field.ar || field.en || '';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-primary arabic-text mb-6">
            {getTextContent(page.title)}
          </h1>
          {page.metaDescription && (
            <p className="text-muted-foreground arabic-text mb-6">
              {getTextContent(page.metaDescription)}
            </p>
          )}
          {page.content && (
            <div 
              className="prose max-w-none arabic-text" 
              dangerouslySetInnerHTML={{ __html: getHtmlContent(page.content) }} 
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
