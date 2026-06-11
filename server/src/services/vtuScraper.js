const axios = require('axios');
const cheerio = require('cheerio');
const Notification = require('../models/Notification');

// VTU Official Website URL
const VTU_NOTIFICATIONS_URL = 'https://vtu.ac.in/en/latest-news/';

/**
 * Scrape VTU website for latest notifications
 */
async function scrapeVTUNotifications() {
  try {
    console.log('🔍 Scraping VTU website for notifications...');
    
    const response = await axios.get(VTU_NOTIFICATIONS_URL, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const notifications = [];

    // Scrape notification items (adjust selector based on VTU website structure)
    $('.news-item, .notification-item, .latest-news-item').each((i, elem) => {
      const title = $(elem).find('h3, h4, .title, .news-title').text().trim();
      const message = $(elem).find('p, .description, .news-desc').text().trim();
      const link = $(elem).find('a').attr('href');
      const dateText = $(elem).find('.date, .news-date, time').text().trim();

      if (title) {
        notifications.push({
          title,
          message: message || 'Click to view details',
          type: 'announcement',
          category: 'VTU Official',
          link: link ? (link.startsWith('http') ? link : `https://vtu.ac.in${link}`) : VTU_NOTIFICATIONS_URL,
          priority: 'high',
          isActive: true,
          source: 'VTU_OFFICIAL',
          scrapedAt: new Date(),
        });
      }
    });

    console.log(`✅ Found ${notifications.length} notifications from VTU`);
    return notifications;
  } catch (error) {
    console.error('❌ Error scraping VTU website:', error.message);
    return [];
  }
}

/**
 * Save new notifications to database (avoid duplicates)
 */
async function saveNewNotifications(scrapedNotifications) {
  let newCount = 0;

  for (const notif of scrapedNotifications) {
    // Check if notification already exists
    const existing = await Notification.findOne({ 
      title: notif.title,
      source: 'VTU_OFFICIAL'
    });

    if (!existing) {
      await Notification.create(notif);
      newCount++;
      console.log(`✅ New notification added: ${notif.title}`);
    }
  }

  return newCount;
}

/**
 * Main function to fetch and save VTU notifications
 */
async function syncVTUNotifications() {
  try {
    console.log('🚀 Starting VTU notification sync...');
    
    const scrapedNotifications = await scrapeVTUNotifications();
    
    if (scrapedNotifications.length === 0) {
      console.log('⚠️  No notifications found from VTU website');
      return { success: false, message: 'No notifications found' };
    }

    const newCount = await saveNewNotifications(scrapedNotifications);
    
    console.log(`🎉 Sync complete! Added ${newCount} new notifications`);
    
    return { 
      success: true, 
      total: scrapedNotifications.length,
      new: newCount,
      message: `Added ${newCount} new notifications from VTU`
    };
  } catch (error) {
    console.error('❌ VTU sync failed:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  scrapeVTUNotifications,
  saveNewNotifications,
  syncVTUNotifications,
};
