import mongoose from 'mongoose';
import PageContent from '../src/models/PageContent.js';
import dotenv from 'dotenv';

dotenv.config();

const countersData = {
  title: "أرقامنا",
  subtitle: "أرقامنا تتحدث عن التزامنا، إبداعنا، وشراكتنا مع كل عميل",
  items: [
    {
      label: "مشاريع مكتملة",
      value: 468,
      suffix: "+",
      iconName: "Briefcase",
      iconColor: "text-emerald-600",
      chipBg: "from-emerald-100 to-teal-100"
    },
    {
      label: "عملاء راضون", 
      value: 258,
      suffix: "+",
      iconName: "Users",
      iconColor: "text-blue-600",
      chipBg: "from-blue-100 to-indigo-100"
    },
    {
      label: "سنوات خبرة",
      value: 6,
      suffix: "+",
      iconName: "Timer",
      iconColor: "text-amber-600",
      chipBg: "from-amber-100 to-yellow-100"
    },
    {
      label: "تقييم العملاء",
      value: 4.9,
      suffix: "/5",
      iconName: "Star",
      iconColor: "text-rose-600",
      chipBg: "from-rose-100 to-pink-100"
    }
  ]
};

async function exportCountersData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Check if counters data already exists
    let countersContent = await PageContent.findOne({ pageType: 'counters' });
    
    if (countersContent) {
      countersContent.content.legacy = countersData;
      countersContent.lastModified = new Date();
    } else {
      countersContent = new PageContent({
        pageType: 'counters',
        content: {
          sections: [],
          metadata: {
            title: { ar: 'أرقامنا', en: 'Our Numbers' },
            description: { ar: 'إحصائيات ونتائج أعمالنا', en: 'Statistics and results of our work' },
            keywords: ['counters', 'statistics', 'numbers', 'أرقام', 'إحصائيات'],
            canonicalUrl: '',
            robots: 'index,follow'
          },
          legacy: countersData
        },
        isActive: true,
        status: 'published'
      });
    }

    await countersContent.save();
    console.log('📊 Data:', JSON.stringify(countersData, null, 2));

  } catch (error) {
  } finally {
    await mongoose.disconnect();
  }
}

exportCountersData();
