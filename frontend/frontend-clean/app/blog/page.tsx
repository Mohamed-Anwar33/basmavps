import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import BlogContent from "./blog-content"

export const metadata = {
  title: "المدونة | بصمة تصميم - مقالات التصميم والمحتوى الرقمي",
  description: "اكتشف أحدث المقالات والنصائح في عالم التصميم والمحتوى الرقمي، الهوية البصرية، السوشيال ميديا، والتسويق الرقمي من خبراء بصمة تصميم.",
  keywords: ["مدونة تصميم", "مقالات تصميم", "نصائح تصميم", "هوية بصرية", "سوشيال ميديا", "تسويق رقمي", "محتوى رقمي"],
  openGraph: {
    title: "المدونة | بصمة تصميم - مقالات التصميم والمحتوى الرقمي",
    description: "اكتشف أحدث المقالات والنصائح في عالم التصميم والمحتوى الرقمي، الهوية البصرية، السوشيال ميديا، والتسويق الرقمي من خبراء بصمة تصميم.",
    type: "website",
    url: "https://basmatdesign.com/blog",
    images: [{
      url: "/blog-og-image.jpg",
      width: 1200,
      height: 630,
      alt: "مدونة بصمة تصميم - مقالات التصميم والمحتوى الرقمي"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "المدونة | بصمة تصميم - مقالات التصميم والمحتوى الرقمي",
    description: "اكتشف أحدث المقالات والنصائح في عالم التصميم والمحتوى الرقمي من خبراء بصمة تصميم.",
    images: ["/blog-og-image.jpg"]
  },
  alternates: {
    canonical: "https://basmatdesign.com/blog"
  }
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16 relative z-20">
        <BlogContent />
      </main>
      <Footer />
    </div>
  )
}
