"use client"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Mail, ArrowLeft } from "lucide-react"
import { RiInstagramFill, RiLinkedinFill, RiTwitterXFill, RiFacebookFill, RiTiktokFill, RiYoutubeFill, RiBehanceFill, RiDribbbleFill, RiSnapchatFill, RiWhatsappFill } from "react-icons/ri"
import { apiFetch } from "@/lib/api"

export function Footer() {
  const [cfg, setCfg] = useState<Record<string, any> | null>(null)
  const [whatsAppFromContact, setWhatsAppFromContact] = useState<string>('')
  
  useEffect(() => {
    const load = async () => {
      try {
        // Load footer settings from /settings and contact settings for email
        const [resFooter, resSocial, resContact] = await Promise.all([
          apiFetch<{ success: boolean; data: Array<{ key: string; value: any; category?: string; lang?: string }> }>('/settings?category=footer', { method: 'GET' }),
          apiFetch<{ success: boolean; data: Array<{ key: string; value: any; category?: string; lang?: string }> }>('/settings?category=social', { method: 'GET' }),
          apiFetch<{ success: boolean; data: Array<{ key: string; value: any; category?: string; lang?: string }> }>('/settings?category=contact', { method: 'GET' }),
        ])

        const dataFooter = (resFooter as any)?.success && Array.isArray((resFooter as any).data) ? (resFooter as any).data : []
        const dataSocial = (resSocial as any)?.success && Array.isArray((resSocial as any).data) ? (resSocial as any).data : []
        const dataContact = (resContact as any)?.success && Array.isArray((resContact as any).data) ? (resContact as any).data : []
        const all = [...dataFooter, ...dataSocial, ...dataContact]

        if (all.length) {
          const map: Record<string, any> = {}
          all.forEach((s: any) => { map[s.key] = s.value })
          setCfg(map)
        } else {
          setCfg(null)
        }
        
        // Also load WhatsApp, email and social links from contact-page API (same as contact page)
        const contactRes = await apiFetch('/contact-page', { method: 'GET' }) as any
        if (contactRes?.success && contactRes.data) {
          const d = contactRes.data
          let whatsappLink = ''
          let contactEmail = ''
          
          if (d.whatsappLink) {
            whatsappLink = (d.whatsappLink ?? '').toString().trim()
          } else if (d.contactInfo?.whatsappLink) {
            whatsappLink = (d.contactInfo?.whatsappLink ?? '').toString().trim()
          }
          
          // Extract email from contact page (same logic as contact-content.tsx)
          if (d.email) {
            contactEmail = (d.email ?? '').toString().trim()
          } else if (d.contactInfo?.email) {
            contactEmail = (d.contactInfo?.email ?? '').toString().trim()
          }
          
          setWhatsAppFromContact(whatsappLink)
          
          // Also extract social links from contact page
          const socialLinkedIn = d.socialLinkedin || d.socialMediaSection?.platforms?.linkedin || ''
          const socialInstagram = d.socialInstagram || d.socialMediaSection?.platforms?.instagram || ''
          const socialTwitter = d.socialTwitter || d.socialMediaSection?.platforms?.twitter || ''
          const socialTiktok = d.socialTiktok || d.socialMediaSection?.platforms?.tiktok || ''
          
          // Update cfg with email and social links from contact page
          setCfg(prev => ({
            ...prev,
            email: contactEmail || prev?.email, // Use contact page email if available
            linkedin: socialLinkedIn,
            instagram: socialInstagram,
            twitter: socialTwitter,
            tiktok: socialTiktok
          }))
          // Email and social links loaded from contact page
        }
      } catch (error) {
        setCfg(null)
      }
    }
    load()
  }, [])

  // Helpers to normalize possibly nested setting values
  const normalizeText = (v: any): string => {
    if (!v) return ''
    if (typeof v === 'string') return v.trim()
    if (typeof v === 'object') {
      const possible = (v.ar ?? v.en ?? v.value ?? '').toString()
      return typeof possible === 'string' ? possible.trim() : ''
    }
    return ''
  }
  const normalizeLink = (v: any): string => {
    if (!v) return ''
    if (typeof v === 'string') return v.trim()
    if (typeof v === 'object') {
      const lvl1 = v.url ?? v.href ?? v.link ?? v.value ?? v.ar ?? v.en
      if (typeof lvl1 === 'string') return lvl1.trim()
      if (typeof lvl1 === 'object') {
        const lvl2 = lvl1.url ?? lvl1.href ?? lvl1.link ?? ''
        return typeof lvl2 === 'string' ? lvl2.trim() : ''
      }
    }
    return ''
  }

  const brandText = normalizeText(cfg?.brandText) || 'نصمم، نكتب، ونبني لك هوية تترك أثرًا'
  const email = normalizeText(cfg?.email) || 'contact@basmadesign.com'
  const instagram = normalizeLink(
    cfg?.instagram ?? (cfg as any)?.instagramUrl ?? (cfg as any)?.instagramURL ?? (cfg as any)?.instagram_link
  )
  const linkedin = normalizeLink(
    cfg?.linkedin ?? (cfg as any)?.linkedinUrl ?? (cfg as any)?.linkedinURL ?? (cfg as any)?.linkedin_link
  )
  const facebook = normalizeLink(
    (cfg as any)?.facebook ?? (cfg as any)?.facebookUrl ?? (cfg as any)?.facebookURL ?? (cfg as any)?.facebook_link
  )
  const x = normalizeLink(
    (cfg as any)?.x ?? (cfg as any)?.twitter ?? (cfg as any)?.twitterUrl ?? (cfg as any)?.twitterURL ?? (cfg as any)?.twitter_link
  )
  const tiktok = normalizeLink(
    (cfg as any)?.tiktok ?? (cfg as any)?.tiktokUrl ?? (cfg as any)?.tiktokURL ?? (cfg as any)?.tiktok_link
  )
  const youtube = normalizeLink(
    (cfg as any)?.youtube ?? (cfg as any)?.youtubeUrl ?? (cfg as any)?.youtubeURL ?? (cfg as any)?.youtube_link
  )
  const behance = normalizeLink(
    (cfg as any)?.behance ?? (cfg as any)?.behanceUrl ?? (cfg as any)?.behanceURL ?? (cfg as any)?.behance_link
  )
  const dribbble = normalizeLink(
    (cfg as any)?.dribbble ?? (cfg as any)?.dribbbleUrl ?? (cfg as any)?.dribbbleURL ?? (cfg as any)?.dribbble_link
  )
  const snapchat = normalizeLink(
    (cfg as any)?.snapchat ?? (cfg as any)?.snapchatUrl ?? (cfg as any)?.snapchatURL ?? (cfg as any)?.snapchat_link
  )
  const whatsapp = normalizeLink(
    (cfg as any)?.whatsapp ?? (cfg as any)?.whatsApp ?? (cfg as any)?.whatsappUrl ?? (cfg as any)?.whatsAppUrl ?? (cfg as any)?.whatsappURL ?? (cfg as any)?.whatsapp_link
  )

  const isValidLink = (url: string) => {
    if (!url) return false
    const u = String(url).trim()
    if (!u || u === '#') return false
    const lower = u.toLowerCase()
    // hide obvious placeholders
    if (lower.includes('your-number') || lower.includes('yournumber')) return false
    return true
  }

  const isValidWhatsAppLink = (url: string) => {
    if (!isValidLink(url)) return false
    const u = String(url).trim()
    if (!/wa\.me|whatsapp\.com/i.test(u)) return false
    // must contain at least 8 digits (phone number)
    const digits = u.replace(/\D/g, '')
    return digits.length >= 8
  }

  const ensureHttps = (url: string) => {
    if (!url) return ''
    const u = String(url).trim()
    if (/^https?:\/\//i.test(u)) return u
    return `https://${u}`
  }
  // Use WhatsApp from contact-page API (same source as contact page)
  const isValidWhats = (url: string) => {
    if (!url) return false
    const u = String(url).trim()
    if (!u || u === '#') return false
    if (u.toLowerCase().includes('your-number')) return false
    return true
  }
  
  const finalWhatsAppLink = isValidWhats(whatsAppFromContact) ? whatsAppFromContact : ''
  const mainContactHref = finalWhatsAppLink || '/contact'
  const mainContactIsWhatsApp = Boolean(finalWhatsAppLink)
  
  // WhatsApp configuration loaded
  
  const contactBtnClass = mainContactIsWhatsApp
    ? "group relative inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-emerald-500/80 to-green-500/80 hover:from-emerald-400 hover:to-green-400 transition-all duration-300 hover:scale-110"
    : "group relative inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-white/40 to-white/20 hover:from-white/70 hover:to-white/30 transition-all duration-300 hover:scale-110"
  const defaultQuickLinks = [
    { label: 'من نحن', href: '/about' },
    { label: 'خدماتنا', href: '/services' },
    { label: 'كيف تطلب خدمتك', href: '/how-to-order' },
    { label: 'تواصل معنا', href: '/contact' },
    { label: 'الأسئلة الشائعة', href: '/faq' },
    { label: 'السياسات والشروط', href: '/policies' },
  ]
  const quickLinks: Array<any> = Array.isArray(cfg?.quickLinks) ? (cfg!.quickLinks as any[]) : defaultQuickLinks
  // Normalize incoming links shape and ensure legacy mapping + presence of How-To page
  let normalizedQuickLinks: Array<{label: string; href: string}> = quickLinks
    .map((l: any) => {
      const label = (l?.label ?? l?.text ?? l?.title ?? l?.name ?? '').toString()
      const hrefRaw = (l?.href ?? l?.url ?? l?.link ?? '').toString()
      const href = hrefRaw.replace(/\/$/, '')
      const isLegacyOrder = href === '/order' || href === '/order/request' || /طلب\s*خدمة/i.test(label)
      if (isLegacyOrder) {
        return { label: 'كيف تطلب خدمتك', href: '/how-to-order' }
      }
      if (!label || !href) return null
      return { label, href }
    })
    .filter(Boolean) as Array<{label: string; href: string}>

  // Ensure the How-To link exists at least once
  const hasHowTo = normalizedQuickLinks.some(l => l.href === '/how-to-order')
  if (!hasHowTo) {
    normalizedQuickLinks.splice(2, 0, { label: 'كيف تطلب خدمتك', href: '/how-to-order' })
  }
  const servicesLinks: Array<{label: string; href: string}> = Array.isArray(cfg?.servicesLinks) ? cfg!.servicesLinks : [
    { label: 'تصاميم السوشيال ميديا', href: '/services/social-media' },
    { label: 'تصاميم البنرات', href: '/services/banners' },
    { label: 'كتابة المحتوى', href: '/services/content-writing' },
    { label: 'السير الذاتية', href: '/services/resumes' },
    { label: 'الشعارات', href: '/services/logos' },
  ]
  const paypalBadgeText = cfg?.paypalBadgeText || 'PayPal'
  const contactCtaText = cfg?.contactCtaText || 'اطلب خدمتك الآن'
  const contactCtaLink = cfg?.contactCtaLink || '/services'
  const copyright = cfg?.copyright || '© بصمة تصميم 2025 - جميع الحقوق محفوظة'
  const refundNote = cfg?.refundNote || 'جميع المدفوعات غير قابلة للاسترداد'

  return (
    <div className="relative">
      <style jsx global>{`
        .footer-link,
        .footer-link *,
        .footer-link span,
        .footer-link:hover,
        .footer-link:hover *,
        .footer-link:hover span,
        .footer-link:visited,
        .footer-link:visited *,
        .footer-link:visited span,
        .footer-link:active,
        .footer-link:active *,
        .footer-link:active span,
        .footer-link:focus,
        .footer-link:focus *,
        .footer-link:focus span {
          color: #000 !important;
          text-decoration: none !important;
        }
        
        /* Force black color on all footer links */
        footer a,
        footer a *,
        footer a span,
        footer a:hover,
        footer a:hover *,
        footer a:hover span,
        footer a:visited,
        footer a:visited *,
        footer a:visited span,
        footer a:active,
        footer a:active *,
        footer a:active span,
        footer a:focus,
        footer a:focus *,
        footer a:focus span,
        footer .footer-link,
        footer .footer-link *,
        footer .footer-link span {
          color: #000 !important;
          text-decoration: none !important;
        }
        
        /* Extra force for black text */
        .force-black-text,
        .force-black-text *,
        .force-black-text span,
        .force-black-text:hover,
        .force-black-text:hover *,
        .force-black-text:hover span,
        .force-black-text:visited,
        .force-black-text:visited *,
        .force-black-text:visited span,
        .force-black-text:active,
        .force-black-text:active *,
        .force-black-text:active span {
          color: #000 !important;
          fill: #000 !important;
          stroke: #000 !important;
          text-decoration: none !important;
        }
      `}</style>
      {/* Footer Image - Responsive floating between sections */}
      <div className="absolute -top-40 sm:top-8 md:-top-40 lg:-top-80 xl:-top-96 left-1/2 transform -translate-x-1/2 z-5 pointer-events-none">
        <Image 
          src="/صورة الفوتر.png" 
          alt="صورة الفوتر" 
          width={600} 
          height={600} 
          className="object-contain drop-shadow-2xl w-80 h-80 sm:w-96 sm:h-96 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[500px] xl:h-[500px] 2xl:w-[600px] 2xl:h-[600px] opacity-90"
          priority
          unoptimized
        />
      </div>
      
      <footer className="relative overflow-visible mt-24 sm:mt-8 md:mt-24 lg:mt-32 xl:mt-40 2xl:mt-48" style={{ backgroundColor: '#4B2E83' }}>
        {/* Curved wave top section */}
        <div className="absolute top-0 left-0 w-full h-12 sm:h-16 md:h-20">
          <svg 
            className="absolute top-0 left-0 w-full h-12 sm:h-16 md:h-20" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M0,0 C300,120 900,120 1200,0 L1200,120 L0,120 Z" 
              fill="#4B2E83"
            />
          </svg>
        </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-24 h-24 bg-gradient-to-r from-white/10 to-white/5 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-r from-white/5 to-white/10 rounded-full blur-lg animate-pulse delay-1000" />
        
      </div>


      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 relative z-20 mt-8 sm:mt-12 md:mt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 auto-rows-max items-start">
          {/* Brand Section */}
          <div className="space-y-4 sm:space-y-6 text-center sm:text-right sm:col-span-2 lg:col-span-1 relative z-20">
            <div className="flex items-center justify-center sm:justify-start">
              <Image 
                src="/LOGO.png"
                alt="بصمة تصميم"
                width={120}
                height={120}
                className="object-contain w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32"
                style={{ 
                  filter: 'invert(1) grayscale(1) contrast(1000%) brightness(1000%)'
                }}
              />
            </div>
            <p className="text-white/80 arabic-text leading-relaxed text-sm sm:text-base">{brandText}</p>
            <div className="flex gap-2 sm:gap-3 justify-center sm:justify-start relative z-20">
              {/* Main Contact Button - WhatsApp if available, otherwise contact page */}
              <a 
                href={mainContactHref} 
                className={contactBtnClass} 
                aria-label={mainContactIsWhatsApp ? "WhatsApp" : "تواصل معنا"}
                target={mainContactIsWhatsApp ? "_blank" : "_self"}
                rel={mainContactIsWhatsApp ? "noopener noreferrer" : undefined}
              >
                <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                  {mainContactIsWhatsApp ? (
                    <RiWhatsappFill className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </span>
              </a>
              {email && (
                <a href={`mailto:${email}`} className="group relative inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-white/40 to-white/20 hover:from-white/70 hover:to-white/30 transition-all duration-300 hover:scale-110" aria-label="البريد الإلكتروني">
                  <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                </a>
              )}
              {isValidLink(instagram) && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-pink-400/70 to-fuchsia-400/70 hover:from-pink-300 hover:to-fuchsia-300 transition-all duration-300 hover:scale-110" aria-label="Instagram">
                  <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm">
                    <RiInstagramFill className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                </a>
              )}
              {isValidLink(linkedin) && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-sky-400/70 to-blue-500/70 hover:from-sky-300 hover:to-blue-400 transition-all duration-300 hover:scale-110" aria-label="LinkedIn">
                  <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm">
                    <RiLinkedinFill className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                </a>
              )}
              {isValidLink(facebook) && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-blue-500/70 to-blue-600/70 hover:from-blue-400 hover:to-blue-500 transition-all duration-300 hover:scale-110" aria-label="Facebook">
                  <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm">
                    <RiFacebookFill className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                </a>
              )}
              {isValidLink(x) && (
                <a href={x} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-white/60 to-white/30 hover:from-white hover:to-white/70 transition-all duration-300 hover:scale-110" aria-label="X (Twitter)">
                  <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
                    <RiTwitterXFill className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                </a>
              )}
              {isValidLink(tiktok) && (
                <a href={tiktok} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-teal-400/70 to-pink-500/70 hover:from-teal-300 hover:to-pink-400 transition-all duration-300 hover:scale-110" aria-label="TikTok">
                  <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm">
                    <RiTiktokFill className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                </a>
              )}
              {isValidLink(youtube) && (
                <a href={youtube} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-red-500/80 to-rose-500/80 hover:from-red-400 hover:to-rose-400 transition-all duration-300 hover:scale-110" aria-label="YouTube">
                  <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm">
                    <RiYoutubeFill className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                </a>
              )}
              {isValidLink(behance) && (
                <a href={behance} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-blue-500/70 to-indigo-500/70 hover:from-blue-400 hover:to-indigo-400 transition-all duration-300 hover:scale-110" aria-label="Behance">
                  <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm">
                    <RiBehanceFill className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                </a>
              )}
              {isValidLink(dribbble) && (
                <a href={dribbble} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-pink-400/80 to-rose-400/80 hover:from-pink-300 hover:to-rose-300 transition-all duration-300 hover:scale-110" aria-label="Dribbble">
                  <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm">
                    <RiDribbbleFill className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                </a>
              )}
              {isValidLink(snapchat) && (
                <a href={snapchat} target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-yellow-300/80 to-amber-300/80 hover:from-yellow-200 hover:to-amber-200 transition-all duration-300 hover:scale-110" aria-label="Snapchat">
                  <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/10 text-black backdrop-blur-sm">
                    <RiSnapchatFill className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-right relative z-20">
            <h3 className="font-semibold text-white arabic-text text-base sm:text-lg">روابط سريعة</h3>
            <nav className="flex flex-col gap-2 sm:gap-3">
              {normalizedQuickLinks.map((l, i) => (
                <Link key={i} href={l.href} className="footer-link force-black-text arabic-text group flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base" style={{color: '#000 !important', textDecoration: 'none !important'}}>
                  <ArrowLeft className="h-3 w-3 rtl-flip opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all force-black-text" style={{color: '#000 !important', fill: '#000 !important', stroke: '#000 !important'}} />
                  <span style={{color: '#000 !important', textDecoration: 'none !important'}} className="force-black-text">{l.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-right relative z-20">
            <h3 className="font-semibold text-white arabic-text text-base sm:text-lg">خدماتنا</h3>
            <nav className="flex flex-col gap-2 sm:gap-3">
              {servicesLinks.map((l, i) => (
                <Link key={i} href={l.href} className="footer-link force-black-text arabic-text group flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base" style={{color: '#000 !important', textDecoration: 'none !important'}}>
                  <ArrowLeft className="h-3 w-3 rtl-flip opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all force-black-text" style={{color: '#000 !important', fill: '#000 !important', stroke: '#000 !important'}} />
                  <span style={{color: '#000 !important', textDecoration: 'none !important'}} className="force-black-text">{l.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-right sm:col-span-2 lg:col-span-1 relative z-20">
            <h3 className="font-semibold text-white arabic-text text-base sm:text-lg">تواصل معنا</h3>
            <div className="space-y-3">
              {email && (
                <a href={`mailto:${email}`} className="footer-link force-black-text block text-sm sm:text-base break-all" style={{color: '#000 !important', textDecoration: 'none !important'}}>
                  <span style={{color: '#000 !important'}}>{email}</span>
                </a>
              )}
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-50 px-2 sm:px-3 py-1 sm:py-2 rounded-full border border-blue-200">
                  <svg width="16" height="16" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm1.262-8.24h2.276c1.601 0 2.978-.543 3.934-1.481.844-.827 1.32-1.955 1.32-3.104 0-.827-.233-1.481-.65-1.955-.417-.475-1.087-.827-2.043-.827H9.65l-.312 7.367z" fill="#003087"/>
                    <path d="M6.232 21.337H1.626a.641.641 0 0 1-.633-.74L4.1.901C4.182.382 4.63 0 5.154 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H8.402c-.524 0-.968.382-1.05.9l-1.12 7.106z" fill="#0070ba"/>
                  </svg>
                  <span className="text-xs text-blue-800 font-medium">PayPal</span>
                </div>
                <span className="text-xs text-white/60 arabic-text">دفع آمن</span>
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 font-medium arabic-text group transition-all duration-300 hover:scale-105 mt-3 sm:mt-4 border border-white/30 text-sm sm:text-base w-full sm:w-auto [&>*]:!text-black [&>*>*]:!text-black"
                asChild
              >
                <Link href={finalWhatsAppLink || contactCtaLink} className="flex items-center justify-center gap-2" style={{color: '#000 !important'}}>
                  <span style={{color: '#000 !important'}}>{contactCtaText}</span>
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 rtl-flip group-hover:translate-x-1 transition-transform" style={{color: '#000 !important'}} />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 text-center">
          <p className="text-white/80 arabic-text text-sm sm:text-base">{copyright}</p>
          <p className="text-xs sm:text-sm text-white/60 mt-2 arabic-text opacity-75">{refundNote}</p>
        </div>
      </div>
    </footer>
    </div>
  )
}
