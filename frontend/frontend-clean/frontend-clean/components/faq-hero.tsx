export function FAQHero() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground arabic-text text-balance">
            الأسئلة <span className="text-primary">الشائعة</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground arabic-text max-w-3xl mx-auto leading-relaxed">
            إجابات شاملة على أكثر الأسئلة شيوعاً حول خدماتنا وسياساتنا
          </p>
        </div>
      </div>
    </section>
  )
}
