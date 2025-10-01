"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Search, Calendar, Clock, User, ArrowLeft } from "lucide-react"

const categories = ["الكل", "نصائح التصميم", "اتجاهات", "قصص نجاح", "أدوات", "إلهام"]

const blogPosts = [
  {
    id: "design-trends-2025",
    title: "أحدث اتجاهات التصميم لعام 2025",
    excerpt: "اكتشف الاتجاهات الجديدة التي ستهيمن على عالم التصميم في العام القادم",
    category: "اتجاهات",
    author: "فريق بصمة تصميم",
    date: "2024-12-15",
    readTime: "5 دقائق",
    image: "/modern-design-trends-2025.jpg",
    tags: ["تصميم", "اتجاهات", "2025"],
  },
  {
    id: "social-media-design-tips",
    title: "10 نصائح لتصميم محتوى سوشيال ميديا جذاب",
    excerpt: "تعلم كيفية إنشاء تصاميم تجذب الانتباه وتزيد من التفاعل على منصات التواصل الاجتماعي",
    category: "نصائح التصميم",
    author: "أحمد محمد",
    date: "2024-12-10",
    readTime: "7 دقائق",
    image: "/social-media-design-tips.jpg",
    tags: ["سوشيال ميديا", "نصائح", "تصميم"],
  },
  {
    id: "brand-identity-success-story",
    title: "قصة نجاح: كيف غيرت الهوية البصرية مسار شركة ناشئة",
    excerpt: "رحلة تحويل شركة ناشئة من خلال تصميم هوية بصرية قوية ومؤثرة",
    category: "قصص نجاح",
    author: "فاطمة أحمد",
    date: "2024-12-05",
    readTime: "6 دقائق",
    image: "/brand-identity-success-story.jpg",
    tags: ["هوية بصرية", "قصة نجاح", "شركات ناشئة"],
  },
  {
    id: "design-tools-2024",
    title: "أفضل أدوات التصميم التي يجب أن تعرفها",
    excerpt: "مراجعة شاملة لأحدث وأفضل أدوات التصميم المتاحة للمصممين المحترفين",
    category: "أدوات",
    author: "محمد علي",
    date: "2024-11-28",
    readTime: "8 دقائق",
    image: "/design-tools-software.jpg",
    tags: ["أدوات", "برامج", "تصميم"],
  },
  {
    id: "color-psychology-design",
    title: "علم نفس الألوان في التصميم",
    excerpt: "فهم تأثير الألوان على المشاعر وكيفية استخدامها بفعالية في تصاميمك",
    category: "نصائح التصميم",
    author: "فريق بصمة تصميم",
    date: "2024-11-20",
    readTime: "6 دقائق",
    image: "/color-psychology-design.jpg",
    tags: ["ألوان", "علم نفس", "تصميم"],
  },
  {
    id: "minimalist-design-inspiration",
    title: "الإلهام من التصميم البسيط: أقل هو أكثر",
    excerpt: "اكتشف قوة البساطة في التصميم وكيف يمكن للتصميم البسيط أن يكون أكثر تأثيراً",
    category: "إلهام",
    author: "أحمد محمد",
    date: "2024-11-15",
    readTime: "4 دقائق",
    image: "/minimalist-design-inspiration.jpg",
    tags: ["بساطة", "إلهام", "تصميم"],
  },
]

export function BlogGrid() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("الكل")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "الكل" || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString: string) => {
    if (!isMounted) {
      // Return a static format during SSR to match server rendering
      const date = new Date(dateString)
      const day = date.getDate()
      const months = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
      ]
      const month = months[date.getMonth()]
      const year = date.getFullYear()
      return `${day} ${month} ${year}`
    }
    
    // Use browser locale after hydration
    const date = new Date(dateString)
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Search and Filter */}
          <div className="mb-12 space-y-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="ابحث في المقالات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 arabic-text"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2 items-start">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="arabic-text"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-max items-start">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border/50 overflow-hidden"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-full object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs arabic-text">
                      {post.category}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground arabic-text leading-tight group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground arabic-text leading-relaxed">{post.excerpt}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="arabic-text">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className="arabic-text">{formatDate(post.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="arabic-text">{post.readTime}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs arabic-text">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-primary hover:bg-primary/10 arabic-text group/btn"
                    asChild
                  >
                    <Link href={`/blog/${post.id}`} className="flex items-center justify-center gap-2">
                      اقرأ المقال
                      <ArrowLeft className="h-4 w-4 rtl-flip group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground arabic-text">لم يتم العثور على مقالات تطابق البحث</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
