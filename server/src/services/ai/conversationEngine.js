/**
 * Conversation Engine - Core AI service with multi-model support
 */

const ModelRouter = require('./modelRouter');
const ModeController = require('./modeController');
const axios = require('axios');

class ConversationEngine {
  constructor() {
    this.modelRouter = new ModelRouter();
  }

  /**
   * Generate chat response with optimal model selection
   */
  async generateResponse(params) {
    const {
      message,
      history = [],
      context = {},
      mode = 'normal',
      marks = null,
      files = []
    } = params;

    try {
      console.log('🤖 Generating response:', {
        messageLength: message.length,
        historyCount: history.length,
        mode,
        marks,
        hasContext: !!context.subject
      });

      // Select optimal model
      const selectedModel = this.modelRouter.selectModel({
        message,
        history,
        files,
        mode,
        type: 'general'
      });

      console.log('✅ Selected model:', selectedModel);

      // Get system prompt for mode
      let systemPrompt = ModeController.getSystemPrompt(mode, context);

      // Add marks instruction for exam mode
      if (mode === 'exam' && marks) {
        systemPrompt += `\n\n[IMPORTANT: Generate a ${marks}-mark VTU exam answer. Follow the exact format and word count for ${marks} marks.]`;
      }

      // Build messages array
      const messages = this.buildMessages(systemPrompt, history, message);

      // Get max tokens for mode
      const maxTokens = ModeController.getMaxTokens(mode);

      // Call appropriate model
      const response = await this.callModel(selectedModel, messages, maxTokens);

      return {
        success: true,
        response: response.text,
        model: selectedModel,
        tokens: response.tokens,
        marks: marks
      };

    } catch (error) {
      console.error('❌ Conversation Engine Error:', error);
      return {
        success: false,
        response: this.getErrorMessage(error),
        model: null,
        tokens: 0
      };
    }
  }

  /**
   * Build messages array for AI model
   */
  buildMessages(systemPrompt, history, currentMessage) {
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history (last 10 messages for context)
    const recentHistory = history.slice(-10);
    recentHistory.forEach(msg => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    });

    // Add current message
    messages.push({
      role: 'user',
      content: currentMessage
    });

    return messages;
  }

  /**
   * Call AI model based on provider
   */
  async callModel(model, messages, maxTokens) {
    const config = this.modelRouter.getConfig(model);
    
    switch (config.provider) {
      case 'openai':
        return await this.callOpenAI(model, messages, maxTokens);
      
      case 'anthropic':
        return await this.callAnthropic(model, messages, maxTokens);
      
      case 'google':
        return await this.callGoogle(model, messages, maxTokens);
      
      case 'groq':
        return await this.callGroq(model, messages, maxTokens);
      
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(model, messages, maxTokens) {
    const client = this.modelRouter.getClient(model);
    
    const response = await client.chat.completions.create({
      model: model,
      messages: messages,
      max_tokens: maxTokens,
      temperature: 0.7
    });

    return {
      text: response.choices[0].message.content,
      tokens: response.usage.total_tokens
    };
  }

  /**
   * Call Anthropic API
   */
  async callAnthropic(model, messages, maxTokens) {
    const client = this.modelRouter.getClient(model);
    
    // Extract system message
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await client.messages.create({
      model: model,
      max_tokens: maxTokens,
      system: systemMessage?.content || '',
      messages: conversationMessages
    });

    return {
      text: response.content[0].text,
      tokens: response.usage.input_tokens + response.usage.output_tokens
    };
  }

  /**
   * Call Google Gemini API
   */
  async callGoogle(model, messages, maxTokens) {
    const client = this.modelRouter.getClient(model);
    const geminiModel = client.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Convert messages to Gemini format
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const chatHistory = conversationMessages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = geminiModel.startChat({
      history: chatHistory,
      systemInstruction: systemMessage?.content || ''
    });

    const lastMessage = conversationMessages[conversationMessages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;

    return {
      text: response.text(),
      tokens: response.usageMetadata?.totalTokenCount || 0
    };
  }

  /**
   * Call Groq API (OpenAI-compatible)
   */
  async callGroq(model, messages, maxTokens) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      text: response.data.choices[0].message.content,
      tokens: response.data.usage.total_tokens
    };
  }

  /**
   * Get user-friendly error message
   */
  getErrorMessage(error) {
    if (error.response?.status === 401) {
      return '⚠️ API key is invalid or expired. Please check your configuration.';
    }
    
    if (error.response?.status === 429) {
      return '⏳ Rate limit reached. Please wait a moment and try again.';
    }
    
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return '⏳ Request timed out. Please try again.';
    }

    return `❌ An error occurred: ${error.message}. Please try again.`;
  }
}

module.exports = ConversationEngine;
