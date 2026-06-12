/**
 * Memory Manager - Manages conversations and user data in localStorage
 */

import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  CONVERSATIONS: 'vtu_ai_conversations',
  ACTIVE_CONVERSATION: 'vtu_ai_active',
  PREFERENCES: 'vtu_ai_preferences',
  ANALYTICS: 'vtu_ai_analytics'
};

class MemoryManager {
  /**
   * Generate unique ID
   */
  static generateId() {
    return uuidv4();
  }

  /**
   * Create new conversation
   */
  static createConversation(firstMessage = null) {
    const conversation = {
      id: this.generateId(),
      title: firstMessage ? this.generateTitle(firstMessage) : 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      tags: [],
      totalMessages: 0,
      totalTokens: 0
    };

    return conversation;
  }

  /**
   * Generate conversation title from first message
   */
  static generateTitle(message) {
    // Take first 50 characters, remove newlines
    let title = message.trim().replace(/\n/g, ' ').substring(0, 50);
    if (message.length > 50) title += '...';
    return title;
  }

  /**
   * Get all conversations
   */
  static getAllConversations() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading conversations:', e);
      return [];
    }
  }

  /**
   * Get conversation by ID
   */
  static getConversation(conversationId) {
    const conversations = this.getAllConversations();
    return conversations.find(c => c.id === conversationId);
  }

  /**
   * Save conversation
   */
  static saveConversation(conversation) {
    const conversations = this.getAllConversations();
    const index = conversations.findIndex(c => c.id === conversation.id);

    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.unshift(conversation); // Add to beginning
    }

    // Limit to 100 conversations
    if (conversations.length > 100) {
      conversations.splice(100);
    }

    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    return conversation;
  }

  /**
   * Delete conversation
   */
  static deleteConversation(conversationId) {
    const conversations = this.getAllConversations();
    const filtered = conversations.filter(c => c.id !== conversationId);
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(filtered));
    
    // If active conversation was deleted, clear it
    const activeId = this.getActiveConversationId();
    if (activeId === conversationId) {
      this.setActiveConversationId(null);
    }
  }

  /**
   * Add message to conversation
   */
  static addMessage(conversationId, message) {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    message.id = this.generateId();
    message.timestamp = new Date().toISOString();

    conversation.messages.push(message);
    conversation.totalMessages = conversation.messages.length;
    conversation.totalTokens += message.metadata?.tokens || 0;
    conversation.updatedAt = new Date().toISOString();

    // Auto-generate title from first user message if still default
    if (conversation.title === 'New Conversation' && message.role === 'user') {
      conversation.title = this.generateTitle(message.content);
    }

    // Auto-tag based on content
    conversation.tags = this.extractTags(conversation);

    this.saveConversation(conversation);

    return conversation;
  }

  /**
   * Extract tags from conversation
   */
  static extractTags(conversation) {
    const tags = new Set();
    
    // Extract common VTU subjects and topics
    const keywords = [
      'DBMS', 'OS', 'DSA', 'COA', 'Networks', 'TOC', 'SE', 'Python', 'Java', 'C++',
      'Normalization', 'SQL', 'Scheduling', 'Deadlock', 'Algorithm', 'Database'
    ];

    conversation.messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      keywords.forEach(keyword => {
        if (content.includes(keyword.toLowerCase())) {
          tags.add(keyword);
        }
      });
    });

    return Array.from(tags);
  }

  /**
   * Update conversation title
   */
  static updateTitle(conversationId, newTitle) {
    const conversation = this.getConversation(conversationId);
    if (conversation) {
      conversation.title = newTitle;
      conversation.updatedAt = new Date().toISOString();
      this.saveConversation(conversation);
    }
  }

  /**
   * Toggle pin status
   */
  static togglePin(conversationId) {
    const conversation = this.getConversation(conversationId);
    if (conversation) {
      conversation.isPinned = !conversation.isPinned;
      conversation.updatedAt = new Date().toISOString();
      this.saveConversation(conversation);
    }
  }

  /**
   * Search conversations
   */
  static searchConversations(query) {
    const conversations = this.getAllConversations();
    const lowerQuery = query.toLowerCase();

    return conversations.filter(conv => {
      // Search in title
      if (conv.title.toLowerCase().includes(lowerQuery)) return true;

      // Search in tags
      if (conv.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;

      // Search in messages
      return conv.messages.some(msg =>
        msg.content.toLowerCase().includes(lowerQuery)
      );
    });
  }

  /**
   * Get active conversation ID
   */
  static getActiveConversationId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
  }

  /**
   * Set active conversation ID
   */
  static setActiveConversationId(conversationId) {
    if (conversationId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION, conversationId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
    }
  }

  /**
   * Get active conversation history for API requests
   */
  static getActiveConversationHistory(limit = 10) {
    const activeId = this.getActiveConversationId();
    if (!activeId) return [];

    const conversation = this.getConversation(activeId);
    if (!conversation) return [];

    // Return last N messages
    return conversation.messages.slice(-limit);
  }

  /**
   * Export conversation to JSON
   */
  static exportConversationJSON(conversationId) {
    const conversation = this.getConversation(conversationId);
    if (!conversation) return null;

    return JSON.stringify(conversation, null, 2);
  }

  /**
   * Export conversation to Markdown
   */
  static exportConversationMarkdown(conversationId) {
    const conversation = this.getConversation(conversationId);
    if (!conversation) return null;

    let md = `# ${conversation.title}\n\n`;
    md += `Created: ${new Date(conversation.createdAt).toLocaleString()}\n\n`;
    md += `---\n\n`;

    conversation.messages.forEach(msg => {
      md += `### ${msg.role === 'user' ? '👤 You' : '🎓 AI Assistant'}\n`;
      md += `*${new Date(msg.timestamp).toLocaleString()}*\n\n`;
      md += `${msg.content}\n\n`;

      if (msg.metadata?.sources && msg.metadata.sources.length > 0) {
        md += `**Sources:**\n`;
        msg.metadata.sources.forEach(src => {
          md += `- ${src.title}\n`;
        });
        md += `\n`;
      }

      md += `---\n\n`;
    });

    return md;
  }

  /**
   * Get storage usage
   */
  static getStorageUsage() {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }

    const maxSize = 5 * 1024 * 1024; // 5MB typical limit
    const usagePercent = (totalSize / maxSize) * 100;

    return {
      used: totalSize,
      max: maxSize,
      usagePercent: usagePercent.toFixed(2),
      remaining: maxSize - totalSize
    };
  }

  /**
   * Clean up old conversations if storage full
   */
  static cleanupStorage() {
    const usage = this.getStorageUsage();

    if (usage.usagePercent > 90) {
      const conversations = this.getAllConversations();

      // Keep pinned and recent 50 conversations
      const toKeep = conversations
        .filter((c, idx) => c.isPinned || idx < 50);

      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(toKeep));
      
      return {
        removed: conversations.length - toKeep.length,
        kept: toKeep.length
      };
    }

    return { removed: 0, kept: this.getAllConversations().length };
  }

  /**
   * Clear all conversations
   */
  static clearAllConversations() {
    localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
  }

  /**
   * Get user preferences
   */
  static getPreferences() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return stored ? JSON.parse(stored) : this.getDefaultPreferences();
    } catch (e) {
      console.error('Error loading preferences:', e);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Get default preferences
   */
  static getDefaultPreferences() {
    return {
      theme: 'dark',
      defaultMode: 'normal',
      preferredModel: 'auto',
      preferredLanguage: 'en',
      answerStyle: 'detailed',
      voiceEnabled: true,
      autoRead: false,
      academicContext: {}
    };
  }

  /**
   * Save preferences
   */
  static savePreferences(preferences) {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  }

  /**
   * Update single preference
   */
  static updatePreference(key, value) {
    const prefs = this.getPreferences();
    prefs[key] = value;
    this.savePreferences(prefs);
  }
}

export default MemoryManager;
