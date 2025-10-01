'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Save, Eye, Briefcase, Users, Timer, Star, Award, Clock, Heart, Zap, Target, CheckCircle } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

// Icon mapping for dynamic icons
const iconOptions = [
  { name: 'Briefcase', icon: Briefcase, label: 'حقيبة' },
  { name: 'Users', icon: Users, label: 'مستخدمون' },
  { name: 'Timer', icon: Timer, label: 'مؤقت' },
  { name: 'Star', icon: Star, label: 'نجمة' },
  { name: 'Award', icon: Award, label: 'جائزة' },
  { name: 'Clock', icon: Clock, label: 'ساعة' },
  { name: 'Heart', icon: Heart, label: 'قلب' },
  { name: 'Zap', icon: Zap, label: 'برق' },
  { name: 'Target', icon: Target, label: 'هدف' },
  { name: 'CheckCircle', icon: CheckCircle, label: 'تحقق' }
]

const colorOptions = [
  { value: 'text-emerald-600', label: 'أخضر', bg: 'from-emerald-100 to-teal-100' },
  { value: 'text-blue-600', label: 'أزرق', bg: 'from-blue-100 to-indigo-100' },
  { value: 'text-amber-600', label: 'أصفر', bg: 'from-amber-100 to-yellow-100' },
  { value: 'text-rose-600', label: 'وردي', bg: 'from-rose-100 to-pink-100' },
  { value: 'text-purple-600', label: 'بنفسجي', bg: 'from-purple-100 to-pink-100' },
  { value: 'text-indigo-600', label: 'نيلي', bg: 'from-indigo-100 to-blue-100' },
  { value: 'text-teal-600', label: 'تيل', bg: 'from-teal-100 to-cyan-100' },
  { value: 'text-orange-600', label: 'برتقالي', bg: 'from-orange-100 to-red-100' }
]

interface CounterItem {
  label: string
  value: number
  suffix: string
  iconName: string
  iconColor: string
  chipBg: string
}

interface CountersData {
  title: string
  subtitle: string
  items: CounterItem[]
}

export default function CountersManagement() {
  const [countersData, setCountersData] = useState<CountersData>({
    title: 'أرقامنا',
    subtitle: 'أرقامنا تتحدث عن التزامنا، إبداعنا، وشراكتنا مع كل عميل',
    items: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load existing data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await apiFetch('/admin/content/homepage-sections/counters', { auth: true }) as any
        if (response.counters) {
          setCountersData(response.counters)
        }
      } catch (error) {
        toast.error('خطأ في تحميل البيانات')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const addCounter = () => {
    setCountersData(prev => ({
      ...prev,
      items: [...prev.items, {
        label: '',
        value: 0,
        suffix: '+',
        iconName: 'Briefcase',
        iconColor: 'text-emerald-600',
        chipBg: 'from-emerald-100 to-teal-100'
      }]
    }))
  }

  const removeCounter = (index: number) => {
    setCountersData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateCounter = (index: number, field: keyof CounterItem, value: any) => {
    setCountersData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const updateColorAndBg = (index: number, colorValue: string) => {
    const colorOption = colorOptions.find(opt => opt.value === colorValue)
    if (colorOption) {
      setCountersData(prev => ({
        ...prev,
        items: prev.items.map((item, i) => 
          i === index ? { 
            ...item, 
            iconColor: colorOption.value,
            chipBg: colorOption.bg
          } : item
        )
      }))
    }
  }

  const saveData = async () => {
    setSaving(true)
    try {
      await apiFetch('/admin/content/homepage-sections/counters', {
        method: 'PUT',
        body: JSON.stringify(countersData),
        auth: true
      })
      toast.success('تم حفظ البيانات بنجاح')
    } catch (error) {
      toast.error('خطأ في حفظ البيانات')
    } finally {
      setSaving(false)
    }
  }

  const previewData = () => {
    window.open('/', '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">إدارة قسم الأرقام</h1>
          <p className="text-muted-foreground">إدارة الإحصائيات والأرقام المعروضة في الموقع</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={previewData} variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            معاينة
          </Button>
          <Button onClick={saveData} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </div>

      {/* Main Settings */}
      <Card>
        <CardHeader>
          <CardTitle>الإعدادات الأساسية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">العنوان الرئيسي</Label>
            <Input
              id="title"
              value={countersData.title}
              onChange={(e) => setCountersData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="أرقامنا"
            />
          </div>
          <div>
            <Label htmlFor="subtitle">العنوان الفرعي</Label>
            <Textarea
              id="subtitle"
              value={countersData.subtitle}
              onChange={(e) => setCountersData(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="أرقامنا تتحدث عن التزامنا، إبداعنا، وشراكتنا مع كل عميل"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Counters Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>عناصر الأرقام</CardTitle>
            <Button onClick={addCounter} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة عنصر جديد
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {countersData.items.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">العنصر {index + 1}</h3>
                <Button
                  onClick={() => removeCounter(index)}
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>النص</Label>
                  <Input
                    value={item.label}
                    onChange={(e) => updateCounter(index, 'label', e.target.value)}
                    placeholder="مشاريع مكتملة"
                  />
                </div>

                <div>
                  <Label>القيمة</Label>
                  <Input
                    type="number"
                    value={item.value}
                    onChange={(e) => updateCounter(index, 'value', parseFloat(e.target.value) || 0)}
                    placeholder="468"
                  />
                </div>

                <div>
                  <Label>اللاحقة</Label>
                  <Input
                    value={item.suffix}
                    onChange={(e) => updateCounter(index, 'suffix', e.target.value)}
                    placeholder="+"
                  />
                </div>

                <div>
                  <Label>الأيقونة</Label>
                  <Select
                    value={item.iconName}
                    onValueChange={(value) => updateCounter(index, 'iconName', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.name} value={option.name}>
                          <div className="flex items-center gap-2">
                            <option.icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-center">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.chipBg} flex items-center justify-center shadow-sm`}>
                    {(() => {
                      const IconComponent = iconOptions.find(opt => opt.name === item.iconName)?.icon || Briefcase
                      return <IconComponent className={`h-6 w-6 ${item.iconColor}`} />
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {countersData.items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد عناصر أرقام. اضغط على "إضافة عنصر جديد" لإضافة العنصر الأول.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
