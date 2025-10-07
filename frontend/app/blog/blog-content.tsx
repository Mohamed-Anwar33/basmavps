"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Clock, User, ArrowLeft, Search, Calendar, Eye } from "lucide-react"
import { apiFetch } from "@/lib/api"

const BlogContent = () => {
  const [selectedCategory, setSelectedCategory] = useState("جميع المقالات")
  const [searchTerm, setSearchTerm] = useState("")
  const [articles, setArticles] = useState<Array<{
    id: string
    title: string
    excerpt: string
    slug: string
    image: string
    publishDate: string
    readTime: string
    category: string
    tags: string[]
  }>>([])
  const [categories, setCategories] = useState<string[]>(["جميع المقالات"])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true)
      setError(null)
      try {
        const res: any = await apiFetch("/blogs?lang=ar", { method: "GET", cache: 'no-store' })
        // Support both array response and wrapped response { success, data: { blogs: [...] } }
        const list: any[] = Array.isArray(res) ? res : (res?.data?.blogs || res?.blogs || [])
        const mapped = list.map((b: any) => ({
          id: b._id,
          title: typeof b.title === 'string' ? b.title : (b.title?.ar || b.title?.en || ""),
          excerpt: typeof b.excerpt === 'string' ? b.excerpt : (b.excerpt?.ar || b.excerpt?.en || ""),
          slug: b.slug,
          image: b.coverImage || b.image || "/placeholder.svg",
          publishDate: new Date(b.createdAt || b.publishedAt || Date.now()).toLocaleDateString("ar-SA"),
          readTime: b.readingTime ? `${b.readingTime} دقائق` : "5 دقائق",
          category: (Array.isArray(b.tags) && b.tags[0]) || "مدونة",
          tags: Array.isArray(b.tags) ? b.tags : [],
        }))
        setArticles(mapped)
        if (typeof window !== 'undefined') {
        }
        const uniqueTags = Array.from(new Set(mapped.flatMap((m) => m.tags)))
        setCategories(["جميع المقالات", ...uniqueTags])
      } catch (e: any) {
        setError(e?.message || "فشل تحميل المقالات")
      } finally {
        setLoading(false)
      }
    }
    loadBlogs()
  }, [])

  const filteredByCategory = selectedCategory === "جميع المقالات"
    ? articles
    : articles.filter((article) => article.tags.includes(selectedCategory) || article.category === selectedCategory)

  const filteredBySearch = filteredByCategory.filter((article) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredArticles = filteredBySearch

  return (
    <div className="min-h-screen">
      {/* Modern Hero Section */}
      <div className="relative bg-gradient-to-br from-violet-50 via-blue-50 to-purple-50 py-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-700/10 to-purple-900/10 border border-purple-200/20 px-4 py-2 rounded-full text-sm font-medium mb-6 arabic-text backdrop-blur-sm">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-700 to-purple-900 rounded-full animate-pulse"></div>
              مقالات مفيدة ونصائح عملية
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-700 to-purple-700 bg-clip-text text-transparent mb-4 arabic-text leading-tight">
              مدونة بصمة تصميم
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 arabic-text leading-relaxed">
              استكشف أحدث الاتجاهات في التصميم والتسويق الرقمي
            </p>

            {/* Search Bar */}
            <div className="max-w-lg mx-auto relative mb-8">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="البحث في المقالات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 arabic-text bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">

        {/* Modern Categories */}
        <div className="text-center mb-12">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap arabic-text transition-all duration-200 rounded-full ${
                  selectedCategory === category 
                    ? "bg-gradient-to-r from-purple-700 to-purple-900 text-white shadow-sm hover:shadow-md" 
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-lg text-gray-600 arabic-text">جاري تحميل المقالات...</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2 arabic-text">لا توجد مقالات</h3>
            <p className="text-gray-500 arabic-text">جرب البحث بكلمات أخرى أو تصفح جميع الفئات</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-red-600 mb-2 arabic-text">حدث خطأ في التحميل</h3>
            <p className="text-gray-500 arabic-text mb-6">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="arabic-text">
              إعادة المحاولة
            </Button>
          </div>
        )}

        {/* Modern Articles Grid */}
        {!loading && !error && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, index) => (
              <Card 
                key={article.id} 
                className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white rounded-2xl"
              >
                {/* Article Image */}
                <div className="aspect-[4/3] overflow-hidden relative bg-gray-50">
                  <img 
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-gray-700 border-0 text-xs arabic-text backdrop-blur-sm">
                      {article.category}
                    </Badge>
                  </div>

                  {/* Featured Badge for first article */}
                  {index === 0 && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-gradient-to-r from-purple-700 to-purple-900 text-white border-0 text-xs arabic-text">
                        مميز ⭐
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Article Content */}
                <CardContent className="p-6">
                  {/* Article Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight arabic-text group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                    {article.title}
                  </h3>
                  
                  {/* Article Excerpt */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 arabic-text line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  {/* Article Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span className="arabic-text">{article.publishDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span className="arabic-text">{article.readTime}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {article.tags.slice(0, 2).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 arabic-text">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Read More Button */}
                  <Button 
                    asChild 
                    className="w-full bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 border-0 rounded-xl transition-all duration-300 hover:shadow-md arabic-text [&>*]:!text-black [&>*>*]:!text-black"
                  >
                    <Link href={`/blog/${article.slug}`} className="flex items-center justify-center gap-2" style={{color: '#000 !important'}}>
                      <span style={{color: '#000 !important'}}>قراءة المقال</span>
                      <ArrowLeft className="h-4 w-4 rtl-flip group-hover:translate-x-1 transition-transform duration-300" style={{color: '#000 !important'}} />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default BlogContent
