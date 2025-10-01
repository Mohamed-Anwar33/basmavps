"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { User } from "lucide-react"
import { apiFetch } from "@/lib/api"

type TeamMember = {
  _id: string
  name: { ar: string; en: string }
  role: { ar: string; en: string }
  description?: { ar: string; en: string }
  image?: string
  order: number
  isActive: boolean
}

export function TeamSection() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const res = await apiFetch<TeamMember[]>("/team?isActive=true", { method: "GET" })
        setTeamMembers(Array.isArray(res) ? res : [])
      } catch (error) {
        setTeamMembers([])
      } finally {
        setLoading(false)
      }
    }
    loadTeam()
  }, [])

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground arabic-text">من وراء بصمة تصميم</h2>
            <p className="text-lg text-muted-foreground arabic-text max-w-3xl mx-auto">
              فريق من المبدعين والمتخصصين يعملون بشغف لتحقيق رؤيتك وتحويلها إلى واقع ملموس
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground arabic-text">جاري تحميل الفريق...</p>
            </div>
          ) : teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={member._id || index} className="text-center hover:shadow-lg transition-all duration-300 border-border/50">
                  <CardContent className="p-8 space-y-4">
                    {member.image ? (
                      <img 
                        src={member.image} 
                        alt={member.name.ar || member.name.en}
                        className="w-20 h-20 rounded-full mx-auto object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <User className="h-10 w-10 text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-foreground arabic-text">
                        {member.name.ar || member.name.en}
                      </h3>
                      <p className="text-primary font-medium arabic-text">
                        {member.role.ar || member.role.en}
                      </p>
                    </div>
                    {member.description && (
                      <p className="text-muted-foreground arabic-text leading-relaxed">
                        {member.description.ar || member.description.en}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground arabic-text">لا توجد بيانات فريق متاحة حالياً</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
