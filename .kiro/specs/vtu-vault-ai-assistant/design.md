# Technical Design Document

## Document Information

**Project:** VTU Vault AI Assistant - Next Generation  
**Version:** 1.0  
**Created:** June 12, 2026  
**Status:** Draft  
**Architecture:** Anonymous, Local-First, Zero-Login

---

## Executive Summary

This document outlines the technical architecture for transforming the VTU Vault AI Assistant from a basic Q&A bot into a next-generation AI learning platform comparable to ChatGPT, Claude, and Perplexity. The system will feature multi-model AI routing, RAG-based knowledge retrieval, conversational AI with context awareness, multi-modal understanding (text, files, images, voice), specialized learning modes, and advanced study planning capabilities.

**Key Design Principles:**
- **Anonymous-first:** Zero login, no user accounts, all data in browser localStorage
- **AI Intelligence:** Focus on capabilities, not UI redesign
- **Production-ready:** Scalable, reliable, secure architecture
- **Cost-effective:** Smart model routing to optimize API costs
- **VTU-optimized:** Deep integration with VTU curriculum and resources

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Multi-Model AI Router](#2-multi-model-ai-router)
3. [RAG Knowledge Base](#3-rag-knowledge-base)
4. [Context Detection System](#4-context-detection-system)
5. [Conversation & Memory Management](#5-conversation--memory-management)
6. [Streaming Response System](#6-streaming-response-system)
7. [File & Image Processing Pipeline](#7-file--image-processing-pipeline)
8. [Voice AI System](#8-voice-ai-system)
9. [Specialized Modes Architecture](#9-specialized-modes-architecture)
10. [Study Planner & Analytics](#10-study-planner--analytics)
11. [API Design & Schemas](#11-api-design--schemas)
12. [Frontend Component Architecture](#12-frontend-component-architecture)
13. [Database Design](#13-database-design)
14. [Security & Privacy](#14-security--privacy)
15. [Performance Optimization](#15-performance-optimization)
16. [Implementation Roadmap](#16-implementation-roadmap)
17. [Cost Estimation](#17-cost-estimation)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Conversation │  │ Voice Input  │  │ File Upload  │         │
│  │   Manager    │  │   Handler    │  │  Processor   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Context     │  │    Memory    │  │  Analytics   │         │
│  │  Detector    │  │   Manager    │  │   Tracker    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                   localStorage (Conversations, Preferences)     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API / SSE
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js/Express)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Multi-Model  │  │     RAG      │  │ Conversation │         │
│  │   Router     │  │   Engine     │  │   Engine     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    File      │  │    Image     │  │    Voice     │         │
│  │  Processor   │  │  Processor   │  │   Handler    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Study        │  │  QP Intel.   │  │ Mode         │         │
│  │ Planner      │  │  Service     │  │ Controller   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
        ┌──────────────────┐     ┌──────────────────┐
        │   MongoDB        │     │   Pinecone       │
        │   (VTU Data)     │     │   (Vector DB)    │
        └──────────────────┘     └──────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ▼
        ┌──────────────────────────────────────────┐
        │     External AI Models (API Calls)      │
        │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐│
        │  │ GPT  │  │Claude│  │Gemini│  │ Groq ││
        │  │ 4o   │  │ 3.5  │  │ 2.0  │  │Llama ││
        │  └──────┘  └──────┘  └──────┘  └──────┘│
        └──────────────────────────────────────────┘
```

### 1.2 Data Flow

**Typical Conversation Flow:**
```
1. User types/speaks message → Frontend
2. Context Detector extracts Branch/Scheme/Semester/Subject from URL
3. Message + Context + History sent to Backend API
4. Backend:
   a. Model Router selects optimal AI model
   b. RAG Engine searches VTU resources
   c. Retrieved content + message + context sent to AI model
   d. AI generates response (streamed)
5. Response streamed back to Frontend (SSE)
6. Frontend displays response token-by-token
7. Conversation saved to localStorage
8. Analytics updated
```

### 1.3 Technology Stack

**Frontend:**
- React 18+
- React Router v6
- Framer Motion (animations)
- TailwindCSS (styling)
- Axios (HTTP client)
- localForage (enhanced localStorage)
- react-markdown (markdown rendering)
- Web Speech API (voice)

**Backend:**
- Node.js 20+
- Express.js
- MongoDB (VTU resources, metadata)
- Pinecone (vector embeddings)
- Redis (optional caching)
- Bull (job queues for heavy processing)

**AI Models:**
- OpenAI GPT-4o (reasoning, coding)
- Anthropic Claude 3.5 Sonnet (analysis, writing)
- Google Gemini 2.0 Flash (speed, vision)
- Groq Llama 3.3 70B (fast, cost-effective)
- OpenAI Whisper (speech-to-text)
- ElevenLabs / Browser TTS (text-to-speech)

**File Processing:**
- pdf-parse (PDF extraction)
- mammoth (DOCX parsing)
- pptx-parser (PPTX parsing)
- sharp (image processing)
- tesseract.js (OCR fallback)

---

## 2. Multi-Model AI Router

### 2.1 Architecture

The Model Router is the brain that decides which AI model to use for each request based on task type, complexity, cost, and performance requirements.

**Router Decision Logic:**

```javascript
// server/src/services/modelRouter.js

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
  'gemini-2.0-flash': {
    provider: 'google',
    capabilities: ['text', 'vision', 'speed'],
    costPerMillion: { input: 0.10, output: 0.40 },
    speed: 'fast',
    contextWindow: 100000,
    bestFor: ['simple-qa', 'quick-answers', 'vision']
  },
  'llama-3.3-70b': {
    provider: 'groq',
    capabilities: ['text', 'speed'],
    costPerMillion: { input: 0.00, output: 0.00 }, // Free tier
    speed: 'very-fast',
    contextWindow: 32000,
    bestFor: ['simple-qa', 'conversation', 'general']
  }
};

class ModelRouter {
  selectModel(request) {
    const { type, hasImage, complexity, mode, contextLength } = this.analyzeRequest(request);
    
    // Vision tasks → Vision-capable models
    if (hasImage) {
      return this.selectFromModels(['gpt-4o', 'gemini-2.0-flash', 'claude-3-5-sonnet']);
    }
    
    // Code generation/debugging
    if (type === 'code') {
      return 'gpt-4o';
    }
    
    // Long context (>20k tokens)
    if (contextLength > 20000) {
      return 'claude-3-5-sonnet';
    }
    
    // Research mode → Best analytical model
    if (mode === 'research') {
      return 'claude-3-5-sonnet';
    }
    
    // Exam answers (2-16 marks)
    if (mode === 'exam') {
      return complexity === 'high' ? 'gpt-4o' : 'gemini-2.0-flash';
    }
    
    // Simple Q&A → Fast, cost-effective model
    if (complexity === 'low' && contextLength < 2000) {
      return 'llama-3.3-70b';
    }
    
    // Default: GPT-4o for best quality
    return 'gpt-4o';
  }
  
  analyzeRequest(request) {
    const { message, history, files, mode } = request;
    
    // Detect if images attached
    const hasImage = files?.some(f => f.type.startsWith('image/'));
    
    // Estimate complexity
    const complexity = this.estimateComplexity(message, history);
    
    // Calculate context length
    const contextLength = this.calculateTokens(message, history);
    
    // Detect task type
    const type = this.detectTaskType(message);
    
    return { type, hasImage, complexity, mode, contextLength };
  }
  
  estimateComplexity(message, history = []) {
    // Keywords indicating complexity
    const complexKeywords = ['explain in detail', 'analyze', 'compare', 'design', 'implement', 'algorithm', 'architecture'];
    const simpleKeywords = ['what is', 'define', 'list', 'name', 'when', 'who'];
    
    const hasComplexKeywords = complexKeywords.some(kw => message.toLowerCase().includes(kw));
    const hasSimpleKeywords = simpleKeywords.some(kw => message.toLowerCase().includes(kw));
    
    if (hasComplexKeywords) return 'high';
    if (hasSimpleKeywords && message.length < 100) return 'low';
    
    return 'medium';
  }
  
  async selectFromModels(candidates) {
    // Try models in order, with fallback
    for (const model of candidates) {
      if (await this.isModelAvailable(model)) {
        return model;
      }
    }
    return candidates[0]; // Default to first if none available
  }
}
```

### 2.2 Fallback Strategy

If primary model fails:
1. Retry same model once (transient errors)
2. Switch to fallback model from same category
3. Switch to general-purpose model (GPT-4o)
4. Return graceful error message

**Example Fallback Chain:**
```
GPT-4o fails → Claude 3.5 Sonnet → Gemini 2.0 Flash → Error
```

### 2.3 Model Performance Tracking

Track metrics for continuous optimization:
- Average latency per model
- Success rate per model
- Cost per request
- User satisfaction (implicit: regeneration rate)

Store metrics in Redis for real-time analytics.

---

## 3. RAG Knowledge Base

### 3.1 Architecture

RAG (Retrieval Augmented Generation) ensures AI responses are grounded in actual VTU resources rather than hallucinated information.

**Components:**
1. **Document Indexer:** Processes VTU resources into chunks
2. **Embedding Generator:** Converts chunks to vector embeddings
3. **Vector Store:** Stores embeddings (Pinecone)
4. **Retriever:** Searches for relevant chunks
5. **Context Builder:** Formats retrieved chunks for AI

### 3.2 Document Processing Pipeline

```javascript
// server/src/services/ragEngine.js

class RAGEngine {
  async indexDocument(document) {
    // 1. Extract text from document (PDF/DOCX/etc)
    const text = await this.extractText(document);
    
    // 2. Split into chunks (500-1000 tokens each)
    const chunks = this.splitIntoChunks(text, {
      chunkSize: 800,
      overlap: 100 // Overlap prevents context loss
    });
    
    // 3. Generate metadata for each chunk
    const chunksWithMetadata = chunks.map((chunk, idx) => ({
      text: chunk,
      metadata: {
        docId: document._id,
        docTitle: document.title,
        subject: document.subject,
        semester: document.semester,
        branch: document.branch,
        scheme: document.scheme,
        type: document.resourceType, // notes, qp, model-answer, etc
        chunkIndex: idx,
        url: document.url
      }
    }));
    
    // 4. Generate embeddings using OpenAI text-embedding-3-small
    const embeddings = await this.generateEmbeddings(
      chunksWithMetadata.map(c => c.text)
    );
    
    // 5. Store in Pinecone
    await this.vectorStore.upsert({
      vectors: embeddings.map((embedding, idx) => ({
        id: `${document._id}_chunk_${idx}`,
        values: embedding,
        metadata: chunksWithMetadata[idx].metadata
      })),
      namespace: this.getNamespace(document) // e.g., "cse_2022_sem3"
    });
  }
  
  async search(query, filters = {}) {
    // 1. Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);
    
    // 2. Build filter for metadata
    const pineconeFilter = this.buildFilter(filters);
    
    // 3. Search Pinecone
    const results = await this.vectorStore.query({
      vector: queryEmbedding,
      topK: 5,
      filter: pineconeFilter,
      includeMetadata: true
    });
    
    // 4. Re-rank results using hybrid search (combine semantic + keyword)
    const reranked = await this.hybridRerank(query, results);
    
    // 5. Format for AI context
    return this.formatContext(reranked);
  }
  
  formatContext(results) {
    if (results.length === 0) return null;
    
    let context = "RELEVANT VTU RESOURCES:\n\n";
    
    results.forEach((result, idx) => {
      const meta = result.metadata;
      context += `[SOURCE ${idx + 1}] ${meta.docTitle} (${meta.type})\n`;
      context += `Subject: ${meta.subject}, Semester: ${meta.semester}\n`;
      context += `Content:\n${result.text}\n`;
      context += `---\n\n`;
    });
    
    context += "Use the above sources to provide accurate, source-backed answers. Always cite sources when using information from them.";
    
    return {
      contextText: context,
      sources: results.map(r => ({
        title: r.metadata.docTitle,
        subject: r.metadata.subject,
        semester: r.metadata.semester,
        type: r.metadata.type,
        url: r.metadata.url,
        relevance: r.score
      }))
    };
  }
}
```

### 3.3 Hybrid Search Strategy

Combine semantic and keyword search for best results:

1. **Semantic Search (Pinecone):** Finds conceptually similar content
2. **Keyword Search (MongoDB text index):** Finds exact term matches
3. **Reranking:** Combine scores with weighted formula

```javascript
hybridScore = (0.7 * semanticScore) + (0.3 * keywordScore)
```

### 3.4 Namespace Strategy

Organize embeddings by academic context:
- Namespace format: `{branch}_{scheme}_{semester}`
- Example: `cse_2022_sem3`, `ece_2021_sem5`
- Enables fast filtering by context
- Reduces search space, improves speed

---

## 4. Context Detection System

### 4.1 URL-Based Context Extraction

The Context Detector automatically infers user's academic context from the current page URL.

**URL Patterns:**

```javascript
// client/src/utils/contextDetector.js

const URL_PATTERNS = {
  // /branches/:branch
  branch: /\/branches\/([^\/]+)/,
  
  // /schemes/:branch/:scheme
  scheme: /\/schemes\/([^\/]+)\/([^\/]+)/,
  
  // /semesters/:branch/:scheme/:semester
  semester: /\/semesters\/([^\/]+)\/([^\/]+)\/(\d+)/,
  
  // /subjects/:branch/:scheme/:semester/:subjectCode
  subject: /\/subjects\/([^\/]+)\/([^\/]+)\/(\d+)\/([^\/]+)/,
  
  // /resources/:subjectCode/:resourceId
  resource: /\/resources\/([^\/]+)\/([^\/]+)/
};

class ContextDetector {
  static detectContext(url = window.location.pathname) {
    const context = {
      branch: null,
      scheme: null,
      semester: null,
      subject: null,
      subjectName: null,
      resource: null
    };
    
    // Try to match URL patterns in order (most specific first)
    const subjectMatch = url.match(URL_PATTERNS.subject);
    if (subjectMatch) {
      context.branch = decodeURIComponent(subjectMatch[1]);
      context.scheme = decodeURIComponent(subjectMatch[2]);
      context.semester = parseInt(subjectMatch[3]);
      context.subject = decodeURIComponent(subjectMatch[4]);
      
      // Fetch subject name from localStorage or API
      context.subjectName = this.getSubjectName(context.subject);
      return context;
    }
    
    const semesterMatch = url.match(URL_PATTERNS.semester);
    if (semesterMatch) {
      context.branch = decodeURIComponent(semesterMatch[1]);
      context.scheme = decodeURIComponent(semesterMatch[2]);
      context.semester = parseInt(semesterMatch[3]);
      return context;
    }
    
    const schemeMatch = url.match(URL_PATTERNS.scheme);
    if (schemeMatch) {
      context.branch = decodeURIComponent(schemeMatch[1]);
      context.scheme = decodeURIComponent(schemeMatch[2]);
      return context;
    }
    
    const branchMatch = url.match(URL_PATTERNS.branch);
    if (branchMatch) {
      context.branch = decodeURIComponent(branchMatch[1]);
      return context;
    }
    
    // Fallback: Check localStorage for saved preferences
    return this.getStoredContext();
  }
  
  static formatContextForAI(context) {
    if (!context.branch) return "";
    
    let prompt = "\n\n--- USER CONTEXT ---\n";
    
    if (context.subject && context.subjectName) {
      prompt += `The user is currently studying: ${context.subjectName} (${context.subject})\n`;
    }
    
    if (context.semester) {
      prompt += `Semester: ${context.semester}\n`;
    }
    
    if (context.scheme) {
      prompt += `Scheme: ${context.scheme}\n`;
    }
    
    if (context.branch) {
      prompt += `Branch: ${context.branch}\n`;
    }
    
    prompt += "\nProvide answers specific to this subject, semester, and VTU syllabus. Reference relevant modules and topics from the syllabus when appropriate.\n";
    prompt += "--- END CONTEXT ---\n\n";
    
    return prompt;
  }
}
```

### 4.2 Context Usage in Requests

Every AI request includes detected context:

```javascript
const sendMessage = async (message) => {
  const context = ContextDetector.detectContext();
  const contextPrompt = ContextDetector.formatContextForAI(context);
  
  const response = await axios.post('/api/ai/chat', {
    message: message,
    context: context,
    contextPrompt: contextPrompt,
    history: conversationHistory
  });
};
```

Backend uses context for:
1. **RAG filtering:** Only search resources from same branch/semester/subject
2. **AI system prompt:** Inform model about user's academic context
3. **Personalization:** Tailor explanations to curriculum

---

## 5. Conversation & Memory Management

### 5.1 LocalStorage Schema

All user data stored in browser localStorage with structured schema:

```javascript
// client/src/utils/memoryManager.js

const STORAGE_KEYS = {
  CONVERSATIONS: 'vtu_ai_conversations',
  ACTIVE_CONVERSATION: 'vtu_ai_active',
  PREFERENCES: 'vtu_ai_preferences',
  ANALYTICS: 'vtu_ai_analytics'
};

// Conversation Schema
const conversationSchema = {
  id: 'uuid-v4',
  title: 'Generated from first message',
  messages: [
    {
      id: 'uuid-v4',
      role: 'user' | 'assistant',
      content: 'Message text',
      timestamp: 'ISO timestamp',
      context: { branch, scheme, semester, subject },
      metadata: {
        model: 'gpt-4o',
        tokens: 450,
        sources: [...], // RAG sources used
        marks: 10, // If exam answer
        mode: 'exam' | 'tutor' | 'quiz' | etc
      }
    }
  ],
  createdAt: 'ISO timestamp',
  updatedAt: 'ISO timestamp',
  isPinned: false,
  tags: ['DBMS', 'Module 4'],
  totalMessages: 15,
  totalTokens: 8500
};

// User Preferences Schema
const preferencesSchema = {
  theme: 'light' | 'dark',
  defaultMode: 'normal' | 'exam' | 'tutor',
  preferredModel: 'auto' | 'gpt-4o' | etc,
  preferredLanguage: 'en' | 'kn',
  answerStyle: 'concise' | 'detailed' | 'step-by-step',
  voiceEnabled: true,
  autoRead: false,
  academicContext: {
    branch: 'CSE',
    scheme: '2022',
    semester: 3,
    enrolledSubjects: ['DBMS', 'OS', 'DSA']
  }
};

// Analytics Schema
const analyticsSchema = {
  totalQuestions: 450,
  totalTokensUsed: 125000,
  mostSearchedTopics: [
    { topic: 'Normalization', count: 25 },
    { topic: 'Process Scheduling', count: 18 }
  ],
  quizScores: [
    { subject: 'DBMS', date: '2026-06-10', score: 85, total: 100 }
  ],
  weakAreas: ['File Systems', 'Deadlock Prevention'],
  strongAreas: ['SQL Queries', 'ER Diagrams'],
  studyTime: 12500, // minutes
  lastActive: 'ISO timestamp'
};
```

### 5.2 Memory Manager Implementation

```javascript
class MemoryManager {
  // Create new conversation
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
  
  // Save conversation
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
  }
  
  // Add message to conversation
  static addMessage(conversationId, message) {
    const conversation = this.getConversation(conversationId);
    
    message.id = this.generateId();
    message.timestamp = new Date().toISOString();
    
    conversation.messages.push(message);
    conversation.totalMessages = conversation.messages.length;
    conversation.totalTokens += message.metadata?.tokens || 0;
    conversation.updatedAt = new Date().toISOString();
    
    // Auto-tag based on content
    conversation.tags = this.extractTags(conversation);
    
    this.saveConversation(conversation);
    
    return conversation;
  }
  
  // Search conversations
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
  
  // Export conversation
  static exportConversation(conversationId, format = 'json') {
    const conversation = this.getConversation(conversationId);
    
    if (format === 'json') {
      return JSON.stringify(conversation, null, 2);
    }
    
    if (format === 'markdown') {
      let md = `# ${conversation.title}\n\n`;
      md += `Created: ${new Date(conversation.createdAt).toLocaleString()}\n\n`;
      md += `---\n\n`;
      
      conversation.messages.forEach(msg => {
        md += `### ${msg.role === 'user' ? '👤 You' : '🎓 AI Assistant'}\n`;
        md += `*${new Date(msg.timestamp).toLocaleString()}*\n\n`;
        md += `${msg.content}\n\n`;
        
        if (msg.metadata?.sources) {
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
  }
  
  // Storage management
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
  
  // Clean up old conversations if storage full
  static cleanupStorage() {
    const usage = this.getStorageUsage();
    
    if (usage.usagePercent > 90) {
      const conversations = this.getAllConversations();
      
      // Keep pinned and recent 50 conversations
      const toKeep = conversations
        .filter(c => c.isPinned || conversations.indexOf(c) < 50);
      
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(toKeep));
    }
  }
}
```

### 5.3 Conversation UI Features

**Sidebar:**
- List all conversations with previews
- Search bar for filtering
- Sort by: Recent, Oldest, Most messages, Alphabetical
- Pin important conversations
- Delete individual conversations
- Export conversation (JSON/Markdown/PDF)

**Conversation Actions:**
- New Chat (start fresh)
- Rename Chat (edit title)
- Tag Chat (categorize)
- Share Chat (copy link with conversation data)
- Clear All Chats (with confirmation)

---

## 6. Streaming Response System

### 6.1 Server-Sent Events (SSE) Architecture

Implement real-time token-by-token streaming using SSE for optimal UX.

**Backend Implementation:**

```javascript
// server/src/routes/ai.js

router.post('/chat/stream', async (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const { message, history, context, mode } = req.body;
  
  try {
    // 1. Select model
    const model = modelRouter.selectModel({ message, history, mode, context });
    
    // 2. Get RAG context
    const ragContext = await ragEngine.search(message, {
      branch: context.branch,
      semester: context.semester,
      subject: context.subject
    });
    
    // 3. Build prompt
    const systemPrompt = buildSystemPrompt(mode, context, ragContext);
    const messages = buildMessages(systemPrompt, history, message);
    
    // 4. Stream from AI model
    const stream = await aiClient.streamCompletion(model, messages);
    
    let fullResponse = '';
    
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      
      if (token) {
        fullResponse += token;
        
        // Send token to client
        res.write(`data: ${JSON.stringify({ 
          type: 'token', 
          content: token 
        })}\n\n`);
      }
    }
    
    // 5. Send completion event with metadata
    res.write(`data: ${JSON.stringify({ 
      type: 'done',
      metadata: {
        model: model,
        tokens: countTokens(fullResponse),
        sources: ragContext?.sources || []
      }
    })}\n\n`);
    
    res.end();
    
  } catch (error) {
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      message: error.message 
    })}\n\n`);
    res.end();
  }
});
```

**Frontend Implementation:**

```javascript
// client/src/utils/streamingClient.js

class StreamingClient {
  async streamMessage(message, onToken, onComplete, onError) {
    const context = ContextDetector.detectContext();
    const history = MemoryManager.getActiveConversationHistory();
    
    try {
      const response = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, context, mode: currentMode })
      });
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let buffer = '';
      let fullResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'token') {
              fullResponse += data.content;
              onToken(data.content, fullResponse);
            } else if (data.type === 'done') {
              onComplete(fullResponse, data.metadata);
            } else if (data.type === 'error') {
              onError(data.message);
            }
          }
        }
      }
      
    } catch (error) {
      onError(error.message);
    }
  }
  
  // Stop generation
  abortStream(controller) {
    if (controller) {
      controller.abort();
    }
  }
}
```

### 6.2 Streaming UI Component

```javascript
// In AIChatBot.jsx

const [streamingMessage, setStreamingMessage] = useState('');
const [isStreaming, setIsStreaming] = useState(false);
const abortControllerRef = useRef(null);

const handleSendMessage = async () => {
  setIsStreaming(true);
  setStreamingMessage('');
  
  abortControllerRef.current = new AbortController();
  
  await streamingClient.streamMessage(
    input,
    // onToken
    (token, fullText) => {
      setStreamingMessage(fullText);
    },
    // onComplete
    (fullResponse, metadata) => {
      setIsStreaming(false);
      MemoryManager.addMessage(activeConversationId, {
        role: 'assistant',
        content: fullResponse,
        metadata: metadata
      });
      setStreamingMessage('');
    },
    // onError
    (error) => {
      setIsStreaming(false);
      showError(error);
    }
  );
};

const handleStopGeneration = () => {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
    setIsStreaming(false);
    
    // Save partial response
    if (streamingMessage) {
      MemoryManager.addMessage(activeConversationId, {
        role: 'assistant',
        content: streamingMessage + '\n\n[Generation stopped]',
        metadata: { partial: true }
      });
    }
  }
};
```

---

## 7. File & Image Processing Pipeline

### 7.1 File Upload Architecture

Support multiple file types with intelligent processing.

**Supported File Types:**
- PDF (notes, question papers, textbooks)
- DOCX (assignments, documents)
- PPTX (presentations, slides)
- TXT (plain text)
- Images: JPG, PNG, HEIC, WebP (handwritten notes, diagrams, screenshots)

**File Processing Service:**

```javascript
// server/src/services/fileProcessor.js

class FileProcessor {
  async processFile(file) {
    const extension = path.extname(file.originalname).toLowerCase();
    
    switch (extension) {
      case '.pdf':
        return await this.processPDF(file);
      case '.docx':
        return await this.processDOCX(file);
      case '.pptx':
        return await this.processPPTX(file);
      case '.txt':
        return await this.processTXT(file);
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.heic':
      case '.webp':
        return await this.processImage(file);
      default:
        throw new Error('Unsupported file type');
    }
  }
  
  async processPDF(file) {
    // Use pdf-parse library
    const dataBuffer = await fs.readFile(file.path);
    const pdfData = await pdfParse(dataBuffer);
    
    return {
      type: 'pdf',
      text: pdfData.text,
      pages: pdfData.numpages,
      metadata: pdfData.info,
      size: file.size
    };
  }
  
  async processDOCX(file) {
    // Use mammoth library
    const result = await mammoth.extractRawText({ path: file.path });
    
    return {
      type: 'docx',
      text: result.value,
      warnings: result.messages,
      size: file.size
    };
  }
  
  async processPPTX(file) {
    // Use pptx-parser library
    const text = await pptxParser.parse(file.path);
    
    return {
      type: 'pptx',
      text: text,
      size: file.size
    };
  }
  
  async processTXT(file) {
    const text = await fs.readFile(file.path, 'utf-8');
    
    return {
      type: 'txt',
      text: text,
      size: file.size
    };
  }
  
  async processImage(file) {
    // Use sharp for optimization
    const image = sharp(file.path);
    const metadata = await image.metadata();
    
    // Compress image if too large
    let processedPath = file.path;
    if (file.size > 2 * 1024 * 1024) { // > 2MB
      processedPath = file.path + '.compressed.jpg';
      await image
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(processedPath);
    }
    
    // Convert to base64 for AI models
    const base64 = await fs.readFile(processedPath, 'base64');
    
    return {
      type: 'image',
      mimeType: `image/${metadata.format}`,
      base64: base64,
      width: metadata.width,
      height: metadata.height,
      size: file.size
    };
  }
}
```

### 7.2 Vision AI Integration

For images, use vision-capable models (GPT-4o, Gemini 2.0 Flash, Claude 3.5 Sonnet).

```javascript
// server/src/services/visionService.js

class VisionService {
  async analyzeImage(imageData, question) {
    // Use GPT-4o for best vision capabilities
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: question || 'Analyze this image and extract all text, explain diagrams, and solve any problems shown.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${imageData.mimeType};base64,${imageData.base64}`
              }
            }
          ]
        }
      ],
      max_tokens: 2000
    });
    
    return response.choices[0].message.content;
  }
  
  // OCR extraction
  async extractText(imageData) {
    // Primary: Use GPT-4o vision
    const response = await this.analyzeImage(imageData, 
      'Extract all text from this image verbatim. Format it clearly.'
    );
    
    return response;
  }
  
  // Diagram explanation
  async explainDiagram(imageData, subject) {
    const response = await this.analyzeImage(imageData, 
      `Explain this ${subject} diagram in detail. Describe all components, connections, and concepts shown.`
    );
    
    return response;
  }
  
  // Solve equation/problem
  async solveProblem(imageData) {
    const response = await this.analyzeImage(imageData, 
      'Solve this problem step-by-step. Show all work and explain your reasoning.'
    );
    
    return response;
  }
}
```

### 7.3 File Upload UI

**Quick Actions:**
When user uploads a file, show quick action buttons:
- 📝 Summarize
- 📖 Explain
- ✍️ Create Notes
- ❓ Generate MCQs
- 🔍 Extract Text (images)
- 🎯 Solve (equations/problems in images)

---

## 8. Voice AI System

### 8.1 Speech-to-Text

Use Web Speech API for real-time voice input (free, works offline).

```javascript
// client/src/utils/voiceHandler.js

class VoiceHandler {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
  }
  
  // Initialize speech recognition
  initRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported');
    }
    
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    
    return this.recognition;
  }
  
  // Start listening
  startListening(onResult, onEnd, onError) {
    if (!this.recognition) {
      this.initRecognition();
    }
    
    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      onResult(finalTranscript, interimTranscript);
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };
    
    this.recognition.onerror = (event) => {
      this.isListening = false;
      onError(event.error);
    };
    
    this.recognition.start();
    this.isListening = true;
  }
  
  // Stop listening
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }
  
  // Text-to-Speech
  speak(text, options = {}) {
    // Cancel any ongoing speech
    this.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    
    // Get voices
    const voices = this.synthesis.getVoices();
    if (voices.length > 0) {
      // Prefer natural-sounding voices
      const preferredVoice = voices.find(v => 
        v.name.includes('Google') || v.name.includes('Natural')
      );
      utterance.voice = preferredVoice || voices[0];
    }
    
    this.synthesis.speak(utterance);
    
    return new Promise((resolve, reject) => {
      utterance.onend = resolve;
      utterance.onerror = reject;
    });
  }
  
  // Stop speech
  stopSpeaking() {
    this.synthesis.cancel();
  }
  
  // Check if speaking
  isSpeaking() {
    return this.synthesis.speaking;
  }
}
```

### 8.2 Voice Commands

Support natural voice commands:
- "Read last answer"
- "Stop reading"
- "New conversation"
- "Switch to exam mode"
- "Generate 10 marks answer"

```javascript
parseVoiceCommand(transcript) {
  const lower = transcript.toLowerCase();
  
  if (lower.includes('read') && lower.includes('answer')) {
    return { action: 'read_last_answer' };
  }
  
  if (lower.includes('stop')) {
    return { action: 'stop' };
  }
  
  if (lower.includes('new') && lower.includes('conversation')) {
    return { action: 'new_conversation' };
  }
  
  if (lower.includes('exam mode')) {
    return { action: 'set_mode', mode: 'exam' };
  }
  
  // Extract marks if mentioned
  const marksMatch = lower.match(/(\d+)\s*marks?/);
  if (marksMatch) {
    return { action: 'set_marks', marks: parseInt(marksMatch[1]) };
  }
  
  return { action: 'message', text: transcript };
}
```

---

## 9. Specialized Modes Architecture

### 9.1 Mode Controller

Centralized mode management with specific prompts and behaviors for each mode.

```javascript
// server/src/services/modeController.js

const MODE_CONFIGS = {
  normal: {
    name: 'Normal',
    systemPrompt: `You are VTU Expert, an AI assistant specialized in helping VTU (Visvesvaraya Technological University) students. Provide clear, accurate answers tailored to the VTU curriculum.`,
    maxTokens: 1500
  },
  
  exam: {
    name: 'VTU Exam Mode',
    systemPrompt: `You are an expert VTU exam answer generator. Format answers according to VTU marking schemes:

2 MARKS (70-90 words):
- Definition or brief explanation
- 1-2 key points
- Brief example if relevant

5 MARKS (220-260 words):
- Clear definition
- 5 main points with explanations
- Example with diagram description
- Brief conclusion

10 MARKS (550-650 words):
- Detailed introduction
- Complete explanation with multiple perspectives
- Diagrams (describe in text)
- Advantages and disadvantages
- Applications and examples
- Conclusion

16 MARKS (1100-1300 words):
- Comprehensive coverage like textbook
- Multiple sections with headings
- Detailed examples, code, or algorithms
- Step-by-step explanations
- Multiple diagrams (describe)
- Real-world applications
- Complete conclusion

Always structure answers with proper headings, numbering, and clear formatting.`,
    maxTokens: 2500
  },
  
  tutor: {
    name: 'AI Tutor Mode',
    systemPrompt: `You are an expert VTU tutor. Your goal is to help students LEARN and UNDERSTAND, not just get answers.

Teaching approach:
- Break complex topics into simple steps
- Use analogies and real-world examples
- Ask questions to check understanding
- Provide hints before full solutions
- Adapt pace based on student responses
- Encourage critical thinking
- Use Socratic method when appropriate

After explaining a concept:
1. Summarize key points
2. Give practice questions
3. Ask if they want to go deeper

Be patient, encouraging, and adaptive to student needs.`,
    maxTokens: 2000
  },
  
  viva: {
    name: 'Mock Viva Mode',
    systemPrompt: `You are a VTU viva examiner. Conduct realistic viva voce examinations:

1. Ask subject-specific viva questions based on syllabus
2. After student answers, ask relevant follow-up questions
3. Probe deeper if answer is superficial
4. Ask "why" and "how" questions
5. Adjust difficulty based on performance
6. Evaluate answers objectively
7. Provide scores out of 10 with justification
8. Give constructive feedback

Start by asking a fundamental question. Based on the answer, either:
- Ask related follow-up questions
- Probe weak areas
- Move to next topic if strong

After 10-15 questions, provide overall performance report:
- Total score
- Strengths observed
- Areas needing improvement
- Specific study recommendations`,
    maxTokens: 1500
  },
  
  quiz: {
    name: 'Quiz Mode',
    systemPrompt: `You are a VTU quiz generator and evaluator. Generate questions and evaluate answers:

Question types:
- MCQs (4 options, 1 correct)
- One-word answers
- Short answers (2-3 lines)
- Long answers (paragraph)

For each question:
1. Ensure it's from VTU syllabus
2. Mark difficulty level (Easy/Medium/Hard)
3. Provide correct answer
4. Give explanation after evaluation

When evaluating answers:
- Be fair and objective
- Give partial credit for partially correct answers
- Explain what was correct/incorrect
- Provide the complete answer with explanation

After quiz completion:
- Show final score and percentage
- List all questions with student's answers
- Provide detailed explanations for incorrect answers
- Identify weak topics
- Suggest focused study areas`,
    maxTokens: 2000
  },
  
  research: {
    name: 'Deep Research Mode',
    systemPrompt: `You are a research assistant for VTU students. Conduct thorough research and provide comprehensive reports:

Research process:
1. Understand the research question
2. Break down into sub-topics
3. Search relevant VTU resources
4. Analyze information from multiple sources
5. Synthesize findings
6. Identify gaps or conflicts
7. Provide balanced perspective

Report structure:
- Executive Summary
- Introduction and Background
- Key Findings (organized by sub-topics)
- Detailed Analysis
- Comparisons (if applicable)
- Conclusion and Recommendations
- References/Sources

Always:
- Cite sources with links
- Note confidence level of information
- Mention conflicting information if found
- Provide multiple perspectives when relevant
- Focus on VTU curriculum relevance`,
    maxTokens: 3000
  },
  
  code: {
    name: 'Coding Assistant',
    systemPrompt: `You are a coding assistant for VTU students. Help with programming in Java, Python, C, C++, JavaScript, and SQL:

When generating code:
- Write clean, well-commented code
- Follow best practices
- Include error handling
- Provide test cases
- Explain logic clearly

When debugging:
- Identify the error clearly
- Explain why it's happening
- Show corrected code
- Explain the fix

When explaining code:
- Go line-by-line for complex code
- Explain algorithms and data structures
- Discuss time and space complexity
- Suggest optimizations

Always format code with proper syntax highlighting and indentation.`,
    maxTokens: 2500
  }
};

class ModeController {
  static getSystemPrompt(mode, context) {
    const config = MODE_CONFIGS[mode] || MODE_CONFIGS.normal;
    let prompt = config.systemPrompt;
    
    // Add context to prompt
    if (context.subject) {
      prompt += `\n\nCurrent Subject: ${context.subject}`;
    }
    
    if (context.semester) {
      prompt += `\nSemester: ${context.semester}`;
    }
    
    return prompt;
  }
  
  static getMaxTokens(mode) {
    const config = MODE_CONFIGS[mode] || MODE_CONFIGS.normal;
    return config.maxTokens;
  }
}
```

---

## 10. Study Planner & Analytics

### 10.1 Study Planner Service

Generate personalized study plans based on exam timeline and syllabus.

```javascript
// server/src/services/studyPlanner.js

class StudyPlanner {
  async generatePlan(params) {
    const { 
      subjects,           // Array of subjects
      examDate,           // Target exam date
      currentDate,        // Today
      studyHoursPerDay,   // Available hours
      weakAreas,          // From analytics
      prioritizeTopics    // High-probability topics from QP analysis
    } = params;
    
    // Calculate days until exam
    const daysRemaining = this.calculateDays(currentDate, examDate);
    
    // Get syllabus coverage and weightage for each subject
    const subjectData = await Promise.all(
      subjects.map(sub => this.getSubjectSyllabus(sub))
    );
    
    // Allocate time per subject based on:
    // - Weightage
    // - Difficulty
    // - User's weak areas
    // - High-probability topics
    const timeAllocation = this.allocateTime(
      subjectData,
      daysRemaining,
      studyHoursPerDay,
      weakAreas,
      prioritizeTopics
    );
    
    // Generate day-by-day plan
    const dailyPlan = this.createDailyPlan(
      timeAllocation,
      daysRemaining,
      studyHoursPerDay
    );
    
    // Add revision sessions using spaced repetition
    const planWithRevision = this.addRevisionSessions(dailyPlan);
    
    // Add practice question sessions
    const finalPlan = this.addPracticeSessions(planWithRevision);
    
    return {
      overview: {
        totalDays: daysRemaining,
        hoursPerDay: studyHoursPerDay,
        totalHours: daysRemaining * studyHoursPerDay,
        subjects: subjects.length
      },
      timeAllocation: timeAllocation,
      dailySchedule: finalPlan,
      milestones: this.generateMilestones(finalPlan),
      tips: this.getStudyTips(daysRemaining)
    };
  }
  
  allocateTime(subjectData, days, hoursPerDay, weakAreas, prioritize) {
    const totalHours = days * hoursPerDay;
    
    return subjectData.map(subject => {
      // Base allocation from weightage
      let allocation = (subject.weightage / 100) * totalHours;
      
      // Boost if in weak areas
      if (weakAreas.includes(subject.code)) {
        allocation *= 1.3;
      }
      
      // Boost if has high-priority topics
      if (prioritize.some(p => p.subject === subject.code)) {
        allocation *= 1.2;
      }
      
      return {
        subject: subject.name,
        code: subject.code,
        hours: Math.round(allocation),
        modules: subject.modules
      };
    });
  }
  
  createDailyPlan(timeAllocation, days, hoursPerDay) {
    const plan = [];
    
    for (let day = 1; day <= days; day++) {
      const tasks = [];
      let hoursUsed = 0;
      
      // Distribute subjects across days
      timeAllocation.forEach(subject => {
        if (hoursUsed < hoursPerDay) {
          const hoursForToday = Math.min(
            hoursPerDay - hoursUsed,
            subject.hours / days
          );
          
          if (hoursForToday > 0.5) { // Minimum 30 min session
            tasks.push({
              subject: subject.subject,
              module: this.selectModule(subject, day),
              duration: hoursForToday,
              type: 'study',
              topics: this.getTopicsForModule(subject, day)
            });
            
            hoursUsed += hoursForToday;
          }
        }
      });
      
      plan.push({
        day: day,
        date: this.addDays(new Date(), day - 1),
        tasks: tasks,
        totalHours: hoursUsed,
        completed: false
      });
    }
    
    return plan;
  }
  
  addRevisionSessions(plan) {
    // Spaced repetition: Review on day 1, 3, 7, 14
    const revisionIntervals = [1, 3, 7, 14];
    
    plan.forEach((day, index) => {
      // Check if any topic studied in past should be revised today
      revisionIntervals.forEach(interval => {
        const studyDayIndex = index - interval;
        if (studyDayIndex >= 0) {
          const pastDay = plan[studyDayIndex];
          pastDay.tasks.forEach(task => {
            if (task.type === 'study') {
              day.tasks.push({
                subject: task.subject,
                module: task.module,
                duration: 0.5, // 30 min revision
                type: 'revision',
                topics: task.topics
              });
            }
          });
        }
      });
    });
    
    return plan;
  }
}
```

### 10.2 Analytics Tracker

Track learning patterns and performance to provide insights.

```javascript
// client/src/utils/analyticsTracker.js

class AnalyticsTracker {
  static trackQuestion(question, context) {
    const analytics = this.getAnalytics();
    
    analytics.totalQuestions += 1;
    
    // Track topic
    const topic = this.extractTopic(question);
    const existingTopic = analytics.mostSearchedTopics.find(t => t.topic === topic);
    
    if (existingTopic) {
      existingTopic.count += 1;
    } else {
      analytics.mostSearchedTopics.push({ topic, count: 1 });
    }
    
    // Sort by count
    analytics.mostSearchedTopics.sort((a, b) => b.count - a.count);
    
    this.saveAnalytics(analytics);
  }
  
  static trackQuizScore(subject, score, total) {
    const analytics = this.getAnalytics();
    
    analytics.quizScores.push({
      subject,
      date: new Date().toISOString(),
      score,
      total,
      percentage: (score / total) * 100
    });
    
    // Update weak/strong areas
    const percentage = (score / total) * 100;
    
    if (percentage < 60) {
      // Weak area
      if (!analytics.weakAreas.includes(subject)) {
        analytics.weakAreas.push(subject);
      }
      // Remove from strong areas if present
      analytics.strongAreas = analytics.strongAreas.filter(s => s !== subject);
    } else if (percentage > 80) {
      // Strong area
      if (!analytics.strongAreas.includes(subject)) {
        analytics.strongAreas.push(subject);
      }
      // Remove from weak areas if present
      analytics.weakAreas = analytics.weakAreas.filter(s => s !== subject);
    }
    
    this.saveAnalytics(analytics);
  }
  
  static trackStudyTime(minutes) {
    const analytics = this.getAnalytics();
    analytics.studyTime += minutes;
    analytics.lastActive = new Date().toISOString();
    this.saveAnalytics(analytics);
  }
  
  static getInsights() {
    const analytics = this.getAnalytics();
    
    const insights = {
      totalActivity: analytics.totalQuestions,
      studyHours: Math.round(analytics.studyTime / 60),
      topTopics: analytics.mostSearchedTopics.slice(0, 5),
      weakSubjects: analytics.weakAreas,
      strongSubjects: analytics.strongAreas,
      averageQuizScore: this.calculateAverageScore(analytics.quizScores),
      recentTrend: this.getScoreTrend(analytics.quizScores),
      recommendations: this.generateRecommendations(analytics)
    };
    
    return insights;
  }
  
  static generateRecommendations(analytics) {
    const recommendations = [];
    
    // Recommend studying weak areas
    if (analytics.weakAreas.length > 0) {
      recommendations.push({
        type: 'focus',
        title: 'Focus on Weak Areas',
        subjects: analytics.weakAreas,
        action: 'Create a study plan focusing on these subjects'
      });
    }
    
    // Recommend practice if quiz scores declining
    const trend = this.getScoreTrend(analytics.quizScores);
    if (trend === 'declining') {
      recommendations.push({
        type: 'practice',
        title: 'Practice More',
        message: 'Your quiz scores show a declining trend. Take more quizzes to improve.'
      });
    }
    
    // Recommend consistent study if gaps in activity
    const daysSinceLastActive = this.daysSince(analytics.lastActive);
    if (daysSinceLastActive > 3) {
      recommendations.push({
        type: 'consistency',
        title: 'Stay Consistent',
        message: `It's been ${daysSinceLastActive} days since your last study session. Consistent daily practice leads to better retention.`
      });
    }
    
    return recommendations;
  }
}
```

---

## 11. API Design & Schemas

### 11.1 API Endpoints

**Chat & Conversation:**
```
POST   /api/ai/chat              - Send message (non-streaming)
POST   /api/ai/chat/stream       - Send message (streaming SSE)
POST   /api/ai/regenerate        - Regenerate last response
POST   /api/ai/stop              - Stop generation
```

**File Processing:**
```
POST   /api/ai/upload            - Upload and process file
POST   /api/ai/analyze-image     - Analyze image with vision AI
```

**Study Tools:**
```
POST   /api/ai/generate-plan     - Generate study plan
POST   /api/ai/analyze-qp        - Analyze question paper
POST   /api/ai/generate-quiz     - Generate quiz questions
POST   /api/ai/evaluate-answer   - Evaluate quiz answer
```

**RAG & Knowledge:**
```
GET    /api/ai/search-resources  - Search VTU resources
POST   /api/ai/index-document    - Index new document
```

### 11.2 Request/Response Schemas

**Chat Request:**
```json
{
  "message": "string",
  "history": [
    {
      "role": "user|assistant",
      "content": "string",
      "timestamp": "ISO string"
    }
  ],
  "context": {
    "branch": "string",
    "scheme": "string",
    "semester": "number",
    "subject": "string"
  },
  "mode": "normal|exam|tutor|viva|quiz|research|code",
  "marks": "number (optional, for exam mode)",
  "files": ["file IDs from upload"]
}
```

**Chat Response:**
```json
{
  "response": "string",
  "metadata": {
    "model": "string",
    "tokens": "number",
    "sources": [
      {
        "title": "string",
        "subject": "string",
        "type": "notes|qp|model-answer",
        "url": "string",
        "relevance": "number"
      }
    ],
    "marks": "number (if exam mode)",
    "processingTime": "number (ms)"
  }
}
```

**Streaming SSE Events:**
```javascript
// Token event
data: {"type":"token","content":"word "}

// Completion event
data: {"type":"done","metadata":{...}}

// Error event
data: {"type":"error","message":"..."}
```

---

## 12. Frontend Component Architecture

### 12.1 Component Hierarchy

```
AIChatBot (Main Page)
├── ConversationSidebar
│   ├── ConversationList
│   ├── ConversationItem
│   └── SearchBar
├── ChatHeader
│   ├── ModeSelector
│   ├── ContextDisplay
│   └── ActionButtons
├── MessageList
│   ├── Message (User/Assistant)
│   │   ├── MessageContent
│   │   ├── SourceCitations
│   │   └── ActionButtons (Copy, Export, Regenerate, etc)
│   └── StreamingMessage
├── InputArea
│   ├── FileUploadButton
│   ├── VoiceInputButton
│   ├── TextInput
│   └── SendButton
└── Modals
    ├── StudyPlannerModal
    ├── QuizModal
    ├── AnalyticsModal
    └── SettingsModal
```

### 12.2 State Management

Use React Context + useReducer for global state:

```javascript
// contexts/AIContext.jsx

const AIContext = createContext();

const initialState = {
  conversations: [],
  activeConversationId: null,
  currentMode: 'normal',
  isStreaming: false,
  preferences: {},
  analytics: {},
  context: { branch: null, scheme: null, semester: null, subject: null }
};

function aiReducer(state, action) {
  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    case 'ADD_MESSAGE':
      // Add message to active conversation
      return { ...state, /* ... */ };
    case 'SET_MODE':
      return { ...state, currentMode: action.payload };
    // ... more actions
  }
}

export function AIProvider({ children }) {
  const [state, dispatch] = useReducer(aiReducer, initialState);
  
  // Load from localStorage on mount
  useEffect(() => {
    const saved = MemoryManager.getAllConversations();
    dispatch({ type: 'SET_CONVERSATIONS', payload: saved });
  }, []);
  
  return (
    <AIContext.Provider value={{ state, dispatch }}>
      {children}
    </AIContext.Provider>
  );
}
```

---

## 13. Database Design

### 13.1 MongoDB Collections

**Resources Collection** (Existing, enhanced for RAG):
```javascript
{
  _id: ObjectId,
  title: String,
  subject: ObjectId (ref),
  semester: Number,
  branch: ObjectId (ref),
  scheme: ObjectId (ref),
  resourceType: 'notes'|'qp'|'model-answer'|'textbook'|'handout',
  fileUrl: String,
  extractedText: String,  // NEW: Full text for search
  isIndexed: Boolean,     // NEW: Indexed in Pinecone?
  chunkCount: Number,     // NEW: Number of chunks created
  metadata: {
    author: String,
    year: Number,
    pages: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Question Papers Analysis** (NEW Collection):
```javascript
{
  _id: ObjectId,
  subject: ObjectId (ref),
  semester: Number,
  branch: ObjectId (ref),
  scheme: ObjectId (ref),
  year: Number,
  questions: [
    {
      module: Number,
      marks: Number,
      question: String,
      topic: String,
      difficulty: 'easy'|'medium'|'hard'
    }
  ],
  analysis: {
    moduleWeightage: { 1: 20, 2: 25, 3: 18, 4: 22, 5: 15 },
    topicFrequency: [{ topic: 'Normalization', count: 3 }],
    marksDistribution: { 2: 5, 5: 4, 10: 4, 16: 2 }
  },
  createdAt: Date
}
```

### 13.2 Pinecone Vector Database

**Index Structure:**
- Index name: `vtu-resources`
- Dimensions: 1536 (OpenAI text-embedding-3-small)
- Metric: cosine similarity
- Namespaces: `{branch}_{scheme}_{semester}`

**Vector Metadata:**
```json
{
  "docId": "mongodb_object_id",
  "docTitle": "DBMS Module 4 Notes",
  "subject": "DBMS",
  "subjectCode": "21CS53",
  "semester": 3,
  "branch": "CSE",
  "scheme": "2022",
  "type": "notes",
  "chunkIndex": 5,
  "url": "https://..."
}
```

---

## 14. Security & Privacy

### 14.1 Security Measures

**Input Validation:**
- Sanitize all user input before AI processing
- Limit message length (max 5000 characters)
- File size limits (25MB)
- File type validation

**API Security:**
- Rate limiting: 60 requests/minute per IP
- API key rotation policy
- HTTPS only
- CORS configuration
- Input sanitization on backend

**Data Privacy:**
- Zero backend storage of conversations
- No user tracking or analytics collection on server
- localStorage only for user data
- Uploaded files deleted after processing
- No cookies for tracking

**XSS Prevention:**
- Sanitize AI responses before rendering
- Use DOMPurify for markdown content
- CSP headers configured

### 14.2 Error Handling

**Graceful Degradation:**
- Model fallback chain
- Offline mode for viewing past conversations
- Queue messages if network down
- Show clear error messages

**User-Friendly Errors:**
- "Rate limit reached. Please wait 60 seconds."
- "Model temporarily unavailable. Trying alternate model..."
- "Network error. Message will be sent when connection restores."

---

## 15. Performance Optimization

### 15.1 Caching Strategy

**Response Caching:**
- Cache frequently asked questions in Redis
- TTL: 24 hours
- Invalidate on resource updates

**RAG Caching:**
- Cache embedding generation for common queries
- Cache top search results

**Frontend Caching:**
- Service Worker for offline support
- Cache conversation list
- Lazy load old conversations

### 15.2 Optimization Techniques

**Backend:**
- Connection pooling for MongoDB
- Batch embedding generation
- Async file processing with job queues
- CDN for static resources

**Frontend:**
- Code splitting (React.lazy)
- Virtual scrolling for long conversations
- Debounced search
- Memoized components
- Compressed localStorage data

---

## 16. Implementation Roadmap

### Phase 1: MVP (2-3 weeks)

**Week 1: Core Infrastructure**
- ✅ Multi-model router
- ✅ Basic streaming responses
- ✅ Context detection
- ✅ localStorage memory system
- ✅ Conversation management UI

**Week 2: RAG & Modes**
- ✅ RAG engine with Pinecone
- ✅ Document indexing pipeline
- ✅ Exam mode
- ✅ Tutor mode
- ✅ File upload (PDF, DOCX)

**Week 3: Polish & Testing**
- ✅ Error handling
- ✅ Performance optimization
- ✅ Testing & bug fixes
- ✅ Deployment

### Phase 2: Advanced Features (3-4 weeks)

**Week 4-5:**
- Vision AI (image understanding)
- Voice AI (speech-to-text, text-to-speech)
- Quiz mode
- Mock viva mode

**Week 6-7:**
- Study planner
- Question paper intelligence
- Analytics dashboard
- Research mode

### Phase 3: Polish & Scale (2 weeks)

**Week 8-9:**
- Advanced caching
- Cost optimization
- UI/UX refinements
- Performance tuning
- Comprehensive testing

---

## 17. Cost Estimation

### 17.1 AI Model Costs (per 1000 users/month)

**Assumptions:**
- Average 50 questions per user/month
- Average 500 tokens input, 800 tokens output per question

**Cost Breakdown:**
```
Model Distribution:
- 40% Groq Llama (Free) → $0
- 30% Gemini Flash ($0.10/$0.40 per 1M tokens) → $300
- 20% GPT-4o ($2.50/$10 per 1M tokens) → $2,000
- 10% Claude 3.5 ($3/$15 per 1M tokens) → $1,500

Total AI Costs: ~$3,800/month for 1000 users
Cost per user: ~$3.80/month
```

**Pinecone:**
- Standard plan: $70/month (100k vectors)
- Scales with resources indexed

**Infrastructure:**
- VPS/Cloud: $50-100/month
- MongoDB Atlas: $50/month (M10 cluster)
- Redis: $20/month

**Total estimated cost: $4,000-4,500/month for 1000 active users**
**$4-4.5 per user/month**

### 17.2 Cost Optimization Strategies

1. **Smart Model Routing:** Use free/cheap models for simple queries
2. **Response Caching:** Avoid duplicate API calls
3. **Prompt Optimization:** Reduce token usage
4. **Batch Processing:** Generate embeddings in batches
5. **Context Window Management:** Only send necessary history

---

## Conclusion

This technical design provides a comprehensive blueprint for building a next-generation AI learning assistant that rivals ChatGPT in capabilities while being specifically optimized for VTU students. The architecture emphasizes:

- **Anonymous-first:** No login, localStorage-based persistence
- **AI Intelligence:** Multi-model routing, RAG, specialized modes
- **Production-ready:** Scalable, secure, performant
- **Cost-effective:** Smart model selection, caching
- **VTU-optimized:** Context-aware, syllabus-aligned

Next step: Begin implementation following the roadmap, starting with Phase 1 MVP.

---

**Document Status:** Ready for Development ✅  
**Approved By:** [Awaiting Approval]  
**Start Date:** [TBD]
