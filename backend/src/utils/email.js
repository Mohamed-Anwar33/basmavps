import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';

/**
 * Email utility functions
 */

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Email templates
const templates = {
  'email-verification': {
    subject: {
      ar: 'تأكيد البريد الإلكتروني - بصمة تصميم',
      en: 'Email Verification - Basmat Design'
    },
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4b2e83; margin: 0;">بصمة تصميم</h1>
            <h2 style="color: #7a4db3; margin: 5px 0 0 0; font-weight: 300;">Basmat Design</h2>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h3 style="color: #333; margin-bottom: 15px;">تأكيد البريد الإلكتروني</h3>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              مرحباً ${data.name}، يرجى استخدام الكود التالي لتأكيد بريدك الإلكتروني:
            </p>
            
            <div style="background: #4b2e83; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
              ${data.code}
            </div>
            
            <p style="color: #999; font-size: 14px;">
              هذا الكود صالح لمدة 10 دقائق فقط
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <div style="text-align: center;">
            <h3 style="color: #333; margin-bottom: 15px;">Email Verification</h3>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hello ${data.name}, please use the following code to verify your email:
            </p>
            
            <p style="color: #999; font-size: 14px;">
              This code is valid for 10 minutes only
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              فريق بصمة تصميم | Basmat Design Team
            </p>
          </div>
        </div>
      </div>
    `
  },
  
  welcome: {
    subject: {
      ar: 'مرحباً بك في بصمة تصميم',
      en: 'Welcome to Basmat Design'
    },
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4b2e83 0%, #7a4db3 100%); color: white; padding: 30px; text-align: center;">
          <h1>مرحباً ${data.name}</h1>
          <h2>Welcome to Basmat Design</h2>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <p>شكراً لانضمامك إلى بصمة تصميم! نحن متحمسون لمساعدتك في تحقيق رؤيتك الإبداعية.</p>
          <p>Thank you for joining Basmat Design! We're excited to help you bring your creative vision to life.</p>
          
          <div style="margin: 30px 0; padding: 20px; background: white; border-radius: 8px;">
            <h3>ما يمكنك فعله الآن:</h3>
            <ul>
              <li>استكشف خدماتنا المتنوعة</li>
              <li>تصفح معرض أعمالنا</li>
              <li>ابدأ مشروعك الأول معنا</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/services" 
               style="background: #4b2e83; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              استكشف خدماتنا
            </a>
          </div>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p>بصمة تصميم - حيث تتحقق الأحلام الإبداعية</p>
          <p>Basmat Design - Where Creative Dreams Come True</p>
        </div>
      </div>
    `
  },
  
  'password-reset-otp': {
    subject: {
      ar: 'رمز إعادة تعيين كلمة المرور',
      en: 'Password Reset Code'
    },
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4b2e83; margin: 0;">بصمة تصميم</h1>
            <h2 style="color: #7a4db3; margin: 5px 0 0 0; font-weight: 300;">Basmat Design</h2>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h3 style="color: #333; margin-bottom: 15px;">رمز إعادة تعيين كلمة المرور</h3>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              مرحباً ${data.name}، استخدم الرمز التالي لإعادة تعيين كلمة المرور:
            </p>
            
            <div style="background: linear-gradient(135deg, #4b2e83 0%, #7a4db3 100%); color: white; padding: 25px; border-radius: 12px; margin: 25px 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; box-shadow: 0 4px 15px rgba(75, 46, 131, 0.3);">
              ${data.resetCode}
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                ⏰ هذا الرمز صالح لمدة ${data.expiresIn} فقط
              </p>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #333; margin: 0 0 10px 0;">كيفية الاستخدام:</h4>
            <ol style="color: #666; line-height: 1.6; margin: 0; padding-right: 20px;">
              <li>اذهب إلى صفحة إعادة تعيين كلمة المرور</li>
              <li>أدخل الرمز المكون من 6 أرقام</li>
              <li>اختر كلمة مرور جديدة</li>
            </ol>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <div style="text-align: center;">
            <h3 style="color: #333; margin-bottom: 15px;">Password Reset Code</h3>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hello ${data.name}, use the following code to reset your password:
            </p>
            
            <p style="color: #999; font-size: 14px;">
              ⏰ This code is valid for ${data.expiresIn} only
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              فريق بصمة تصميم | Basmat Design Team
            </p>
            <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
              إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني
            </p>
          </div>
        </div>
      </div>
    `
  },
  
  'order-confirmation': {
    subject: (data) => ({
      ar: `تأكيد الطلب #${data.orderNumber || 'جديد'} - شكراً لثقتك بنا 🎉`,
      en: `Order Confirmation #${data.orderNumber || 'New'} - Thank you for your trust 🎉`
    }),
    html: (data) => `
      <div style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #f8fafc;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4b2e83 0%, #7a4db3 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="background: rgba(255,255,255,0.1); display: inline-block; padding: 20px; border-radius: 50%; margin-bottom: 20px;">
            <span style="font-size: 50px;">🎉</span>
          </div>
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">تم تأكيد طلبك بنجاح!</h1>
          <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: 400; opacity: 0.9;">Order Confirmed Successfully!</h2>
          <div style="background: rgba(255,255,255,0.15); padding: 15px 25px; border-radius: 25px; margin-top: 25px; display: inline-block;">
            <span style="font-size: 18px; font-weight: 600;">رقم الطلب: ${data.orderNumber || 'يتم الإنشاء...'}</span>
          </div>
        </div>
        
        <!-- Main Content -->
        <div style="background: white; padding: 40px 30px;">
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 22px;">مرحباً ${data.customerName} 👋</h3>
            <p style="color: #64748b; line-height: 1.6; margin: 0; font-size: 16px;">
              شكراً لك على ثقتك بنا! تم استلام طلبك وسيتم البدء في العمل عليه قريباً جداً.
            </p>
          </div>
          
          <!-- Order Details -->
          <div style="background: #f1f5f9; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #4b2e83;">
            <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 18px; display: flex; align-items: center;">
              <span style="margin-left: 8px;">📦</span> تفاصيل الطلب
            </h3>
            ${data.items.map(item => `
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="flex: 1;">
                    <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px;">
                      ${item.title?.ar || item.title || 'خدمة تصميم'}
                    </h4>
                    <p style="margin: 0; color: #64748b; font-size: 14px;">
                      الكمية: ${item.quantity} × ${item.price} ${data.currency}
                    </p>
                  </div>
                  <div style="text-align: left; font-weight: 600; color: #4b2e83; font-size: 16px;">
                    ${(item.quantity * item.price).toFixed(2)} ${data.currency}
                  </div>
                </div>
              </div>
            `).join('')}
            
            <!-- Total -->
            <div style="background: #4b2e83; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-top: 20px;">
              <div style="font-size: 18px; font-weight: 600;">
                إجمالي المبلغ: ${data.total} ${data.currency}
              </div>
              <div style="font-size: 14px; opacity: 0.8; margin-top: 5px;">
                تم الدفع بنجاح عبر PayPal ✅
              </div>
            </div>
          </div>
          
          <!-- Additional Info -->
          ${data.description ? `
            <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #92400e; display: flex; align-items: center;">
                <span style="margin-left: 8px;">📋</span> وصف المشروع
              </h4>
              <p style="margin: 0; color: #92400e; line-height: 1.5;">${data.description}</p>
            </div>
          ` : ''}
          
          ${data.notes ? `
            <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #047857; display: flex; align-items: center;">
                <span style="margin-left: 8px;">💬</span> ملاحظات إضافية
              </h4>
              <p style="margin: 0; color: #047857; line-height: 1.5;">${data.notes}</p>
            </div>
          ` : ''}
          
          <!-- Next Steps -->
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center;">
            <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 18px;">الخطوات التالية 🚀</h3>
            <div style="color: #0369a1; line-height: 1.6; margin: 15px 0;">
              <p style="margin: 8px 0;">✅ سيتم التواصل معك خلال 24 ساعة</p>
              <p style="margin: 8px 0;">🎨 سنبدأ العمل على مشروعك فوراً</p>
              <p style="margin: 8px 0;">📱 ستصلك التحديثات على WhatsApp</p>
              <p style="margin: 8px 0;">🎁 ستستلم النتيجة النهائية قريباً</p>
            </div>
            
            <div style="margin: 25px 0;">
              <a href="${data.whatsappLink || 'https://wa.me/966506752133'}?text=مرحباً، أريد الاستفسار عن طلبي رقم ${data.orderNumber}" 
                 style="background: #25d366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: 600; margin: 5px;">
                💬 تواصل معنا على WhatsApp
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              تاريخ الطلب: ${data.orderDate || new Date().toLocaleDateString('ar-SA')}
            </p>
            ${data.paypalEmail ? `
              <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0;">
                تم الدفع من: ${data.paypalEmail}
              </p>
            ` : ''}
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #1e293b; color: white; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
          <div style="margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 24px; color: #a855f7;">بصمة تصميم</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.8;">Basmat Design - Where Dreams Become Reality</p>
          </div>
          
          <div style="border-top: 1px solid #374151; padding-top: 20px; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px; opacity: 0.7;">
              شكراً لاختيارك بصمة تصميم - حيث تتحقق الأحلام الإبداعية ✨
            </p>
          </div>
        </div>
      </div>
    `
  },
  
  'delivery-notification': {
    subject: (data) => ({
      ar: `تم تسليم الطلب #${data.orderNumber || 'الطلب'} 🎉`,
      en: `Order #${data.orderNumber || 'Your Order'} Has Been Delivered 🎉`
    }),
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4b2e83 0%, #7a4db3 100%); color: white; padding: 30px; text-align: center;">
          <h1>تم تسليم الطلب</h1>
          <h2>Order Delivered</h2>
          <p>رقم الطلب: ${data.orderNumber}</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <p>مرحباً ${data.customerName},</p>
          <p>تم تسليم طلبك بنجاح.</p>
          
          <div style="background: white; padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #4b2e83; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
              <span style="margin-left: 10px;">🎁</span> روابط التسليم - Delivery Links
            </h3>
            ${data.deliveryLinks.map((l, index) => {
              const isString = typeof l === 'string';
              const url = isString ? l : (l?.url || '');
              const title = isString ? `الملف ${index + 1}` : (l?.title || `الملف ${index + 1}`);
              const description = !isString && l?.description ? l.description : '';
              const image = !isString && l?.image ? `<div style="margin: 10px 0;"><img src="${l.image}" alt="${title}" style="max-width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"/></div>` : '';
              return `
                <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 15px 0; border-left: 4px solid #4b2e83;">
                  <div style="margin-bottom: 15px;">
                    <a href="${url}" 
                       style="background: linear-gradient(135deg, #4b2e83 0%, #7a4db3 100%); 
                              color: white; 
                              padding: 12px 24px; 
                              text-decoration: none; 
                              border-radius: 25px; 
                              display: inline-block; 
                              font-weight: 600; 
                              font-size: 16px;
                              box-shadow: 0 3px 10px rgba(75, 46, 131, 0.3);
                              transition: all 0.3s ease;" 
                       target="_blank" 
                       rel="noopener noreferrer">
                      📁 ${title}
                    </a>
                  </div>
                  ${description ? `<p style="color: #64748b; margin: 10px 0 0 0; font-size: 14px; line-height: 1.5;">${description}</p>` : ''}
                  ${image}
                </div>
              `;
            }).join('')}
            
            <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 20px; border-radius: 10px; margin-top: 25px; text-align: center;">
              <p style="color: #047857; margin: 0; font-weight: 600;">
                💡 نصيحة: احفظ هذه الروابط في مكان آمن للوصول إليها لاحقاً
              </p>
              <p style="color: #047857; margin: 5px 0 0 0; font-size: 14px;">
                Tip: Save these links in a safe place for future access
              </p>
            </div>
          </div>
          
          <p>شكراً لاستخدام خدماتنا.</p>
          <p>Thank you for using our services!</p>
        </div>
      </div>
    `
  }
};

// Send email function
export const sendEmail = async ({ to, subject, template, data, html, text }) => {
  try {
    let emailHtml = html;
    let emailSubject = subject;

    if (template && templates[template]) {
      const templateData = templates[template];
      
      // Handle dynamic subject function vs static object
      if (typeof templateData.subject === 'function') {
        const subjectData = templateData.subject(data || {});
        emailSubject = subjectData.ar;
      } else {
        emailSubject = templateData.subject.ar + ' - ' + templateData.subject.en;
      }
      
      emailHtml = templateData.html(data || {});
    }

    // Check if email configuration is available
    const emailConfigured = Boolean(process.env.SMTP_HOST) && 
                           Boolean(process.env.SMTP_USER) && 
                           Boolean(process.env.FROM_EMAIL) &&
                           Boolean(process.env.SMTP_PASS);
    const isProd = process.env.NODE_ENV === 'production';

    if (!emailConfigured && !isProd) {
      return {
        messageId: 'dev-fallback',
        accepted: [to],
        rejected: [],
        envelope: {
          to: [to],
          from: process.env.FROM_EMAIL || 'dev@example.com'
        }
      };
    }

    if (!emailConfigured) {
      const missing = [];
      if (!process.env.SMTP_HOST) missing.push('SMTP_HOST');
      if (!process.env.SMTP_USER) missing.push('SMTP_USER');
      if (!process.env.SMTP_PASS) missing.push('SMTP_PASS');
      if (!process.env.FROM_EMAIL) missing.push('FROM_EMAIL');
      throw new Error(`Email configuration incomplete. Missing: ${missing.join(', ')}`);
    }

    const transporter = createTransporter();
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to,
      subject: emailSubject,
      html: emailHtml,
      text: text || (emailHtml ? emailHtml.replace(/<[^>]*>/g, '') : '')
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    throw error;
  }
};

// Send bulk emails
export const sendBulkEmails = async (emails) => {
  const results = [];
  
  for (const email of emails) {
    try {
      const result = await sendEmail(email);
      results.push({ success: true, messageId: result.messageId, email: email.to });
    } catch (error) {
      results.push({ success: false, error: error.message, email: email.to });
    }
  }
  
  return results;
};

// Check if email configuration is available
export const verifyEmailConfig = () => {
  const required = ['SMTP_HOST', 'SMTP_USER', 'FROM_EMAIL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing email configuration: ${missing.join(', ')}`);
  }
  
  return true;
};

// Test email sending function
export const sendTestEmail = async (to) => {
  try {
    verifyEmailConfig();
    
    const result = await sendEmail({
      to,
      subject: 'Test Email - Basmat Design',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #4b2e83 0%, #7a4db3 100%); color: white; padding: 30px; text-align: center; border-radius: 8px;">
            <h1>اختبار البريد الإلكتروني</h1>
            <h2>Email Test - Basmat Design</h2>
          </div>
          <div style="background: white; padding: 30px; border-radius: 8px; margin-top: 20px;">
            <p>مرحباً،</p>
            <p>تم اختبار بريدك الإلكتروني بنجاح.</p>
            <p>تم اختبار بريدك الإلكتروني بنجاح.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p><strong>معلومات الاختبار:</strong></p>
            <ul>
              <li>تاريخ الاختبار: ${new Date().toLocaleString('ar-SA')}</li>
              <li>SMTP: ${process.env.SMTP_HOST}</li>
              <li>البريد: ${process.env.FROM_EMAIL}</li>
            </ul>
            <p style="margin-top: 30px; text-align: center; color: #666;">
              بصمة تصميم - Basmat Design
            </p>
          </div>
        </div>
      `
    });
    
    return { success: true, messageId: result.messageId, details: result };
  } catch (error) {
    throw error;
  }
};

