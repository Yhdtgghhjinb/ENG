const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Model configurations
const MODEL_CONFIGS = {
  'gpt-4o': {
    provider: 'openai',
    capabilities: ['text', 'vision', 'code', 'reasoning'],
    costPerMillion: { input: 2.50, output: 10.00 },
    speed: 'medium',
    contextWindow: 128000,
    bestFor: ['complex-reasoning', 'coding', 'image-analysis']
  },
  'claude-3-5-sonnet': {
    provider: 'anthropic',
    capabilities: ['text', 'vision', 'analysis', 'writing'],
    costPerMillion: { input: 3.00, output: 15.00 },
    speed: 'medium',
    contextWindow: 200000,
    bestFor: ['long-context', 'analysis', 'writing', 'research']
  },
  'gemini-pro': {
    provider: 'google',
    capabilities: ['text', 'speed'],
    costPerMillion: { input: 0.10, output: 0.40 },
    speed: 'fast',
    contextWindow: 32000,
    bestFor: ['simple-qa', 'quick-answers', 'general']
  },
  'llama-3.3-70b': {
    provider: 'groq',
    capabilities: ['text', 'speed'],
    costPerMillion: { input: 0.00, output: 0.00 },
    speed: 'very-fast',
    contextWindow: 32000,
    bestFor: ['simple-qa', 'conversation', 'general']
  }
};

class ModelRouter {
  constructor() {
    // Initialize AI clients only if API keys are present
    this.openai = process.env.OPENAI_API_KEY 
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
    
    this.anthropic = process.env.ANTHROPIC_API_KEY
      ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      : null;
    
    this.google = process.env.GOOGLE_API_KEY
      ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
      : null;
  }

  /**
   * Select optimal model based on request characteristics
   */
  selectModel(request) {
    const { type, hasImage, complexity, mode, contextLength } = this.analyzeRequest(request);
    
    console.log('🎯 Model Selection:', { type, hasImage, complexity, mode, contextLength });
    
    // Vision tasks → Vision-capable models
    if (hasImage) {
      return this.selectFromModels(['gpt-4o', 'claude-3-5-sonnet', 'gemini-pro']);
    }
    
    // Code generation/debugging → Prefer available models
    if (type === 'code') {
      return this.selectFromModels(['gpt-4o', 'gemini-pro', 'claude-3-5-sonnet']);
    }
    
    // Long context (>20k tokens) → Claude or Gemini
    if (contextLength > 20000) {
      return this.selectFromModels(['claude-3-5-sonnet', 'gemini-pro']);
    }
    
    // Research mode → Best analytical model
    if (mode === 'research') {
      return this.selectFromModels(['claude-3-5-sonnet', 'gemini-pro']);
    }
    
    // Exam answers → Based on complexity
    if (mode === 'exam') {
      return complexity === 'high' 
        ? this.selectFromModels(['gpt-4o', 'gemini-pro']) 
        : this.selectFromModels(['gemini-pro', 'llama-3.3-70b']);
    }
    
    // Simple Q&A → Fast, cost-effective model
    if (complexity === 'low' && contextLength < 2000) {
      return this.selectFromModels(['llama-3.3-70b', 'gemini-pro']);
    }
    
    // Default: Use best available model
    return this.selectFromModels(['gemini-pro', 'gpt-4o', 'claude-3-5-sonnet', 'llama-3.3-70b']);
  }

  /**
   * Analyze request characteristics
   */
  analyzeRequest(request) {
    const { message, history = [], files = [], mode } = request;
    
    // Detect if images attached
    const hasImage = files.some(f => f.type && f.type.startsWith('image/'));
    
    // Estimate complexity
    const complexity = this.estimateComplexity(message, history);
    
    // Calculate approximate token count
    const contextLength = this.calculateTokens(message, history);
    
    // Detect task type
    const type = this.detectTaskType(message);
    
    return { type, hasImage, complexity, mode, contextLength };
  }

  /**
   * Estimate query complexity
   */
  estimateComplexity(message, history = []) {
    const complexKeywords = [
      'explain in detail', 'analyze', 'compare', 'design', 'implement',
      'algorithm', 'architecture', 'differentiate', 'evaluate'
    ];
    
    const simpleKeywords = [
      'what is', 'define', 'list', 'name', 'when', 'who', 'where'
    ];
    
    const lowerMessage = message.toLowerCase();
    
    const hasComplexKeywords = complexKeywords.some(kw => lowerMessage.includes(kw));
    const hasSimpleKeywords = simpleKeywords.some(kw => lowerMessage.includes(kw));
    
    if (hasComplexKeywords) return 'high';
    if (hasSimpleKeywords && message.length < 100) return 'low';
    
    return 'medium';
  }

  /**
   * Detect task type from message
   */
  detectTaskType(message) {
    const lowerMessage = message.toLowerCase();
    
    const codeKeywords = ['code', 'program', 'function', 'class', 'algorithm', 'implement', 'debug', 'error'];
    const researchKeywords = ['research', 'compare', 'analyze', 'survey', 'review'];
    
    if (codeKeywords.some(kw => lowerMessage.includes(kw))) return 'code';
    if (researchKeywords.some(kw => lowerMessage.includes(kw))) return 'research';
    
    return 'general';
  }

  /**
   * Calculate approximate token count
   */
  calculateTokens(message, history = []) {
    // Rough estimation: 1 token ≈ 4 characters
    let totalChars = message.length;
    
    history.forEach(msg => {
      totalChars += (msg.content || '').length;
    });
    
    return Math.ceil(totalChars / 4);
  }

  /**
   * Select from candidate models with fallback
   */
  selectFromModels(candidates) {
    // Try models in order
    for (const model of candidates) {
      if (this.isModelAvailable(model)) {
        return model;
      }
    }
    return candidates[0]; // Default to first
  }

  /**
   * Check if model is available (API key configured)
   */
  isModelAvailable(model) {
    const config = MODEL_CONFIGS[model];
    if (!config) return false;
    
    switch (config.provider) {
      case 'openai':
        return !!process.env.OPENAI_API_KEY;
      case 'anthropic':
        return !!process.env.ANTHROPIC_API_KEY;
      case 'google':
        return !!process.env.GOOGLE_API_KEY;
      case 'groq':
        return !!process.env.GROQ_API_KEY;
      default:
        return false;
    }
  }

  /**
   * Get model client for selected model
   */
  getClient(model) {
    const config = MODEL_CONFIGS[model];
    if (!config) throw new Error(`Unknown model: ${model}`);
    
    switch (config.provider) {
      case 'openai':
        return this.openai;
      case 'anthropic':
        return this.anthropic;
      case 'google':
        return this.google;
      case 'groq':
        return this.openai; // Groq uses OpenAI-compatible API
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }

  /**
   * Get model configuration
   */
  getConfig(model) {
    return MODEL_CONFIGS[model];
  }
}

module.exports = ModelRouter;
