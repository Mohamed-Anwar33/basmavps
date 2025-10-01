'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, Button, Input, Form, Space, Divider, notification, Typography } from 'antd'
import { PlusOutlined, SaveOutlined, ReloadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import { fetchPageContentByType, updatePageContent } from '@/lib/api'
import { useAdminAuth } from '@/contexts/admin-auth-context'

const { Title, Text } = Typography

function arrayMove<T>(arr: T[], from: number, to: number) {
  const copy = [...arr]
  const item = copy.splice(from, 1)[0]
  copy.splice(to, 0, item)
  return copy
}

export default function HowToOrderAdminPage() {
  const { admin, token } = useAdminAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  // Local page state mirrors backend content shape: { sections: [], metadata: {} }
  const [page, setPage] = useState<any | null>(null)
  const [form] = Form.useForm()

  const sections = useMemo(() => page?.sections || [], [page])
  const hero = sections.find((s: any) => s.id === 'hero')?.data || { title: { ar: '' }, description: { ar: '' }, badge: { ar: '' } }
  const steps = sections.find((s: any) => s.id === 'steps')?.data || { heading: { ar: '' }, items: [], processHighlights: [] }
  const notes = sections.find((s: any) => s.id === 'notes')?.data || { heading: { ar: '' }, items: [] }
  const cta = sections.find((s: any) => s.id === 'cta')?.data || { title: { ar: '' }, description: { ar: '' }, button: { text: { ar: '' }, link: '' } }
  const metadata = page?.metadata || { title: { ar: '' }, description: { ar: '' }, keywords: [], ogImage: '' }

  useEffect(() => {
    if (!admin) {
      if (typeof window !== 'undefined') window.location.href = '/admin/login?message=redirect'
      return
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, token])

  // Convert flat key-value pairs from backend to structured content
  function parseBackendContent(flatData: any) {
    if (!flatData || typeof flatData !== 'object') return null;
    
    try {
      return {
        sections: [
          {
            id: 'hero',
            type: 'custom',
            data: {
              badge: { ar: flatData['hero.badge.ar'] || '' },
              title: { ar: flatData['hero.title.ar'] || '' },
              description: { ar: flatData['hero.description.ar'] || '' }
            },
            order: 0,
            isActive: true
          },
          {
            id: 'steps',
            type: 'custom',
            data: {
              heading: { ar: flatData['steps.heading.ar'] || '' },
              items: flatData['steps.items'] ? JSON.parse(flatData['steps.items']) : [],
              processHighlights: flatData['steps.processHighlights'] ? JSON.parse(flatData['steps.processHighlights']) : []
            },
            order: 1,
            isActive: true
          },
          {
            id: 'notes',
            type: 'custom',
            data: {
              heading: { ar: flatData['notes.heading.ar'] || '' },
              items: flatData['notes.items'] ? JSON.parse(flatData['notes.items']) : []
            },
            order: 2,
            isActive: true
          },
          {
            id: 'cta',
            type: 'custom',
            data: {
              title: { ar: flatData['cta.title.ar'] || '' },
              description: { ar: flatData['cta.description.ar'] || '' },
              button: {
                text: { ar: flatData['cta.button.text.ar'] || '' },
                link: flatData['cta.button.link'] || ''
              }
            },
            order: 3,
            isActive: true
          }
        ],
        metadata: {
          title: { ar: flatData['metadata.title.ar'] || '' },
          description: { ar: flatData['metadata.description.ar'] || '' },
          keywords: flatData['metadata.keywords'] ? JSON.parse(flatData['metadata.keywords']) : []
        }
      };
    } catch (e) {
      console.error('Error parsing backend content:', e);
      return null;
    }
  }

  async function load() {
    setLoading(true)
    try {
      // Fetch content from backend
      let rawContent = await fetchPageContentByType('howToOrder')
      console.log('🔍 Raw content from backend:', rawContent);
      console.log('🔍 Raw content type:', typeof rawContent);
      console.log('🔍 Raw content keys:', rawContent ? Object.keys(rawContent) : 'null');
      
      let content = null;
      
      // Check if it's already structured data (has sections and metadata)
      if (rawContent && rawContent.sections && Array.isArray(rawContent.sections)) {
        console.log('✅ Received structured data, using directly');
        console.log('📋 Structured sections:', rawContent.sections.map((s: any) => ({ id: s.id, hasData: !!s.data })));
        console.log('📋 Hero data sample:', rawContent.sections.find((s: any) => s.id === 'hero')?.data);
        content = rawContent;
      } else {
        // It's flat data, try to parse it
        console.log('🔄 Received flat data, parsing...');
        if (rawContent) {
          console.log('🔍 Raw content sample:', {
            'hero.title.ar': rawContent['hero.title.ar'],
            'hero.description.ar': rawContent['hero.description.ar'],
            'steps.heading.ar': rawContent['steps.heading.ar'],
            'cta.title.ar': rawContent['cta.title.ar']
          });
        }
        content = parseBackendContent(rawContent);
      }
      
      console.log('🔄 Final content:', content);
      console.log('🔄 Final content sections:', content?.sections?.length || 0);

      // If content missing or parsing failed, initialize with default template
      if (!content || !Array.isArray(content.sections)) {
        content = {
          sections: [
            { id: 'hero', type: 'custom', data: { badge: { ar: '' }, title: { ar: '' }, description: { ar: '' } }, order: 0, isActive: true },
            { id: 'steps', type: 'custom', data: { heading: { ar: '' }, items: [], processHighlights: [] }, order: 1, isActive: true },
            { id: 'notes', type: 'custom', data: { heading: { ar: '' }, items: [] }, order: 2, isActive: true },
            { id: 'cta', type: 'custom', data: { title: { ar: '' }, description: { ar: '' }, button: { text: { ar: '' }, link: '' } }, order: 3, isActive: true },
          ],
          metadata: { title: { ar: '' }, description: { ar: '' }, keywords: [] },
        }
      } else {
        // If the legacy default structure exists (id 'how-to-order' only), map it into our sections
        const hasHero = content.sections.some((s: any) => s.id === 'hero')
        const legacy = content.sections.find((s: any) => s.id === 'how-to-order')
        if (!hasHero && legacy) {
          const legacyData = legacy as any;
          content.sections = [
            { id: 'hero', type: 'custom', data: { badge: { ar: 'دليل الطلب الشامل' }, title: { ar: legacyData?.title || 'كيف تطلب خدمتك' }, description: { ar: legacyData?.subtitle || '' } }, order: 0, isActive: true },
            { id: 'steps', type: 'custom', data: { heading: { ar: legacyData?.subtitle || 'خطوات بسيطة للحصول على خدمتك' }, items: [], processHighlights: [] }, order: 1, isActive: true },
            { id: 'notes', type: 'custom', data: { heading: { ar: 'ملاحظات مهمة' }, items: [] }, order: 2, isActive: true },
            { id: 'cta', type: 'custom', data: { title: { ar: 'جاهز لبدء مشروعك؟' }, description: { ar: '' }, button: { text: { ar: 'تصفح الخدمات' }, link: '/services' } }, order: 3, isActive: true },
          ]
          content.metadata = content.metadata || { title: { ar: 'كيف تطلب خدمتك' }, description: { ar: legacyData?.subtitle || '' }, keywords: [] }
        }
      }

      // If still empty after mapping, seed with rich defaults (mirroring public page)
      const secsCheck = content?.sections || []
      const heroData = secsCheck.find((s: any) => s.id === 'hero')?.data as any || {}
      const needSeed = !heroData?.title?.ar && !heroData?.description?.ar
      if (needSeed && content) {
        content = {
          sections: [
            { id: 'hero', type: 'custom', data: { badge: { ar: 'دليل الطلب الشامل' }, title: { ar: 'كيف تطلب خدمتك؟' }, description: { ar: 'في "بصمة تصميم"، نجعل طلب خدمتك سهلاً وسريعاً بخطوات واضحة ومباشرة' } }, order: 0, isActive: true },
            { id: 'steps', type: 'custom', data: { heading: { ar: 'خطوات بسيطة للحصول على خدمتك' }, items: [
              { order: 1, title: { ar: 'اختر خدمتك' }, description: { ar: 'تصفح قسم الخدمات واختر الخدمة التي تحتاجها من مجموعة خدماتنا المتنوعة' } },
              { order: 2, title: { ar: 'أكمل الدفع' }, description: { ar: 'ادفع بأمان عبر PayPal أو وسائل الدفع المتاحة بخطوات سريعة ومحمية' } },
              { order: 3, title: { ar: 'ابدأ التنفيذ' }, description: { ar: 'تواصل معنا عبر واتساب لتوضيح تفاصيل طلبك ونبدأ التنفيذ فوراً' } },
            ], processHighlights: [
              { text: { ar: 'لا حاجة لنماذج معقدة' } },
              { text: { ar: 'تواصل مباشر مع الفريق' } },
              { text: { ar: 'بداية فورية للتنفيذ' } },
            ] }, order: 1, isActive: true },
            { id: 'notes', type: 'custom', data: { heading: { ar: 'ملاحظات مهمة لضمان أفضل خدمة' }, items: [
              { title: { ar: 'التحضير المسبق' }, description: { ar: 'يُرجى تجهيز وصف واضح ومفصل لطلبك قبل بدء المحادثة لضمان فهم متطلباتك بدقة' } },
              { title: { ar: 'الأسعار والتعديلات' }, description: { ar: 'الأسعار ثابتة لكل خدمة، والتعديلات محدودة حسب نوع الخدمة المطلوبة' } },
              { title: { ar: 'سياسة الإلغاء' }, description: { ar: 'جميع الخدمات غير قابلة للإلغاء أو الاسترداد بعد إتمام عملية الدفع' } },
              { title: { ar: 'التسليم الرقمي' }, description: { ar: 'خدمة "قالب السيرة الذاتية الجاهز" تُرسل مباشرة عبر البريد الإلكتروني ولا تتطلب تواصل عبر واتساب' } },
            ] }, order: 2, isActive: true },
            { id: 'cta', type: 'custom', data: { title: { ar: 'جاهز لبدء مشروعك؟' }, description: { ar: 'اختر خدمتك الآن وابدأ رحلة إبداعية مع فريق بصمة تصميم' }, button: { text: { ar: 'تصفح الخدمات' }, link: '/services' } }, order: 3, isActive: true },
          ],
          metadata: { title: { ar: 'كيف تطلب خدمتك | بصمة تصميم' }, description: { ar: 'اتبع خطوات بسيطة لطلب خدمتك...' }, keywords: ['طلب خدمة','بصمة تصميم','how to order'] }
        }
        try {
          const seeded = await updatePageContent('howToOrder', content)
          if (seeded) content = seeded
        } catch (seedErr) {
        }
      }

      setPage(content)

      // Initialize form using freshly fetched content (not state-derived to avoid async timing)
      if (content) {
        const secs = content.sections || []
        const h = secs.find((s: any) => s.id === 'hero')?.data as any || {}
        const st = secs.find((s: any) => s.id === 'steps')?.data as any || {}
        const c = secs.find((s: any) => s.id === 'cta')?.data as any || {}
        const md = content.metadata as any || {}

        form.setFieldsValue({
          hero_badge: h?.badge?.ar || '',
          hero_title: h?.title?.ar || '',
          hero_desc: h?.description?.ar || '',
          steps_heading: st?.heading?.ar || '',
          cta_title: c?.title?.ar || '',
          cta_desc: c?.description?.ar || '',
          cta_text: c?.button?.text?.ar || '',
          cta_link: c?.button?.link || '',
          seo_title: md?.title?.ar || '',
          seo_desc: md?.description?.ar || '',
          seo_keywords: Array.isArray(md?.keywords) ? md.keywords.join(', ') : '',
        })
      }
    } catch (e) {
      notification.error({ message: 'خطأ', description: 'فشل تحميل المحتوى' })
    } finally {
      setLoading(false)
    }
  }

  function setSectionData(id: string, data: any) {
    setPage((prev: any) => {
      const base = prev || { sections: [], metadata: {} }
      const clone = JSON.parse(JSON.stringify(base))
      
      // Ensure sections array exists
      if (!clone.sections) {
        clone.sections = []
      }
      
      const idx = clone.sections.findIndex((s: any) => s.id === id)
      if (idx >= 0) {
        clone.sections[idx].data = data
      } else {
        clone.sections.push({ id, type: 'custom', data, order: clone.sections.length, isActive: true })
      }
      return clone
    })
  }

  function setMetadata(meta: any) {
    setPage((prev: any) => ({ ...(prev || { sections: [] }), metadata: meta }))
  }

  async function onSave() {
    setSaving(true)
    try {
      const values = form.getFieldsValue()

      // Build new data structures
      const newHero = {
        badge: { ar: values.hero_badge || '' },
        title: { ar: values.hero_title || '' },
        description: { ar: values.hero_desc || '' },
      }
      const newSteps = {
        heading: { ar: values.steps_heading || '' },
        items: (page?.sections?.find((s: any) => s.id === 'steps')?.data?.items || []).map((it: any) => ({
          ...it,
          title: { ar: it.title?.ar || '' },
          description: { ar: it.description?.ar || '' },
        })),
        processHighlights: (page?.sections?.find((s: any) => s.id === 'steps')?.data?.processHighlights || []).map((ph: any) => ({
          ...ph,
          text: { ar: ph.text?.ar || '' },
        }))
      }
      const newNotes = {
        heading: { ar: notes?.heading?.ar || '' },
        items: (notes?.items || []).map((n: any) => ({
          ...n,
          title: { ar: n.title?.ar || '' },
          description: { ar: n.description?.ar || '' },
        }))
      }
      const newCTA = {
        title: { ar: values.cta_title || '' },
        description: { ar: values.cta_desc || '' },
        button: { text: { ar: values.cta_text || '' }, link: values.cta_link || '' }
      }
      const newMeta = {
        ...metadata,
        title: { ar: values.seo_title || '' },
        description: { ar: values.seo_desc || '' },
        keywords: (values.seo_keywords || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      }

      setSectionData('hero', newHero)
      setSectionData('steps', newSteps)
      setSectionData('notes', newNotes)
      setSectionData('cta', newCTA)
      setMetadata(newMeta)

      // Build the updated sections with new data
      const updatedSections = [
        { id: 'hero', type: 'hero', data: newHero, order: 0, isActive: true },
        { id: 'steps', type: 'steps', data: newSteps, order: 1, isActive: true },
        { id: 'notes', type: 'notes', data: newNotes, order: 2, isActive: true },
        { id: 'cta', type: 'cta', data: newCTA, order: 3, isActive: true }
      ]

      // Convert complex structure to simple key-value pairs that backend expects
      const flattenedPayload = {
        // Hero section
        'hero.badge.ar': newHero.badge.ar,
        'hero.title.ar': newHero.title.ar, 
        'hero.description.ar': newHero.description.ar,
        
        // Steps section
        'steps.heading.ar': newSteps.heading.ar,
        'steps.items': JSON.stringify(newSteps.items),
        'steps.processHighlights': JSON.stringify(newSteps.processHighlights),
        
        // Notes section
        'notes.heading.ar': newNotes.heading.ar,
        'notes.items': JSON.stringify(newNotes.items),
        
        // CTA section
        'cta.title.ar': newCTA.title.ar,
        'cta.description.ar': newCTA.description.ar,
        'cta.button.text.ar': newCTA.button.text.ar,
        'cta.button.link': newCTA.button.link,
        
        // Metadata
        'metadata.title.ar': newMeta.title.ar,
        'metadata.description.ar': newMeta.description.ar,
        'metadata.keywords': JSON.stringify(newMeta.keywords),
        
        // General
        'isActive': true,
        'status': 'published'
      }
      
      console.log('🚀 Sending flattened payload:', flattenedPayload);
      const saved = await updatePageContent('howToOrder', flattenedPayload)
      console.log('💾 Save result:', saved);
      
      if (saved) {
        console.log('✅ Save successful, updating UI...');
        notification.success({ message: 'نجح الحفظ', description: 'تم حفظ المحتوى بنجاح' })
        setPage(saved)
      } else {
        console.log('❌ Save failed - no result returned');
        notification.error({ message: 'خطأ', description: 'فشل في الحفظ' })
      }
    } catch (e) {
      console.error('💥 Save error:', e);
      notification.error({ message: 'خطأ', description: 'حدث خطأ أثناء الحفظ' })
    } finally {
      setSaving(false)
    }
  }

  // Helper renderers for arrays
  const [_, force] = useState(0)
  function updateSteps(updater: (list: any[]) => any[]) {
    const current = JSON.parse(JSON.stringify(steps.items || []))
    const next = updater(current)
    setSectionData('steps', { ...steps, items: next })
    force((n) => n + 1)
  }
  function updateProcess(updater: (list: any[]) => any[]) {
    const current = JSON.parse(JSON.stringify(steps.processHighlights || []))
    const next = updater(current)
    setSectionData('steps', { ...steps, processHighlights: next })
    force((n) => n + 1)
  }
  function updateNotes(updater: (list: any[]) => any[]) {
    const current = JSON.parse(JSON.stringify(notes.items || []))
    const next = updater(current)
    setSectionData('notes', { ...notes, items: next })
    force((n) => n + 1)
  }

  if (!admin) return null

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={3}>إدارة صفحة: كيف تطلب خدمتك</Title>
        <Text type="secondary">تحكم في أقسام الصفحة: البطل، الخطوات، الملاحظات، الدعوة للإجراء، وبيانات الـ SEO</Text>
      </div>

      <Space direction="vertical" size={16} className="w-full">
        {/* Actions */}
        <Space>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={onSave}>حفظ</Button>
          <Button icon={<ReloadOutlined />} loading={loading} onClick={load}>إعادة تحميل</Button>
          <Button icon={<EyeOutlined />} href="/how-to-order" target="_blank">معاينة الصفحة</Button>
        </Space>

        {/* Hero */}
        <Card title="Hero Section">
          <Form form={form} layout="vertical">
            <Form.Item label="شارة أعلى العنوان" name="hero_badge">
              <Input placeholder="دليل الطلب الشامل" />
            </Form.Item>
            <Form.Item label="العنوان الرئيسي" name="hero_title">
              <Input placeholder="كيف تطلب خدمتك؟" />
            </Form.Item>
            <Form.Item label="الوصف" name="hero_desc">
              <Input.TextArea rows={3} placeholder='في "بصمة تصميم"، نجعل طلب خدمتك سهلاً...' />
            </Form.Item>
          </Form>
        </Card>

        {/* Steps */}
        <Card title="Steps Section">
          <Form form={form} layout="vertical">
            <Form.Item label="عنوان الخطوات" name="steps_heading">
              <Input placeholder="خطوات بسيطة للحصول على خدمتك" />
            </Form.Item>
          </Form>

          <Divider orientation="right">قائمة الخطوات</Divider>
          <Space direction="vertical" className="w-full">
            {(steps.items || []).map((it: any, idx: number) => (
              <Card key={idx} size="small" className="w-full" title={`خطوة ${idx + 1}`} extra={
                <Space>
                  <Button size="small" onClick={() => updateSteps(list => arrayMove(list, idx, Math.max(0, idx-1)))}>↑</Button>
                  <Button size="small" onClick={() => updateSteps(list => arrayMove(list, idx, Math.min(list.length-1, idx+1)))}>↓</Button>
                  <Button danger size="small" icon={<DeleteOutlined />} onClick={() => updateSteps(list => list.filter((_, i) => i !== idx))} />
                </Space>
              }>
                <Space direction="vertical" className="w-full">
                  <Input
                    value={it?.title?.ar || ''}
                    placeholder="عنوان الخطوة"
                    onChange={(e) => updateSteps(list => { list[idx].title = { ar: e.target.value }; return list })}
                  />
                  <Input.TextArea
                    rows={2}
                    value={it?.description?.ar || ''}
                    placeholder="وصف مختصر"
                    onChange={(e) => updateSteps(list => { list[idx].description = { ar: e.target.value }; return list })}
                  />
                </Space>
              </Card>
            ))}
            <Button icon={<PlusOutlined />} onClick={() => updateSteps(list => [...list, { title: { ar: '' }, description: { ar: '' }, order: (list?.length||0)+1 }])}>إضافة خطوة</Button>
          </Space>

          <Divider orientation="right">نقاط عملية الطلب</Divider>
          <Space direction="vertical" className="w-full">
            {(steps.processHighlights || []).map((ph: any, idx: number) => (
              <Card key={idx} size="small" className="w-full" title={`نقطة ${idx + 1}`} extra={
                <Space>
                  <Button size="small" onClick={() => updateProcess(list => arrayMove(list, idx, Math.max(0, idx-1)))}>↑</Button>
                  <Button size="small" onClick={() => updateProcess(list => arrayMove(list, idx, Math.min(list.length-1, idx+1)))}>↓</Button>
                  <Button danger size="small" icon={<DeleteOutlined />} onClick={() => updateProcess(list => list.filter((_, i) => i !== idx))} />
                </Space>
              }>
                <Input
                  value={ph?.text?.ar || ''}
                  placeholder="نص النقطة"
                  onChange={(e) => updateProcess(list => { list[idx].text = { ar: e.target.value }; return list })}
                />
              </Card>
            ))}
            <Button icon={<PlusOutlined />} onClick={() => updateProcess(list => [...list, { text: { ar: '' } }])}>إضافة نقطة</Button>
          </Space>
        </Card>

        {/* Notes */}
        <Card title="Notes Section">
          <Space direction="vertical" className="w-full">
            <Input
              value={notes?.heading?.ar || ''}
              placeholder="عنوان الملاحظات"
              onChange={(e) => setSectionData('notes', { ...notes, heading: { ar: e.target.value } })}
            />
            {(notes.items || []).map((n: any, idx: number) => (
              <Card key={idx} size="small" className="w-full" title={`ملاحظة ${idx + 1}`} extra={
                <Space>
                  <Button size="small" onClick={() => updateNotes(list => arrayMove(list, idx, Math.max(0, idx-1)))}>↑</Button>
                  <Button size="small" onClick={() => updateNotes(list => arrayMove(list, idx, Math.min(list.length-1, idx+1)))}>↓</Button>
                  <Button danger size="small" icon={<DeleteOutlined />} onClick={() => updateNotes(list => list.filter((_, i) => i !== idx))} />
                </Space>
              }>
                <Space direction="vertical" className="w-full">
                  <Input
                    value={n?.title?.ar || ''}
                    placeholder="عنوان"
                    onChange={(e) => updateNotes(list => { list[idx].title = { ar: e.target.value }; return list })}
                  />
                  <Input.TextArea
                    rows={2}
                    value={n?.description?.ar || ''}
                    placeholder="الوصف"
                    onChange={(e) => updateNotes(list => { list[idx].description = { ar: e.target.value }; return list })}
                  />
                </Space>
              </Card>
            ))}
            <Button icon={<PlusOutlined />} onClick={() => updateNotes(list => [...list, { title: { ar: '' }, description: { ar: '' } }])}>إضافة ملاحظة</Button>
          </Space>
        </Card>

        {/* CTA */}
        <Card title="Call To Action">
          <Form form={form} layout="vertical">
            <Form.Item label="العنوان" name="cta_title"><Input placeholder="جاهز لبدء مشروعك؟" /></Form.Item>
            <Form.Item label="الوصف" name="cta_desc"><Input.TextArea rows={3} placeholder="اختر خدمتك الآن..." /></Form.Item>
            <Form.Item label="نص الزر" name="cta_text"><Input placeholder="تصفح الخدمات" /></Form.Item>
          </Form>
        </Card>

        {/* SEO - Hidden but preserved */}
        <div style={{ display: 'none' }}>
          <Card title="Meta SEO">
            <Form form={form} layout="vertical">
              <Form.Item label="Title" name="seo_title"><Input placeholder="كيف تطلب خدمتك | بصمة تصميم" /></Form.Item>
              <Form.Item label="Description" name="seo_desc"><Input.TextArea rows={3} placeholder="اتبع خطوات بسيطة لطلب خدمتك..." /></Form.Item>
              <Form.Item label="Keywords (comma separated)" name="seo_keywords"><Input placeholder="طلب خدمة, بصمة تصميم, how to order" /></Form.Item>
            </Form>
          </Card>
        </div>
      </Space>
    </div>
  )
}
