import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BlogPost } from "@/components/blog-post"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { apiFetch } from "@/lib/api"

type BlogListItem = {
  _id: string
  title: string
  excerpt?: string
  slug: string
  tags?: string[]
  coverImage?: string
  createdAt: string
}

type BlogDetail = {
  _id: string
  title: string
  excerpt?: string
  content: string
  slug: string
  tags?: string[]
  coverImage?: string
  createdAt: string
  updatedAt?: string
}

export async function generateStaticParams() {
  try {
    const res: any = await apiFetch(`/blogs?lang=ar`)
    const list: any[] = Array.isArray(res) ? res : (res?.data?.blogs || res?.blogs || [])
    return list.map((b) => ({ slug: b.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const res: any = await apiFetch(`/blogs/${params.slug}?lang=ar`)
    const post: any = res?.data?.blog || res || {}
    const titleText = typeof post.title === 'string' ? post.title : (post.title?.ar || post.title?.en || '')
    const excerptText = typeof post.excerpt === 'string' ? post.excerpt : (post.excerpt?.ar || post.excerpt?.en || '')
    const title = `${titleText} | بصمة تصميم`
    const description = excerptText || ""
    const image = post.coverImage || "/og-image.png"
    return {
      title,
      description,
      keywords: [...(post.tags || []), "بصمة تصميم", "تصميم", "محتوى رقمي"],
      openGraph: {
        title,
        description,
        type: "article",
        url: `https://basmatdesign.com/blog/${params.slug}`,
        images: [{ url: image, width: 1200, height: 630, alt: titleText }],
        publishedTime: post.createdAt,
        tags: post.tags,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
      alternates: { canonical: `https://basmatdesign.com/blog/${params.slug}` },
    }
  } catch {
    return {
      title: "المقال غير موجود | بصمة تصميم",
      description: "المقال المطلوب غير موجود",
    }
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  let post: BlogDetail | null = null
  try {
    const res: any = await apiFetch(`/blogs/${params.slug}?lang=ar`, { cache: 'no-store' })
    const raw: any = res?.data?.blog || res || null
    if (raw) {
      post = {
        _id: raw._id,
        title: typeof raw.title === 'string' ? raw.title : (raw.title?.ar || raw.title?.en || ''),
        excerpt: typeof raw.excerpt === 'string' ? raw.excerpt : (raw.excerpt?.ar || raw.excerpt?.en || ''),
        content: typeof raw.content === 'string' ? raw.content : (raw.content?.ar || raw.content?.en || ''),
        slug: raw.slug,
        tags: Array.isArray(raw.tags) ? raw.tags : [],
        coverImage: raw.coverImage,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      }
    }
  } catch {
    return notFound()
  }

  if (!post) {
    return notFound()
  }

  const mapped = {
    title: post.title || "عنوان المقال",
    excerpt: post.excerpt || "",
    content: post.content || "",
    category: (post.tags && post.tags[0]) || "مدونة",
    author: "فريق بصمة تصميم",
    date: post.createdAt,
    readTime: `${Math.max(3, Math.round((post.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length / 200))} دقائق`,
    image: post.coverImage || "/placeholder.svg",
    tags: post.tags || [],
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <BlogPost post={mapped} />
      </main>
      <Footer />
    </div>
  )
}
