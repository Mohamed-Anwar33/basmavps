import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/basmadesign', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define schema
const pageContentSchema = new mongoose.Schema({}, { strict: false });
const PageContent = mongoose.model('PageContent', pageContentSchema);

async function updateIcons() {
  try {
    
    // Find what-makes-us-different content
    const section = await PageContent.findOne({ pageType: 'what-makes-us-different' });
    
    if (section) {
      console.log('📊 البيانات الحالية:', JSON.stringify(section.content.legacy?.items?.map(item => ({
        title: item.title,
        iconName: item.iconName
      })), null, 2));
      
      // Update the icons to new ones
      if (section.content && section.content.legacy && section.content.legacy.items) {
        let updated = false;
        section.content.legacy.items.forEach((item, index) => {
          // Since all items have "star", assign specific icons based on index
          if (item.iconName === 'star' || item.iconName === 'palette') {
            // Assign icons based on order
            const iconMap = ['paintbrush', 'award', 'check-circle', 'lightbulb'];
            const newIcon = iconMap[index] || 'lightbulb';
            item.iconName = newIcon;
            updated = true;
          }
          // Also update old icon names if they exist
          if (item.iconName === 'palette') {
            item.iconName = 'paintbrush';
            updated = true;
          }
          if (item.iconName === 'shield') {
            item.iconName = 'award';
            updated = true;
          }
          if (item.iconName === 'clock') {
            item.iconName = 'check-circle';
            updated = true;
          }
          if (item.iconName === 'sparkles') {
            item.iconName = 'lightbulb';
            updated = true;
          }
        });
        
        if (updated) {
          await section.save();
          console.log('📊 البيانات الجديدة:', JSON.stringify(section.content.legacy?.items?.map(item => ({
            title: item.title,
            iconName: item.iconName
          })), null, 2));
        } else {
        }
      }
    } else {
    }
    
    process.exit(0);
    
  } catch (error) {
    process.exit(1);
  }
}

// Run the update
updateIcons();
