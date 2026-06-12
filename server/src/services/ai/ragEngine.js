/**
 * RAG Engine - Retrieval Augmented Generation for VTU Resources
 * Provides semantic search across VTU study materials with source citations
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Resource = require('../../models/Resource');

class RAGEngine {
  constructor() {
    this.google = process.env.GOOGLE_API_KEY 
      ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
      : null;
    
    this.embeddingModel = this.google?.getGenerativeModel({ 
      model: 'embedding-001' 
    });
    
    this.chunkSize = 800; // Tokens per chunk
    this.chunkOverlap = 100; // Overlap to preserve context
    this.topK = 5; // Number of results to retrieve
  }

  /**
   * Search for relevant VTU resources
   */
  async search(query, filters = {}) {
    try {
      if (!this.embeddingModel) {
        console.warn('⚠️ RAG disabled: GOOGLE_API_KEY not configured');
        return null;
      }

      console.log('🔍 RAG Search:', { query: query.substring(0, 50), filters });

      // 1. Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);
      
      // 2. Perform hybrid search (semantic + keyword)
      const semanticResults = await this.semanticSearch(queryEmbedding, filters);
      const keywordResults = await this.keywordSearch(query, filters);
      
      // 3. Combine and re-rank results
      const combinedResults = this.hybridRerank(semanticResults, keywordResults);
      
      // 4. Format for AI context
      const context = this.formatContext(combinedResults.slice(0, this.topK));
      
      console.log('✅ RAG found', combinedResults.length, 'relevant resources');
      
      return context;

    } catch (error) {
      console.error('❌ RAG search error:', error);
      return null;
    }
  }

  /**
   * Generate embedding for text using Gemini
   */
  async generateEmbedding(text) {
    try {
      const result = await this.embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('❌ Embedding generation error:', error);
      throw error;
    }
  }

  /**
   * Semantic search using text similarity
   * For now, use keyword matching as fallback until vector search is set up
   */
  async semanticSearch(queryEmbedding, filters) {
    try {
      // Build MongoDB query
      const query = this.buildMongoQuery(filters);
      
      // Get resources
      const resources = await Resource.find(query)
        .select('title description content subject semester branch scheme resourceType url')
        .limit(20)
        .lean();

      // Generate embeddings for resources and calculate similarity
      const resultsWithScores = await Promise.all(
        resources.map(async (resource) => {
          const text = this.extractResourceText(resource);
          
          // Calculate simple text overlap score (0-1)
          const score = this.calculateTextSimilarity(text, queryEmbedding);
          
          return {
            resource,
            score,
            text: text.substring(0, 500) // Preview
          };
        })
      );

      // Sort by score
      return resultsWithScores
        .filter(r => r.score > 0.1) // Minimum relevance threshold
        .sort((a, b) => b.score - a.score);

    } catch (error) {
      console.error('❌ Semantic search error:', error);
      return [];
    }
  }

  /**
   * Keyword search using MongoDB text index
   */
  async keywordSearch(query, filters) {
    try {
      const mongoQuery = this.buildMongoQuery(filters);
      
      // Add text search
      mongoQuery.$text = { $search: query };

      const resources = await Resource.find(mongoQuery)
        .select('title description content subject semester branch scheme resourceType url score')
        .limit(10)
        .lean();

      return resources.map(resource => ({
        resource,
        score: resource.score || 0.5,
        text: this.extractResourceText(resource).substring(0, 500)
      }));

    } catch (error) {
      console.error('❌ Keyword search error:', error);
      return [];
    }
  }

  /**
   * Build MongoDB query from filters
   */
  buildMongoQuery(filters) {
    const query = { status: 'active' };

    if (filters.branch) {
      query.branch = filters.branch;
    }

    if (filters.scheme) {
      query.scheme = filters.scheme;
    }

    if (filters.semester) {
      query.semester = filters.semester;
    }

    if (filters.subject) {
      query.subject = filters.subject;
    }

    if (filters.resourceType) {
      query.resourceType = filters.resourceType;
    }

    return query;
  }

  /**
   * Extract searchable text from resource
   */
  extractResourceText(resource) {
    const parts = [
      resource.title || '',
      resource.description || '',
      resource.content || ''
    ];

    return parts.filter(Boolean).join(' ');
  }

  /**
   * Calculate text similarity (simple version)
   * In production, this would use actual vector cosine similarity
   */
  calculateTextSimilarity(text, queryEmbedding) {
    // For now, return a basic score
    // TODO: Implement proper cosine similarity with embeddings
    return 0.5;
  }

  /**
   * Hybrid re-ranking: Combine semantic and keyword results
   */
  hybridRerank(semanticResults, keywordResults) {
    const combined = new Map();

    // Add semantic results with 70% weight
    semanticResults.forEach(result => {
      const id = result.resource._id.toString();
      combined.set(id, {
        ...result,
        hybridScore: result.score * 0.7
      });
    });

    // Add keyword results with 30% weight
    keywordResults.forEach(result => {
      const id = result.resource._id.toString();
      
      if (combined.has(id)) {
        // Boost existing result
        const existing = combined.get(id);
        existing.hybridScore += result.score * 0.3;
      } else {
        // Add new result
        combined.set(id, {
          ...result,
          hybridScore: result.score * 0.3
        });
      }
    });

    // Convert to array and sort by hybrid score
    return Array.from(combined.values())
      .sort((a, b) => b.hybridScore - a.hybridScore);
  }

  /**
   * Format search results for AI context
   */
  formatContext(results) {
    if (!results || results.length === 0) {
      return null;
    }

    let contextText = "\n\n--- RELEVANT VTU RESOURCES ---\n\n";
    const sources = [];

    results.forEach((result, idx) => {
      const resource = result.resource;
      
      contextText += `[SOURCE ${idx + 1}] ${resource.title}\n`;
      contextText += `Type: ${resource.resourceType || 'Resource'}\n`;
      
      if (resource.subject) {
        contextText += `Subject: ${resource.subject}\n`;
      }
      
      if (resource.semester) {
        contextText += `Semester: ${resource.semester}\n`;
      }
      
      contextText += `Content Preview:\n${result.text}\n`;
      contextText += `---\n\n`;

      sources.push({
        id: resource._id,
        title: resource.title,
        subject: resource.subject,
        semester: resource.semester,
        branch: resource.branch,
        type: resource.resourceType,
        url: resource.url,
        relevance: result.hybridScore
      });
    });

    contextText += "Use the above sources to provide accurate answers. Always cite sources [SOURCE N] when using information from them.\n";
    contextText += "--- END VTU RESOURCES ---\n\n";

    return {
      contextText,
      sources
    };
  }

  /**
   * Split text into chunks for indexing
   */
  splitIntoChunks(text, options = {}) {
    const chunkSize = options.chunkSize || this.chunkSize;
    const overlap = options.overlap || this.chunkOverlap;
    
    // Split by sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    const chunks = [];
    let currentChunk = '';
    let currentTokens = 0;

    for (const sentence of sentences) {
      const sentenceTokens = this.estimateTokens(sentence);
      
      if (currentTokens + sentenceTokens > chunkSize && currentChunk) {
        // Save current chunk
        chunks.push(currentChunk.trim());
        
        // Start new chunk with overlap
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.floor(overlap / 4));
        currentChunk = overlapWords.join(' ') + ' ' + sentence;
        currentTokens = this.estimateTokens(currentChunk);
      } else {
        currentChunk += ' ' + sentence;
        currentTokens += sentenceTokens;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Estimate token count (rough approximation: 1 token ≈ 4 characters)
   */
  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }
}

module.exports = RAGEngine;
