/**
 * Streaming Service - Handles SSE streaming for real-time responses
 */

const ModelRouter = require('./modelRouter');
const ModeController = require('./modeController');
const RAGEngine = require('./ragEngine');
const axios = require('axios');

class StreamingService {
  constructor() {
    this.modelRouter = new ModelRouter();
    this.ragEngine = new RAGEngine();
  }

  /**
   * Stream chat response using SSE
   */
  async streamResponse(res, params) {
    const {
      message,
      history = [],
      context = {},
      mode = 'normal',
      marks = null
    } = params;

    try {
      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for nginx

      // Select optimal model
      const selectedModel = this.modelRouter.selectModel({
        message,
        history,
        mode
      });

      console.log('🌊 Streaming with model:', selectedModel);

      // Send initial metadata
      this.sendEvent(res, 'start', {
        model: selectedModel,
        mode: mode
      });

      // Perform RAG search for relevant resources
      const ragContext = await this.ragEngine.search(message, {
        branch: context.branch,
        scheme: context.scheme,
        semester: context.semester,
        subject: context.subject
      });

      // Get system prompt
      let systemPrompt = ModeController.getSystemPrompt(mode, context);
      
      // Add RAG context if available
      if (ragContext) {
        systemPrompt += ragContext.contextText;
      }
      
      if (mode === 'exam' && marks) {
        systemPrompt += `\n\n[IMPORTANT: Generate a ${marks}-mark VTU exam answer. Follow the exact format and word count for ${marks} marks.]`;
      }

      // Build messages
      const messages = this.buildMessages(systemPrompt, history, message);

      // Stream based on model
      const config = this.modelRouter.getConfig(selectedModel);
      let totalTokens = 0;

      switch (config.provider) {
        case 'openai':
        case 'groq':
          totalTokens = await this.streamOpenAI(res, selectedModel, messages, config);
          break;
        case 'anthropic':
          totalTokens = await this.streamAnthropic(res, selectedModel, messages);
          break;
        case 'google':
          totalTokens = await this.streamGoogle(res, selectedModel, messages);
          break;
        default:
          throw new Error(`Streaming not supported for provider: ${config.provider}`);
      }

      // Send completion event
      this.sendEvent(res, 'done', {
        model: selectedModel,
        tokens: totalTokens,
        marks: marks,
        sources: ragContext?.sources || []
      });

      res.end();

    } catch (error) {
      console.error('❌ Streaming error:', error);
      this.sendEvent(res, 'error', {
        message: error.message || 'Streaming failed'
      });
      res.end();
    }
  }

  /**
   * Build messages array
   */
  buildMessages(systemPrompt, history, currentMessage) {
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history (last 10 messages)
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
   * Stream from OpenAI (or Groq with OpenAI-compatible API)
   */
  async streamOpenAI(res, model, messages, config) {
    const apiUrl = config.provider === 'groq' 
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

    const apiKey = config.provider === 'groq'
      ? process.env.GROQ_API_KEY
      : process.env.OPENAI_API_KEY;

    const modelName = config.provider === 'groq'
      ? 'llama-3.3-70b-versatile'
      : model;

    const response = await axios({
      method: 'post',
      url: apiUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: modelName,
        messages: messages,
        stream: true,
        temperature: 0.7,
        max_tokens: ModeController.getMaxTokens(messages[0].content)
      },
      responseType: 'stream'
    });

    let totalTokens = 0;

    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.includes('[DONE]')) continue;
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              
              if (content) {
                this.sendEvent(res, 'token', { content });
                totalTokens++;
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      });

      response.data.on('end', () => {
        resolve(totalTokens);
      });

      response.data.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Stream from Anthropic
   */
  async streamAnthropic(res, model, messages) {
    const client = this.modelRouter.getClient(model);
    
    // Extract system message
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const stream = await client.messages.stream({
      model: model,
      max_tokens: 2000,
      system: systemMessage?.content || '',
      messages: conversationMessages
    });

    let totalTokens = 0;

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        this.sendEvent(res, 'token', { content: event.delta.text });
        totalTokens++;
      }
    }

    return totalTokens;
  }

  /**
   * Stream from Google Gemini
   */
  async streamGoogle(res, model, messages) {
    const client = this.modelRouter.getClient(model);
    const geminiModel = client.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Convert messages to Gemini format
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    // Build chat history (exclude the last message - it will be sent separately)
    const chatHistory = conversationMessages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Gemini requires history to start with user role, not model
    // If history starts with 'model', remove it or ensure it starts with 'user'
    if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
      chatHistory.shift(); // Remove first model message
    }

    const chat = geminiModel.startChat({
      history: chatHistory,
      systemInstruction: systemMessage ? {
        role: 'user',
        parts: [{ text: systemMessage.content }]
      } : undefined
    });

    const lastMessage = conversationMessages[conversationMessages.length - 1];
    const result = await chat.sendMessageStream(lastMessage.content);

    let totalTokens = 0;

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        this.sendEvent(res, 'token', { content: text });
        totalTokens += text.length / 4; // Rough token estimate
      }
    }

    return totalTokens;
  }

  /**
   * Send SSE event
   */
  sendEvent(res, type, data) {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  }
}

module.exports = StreamingService;
