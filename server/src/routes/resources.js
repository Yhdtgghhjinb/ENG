const express  = require('express');
const Resource = require('../models/Resource');

const router = express.Router();

// ============================================
// SIMPLE IN-MEMORY CACHE
// ============================================
const cache = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const MAX_CACHE_SIZE = 100;

// Cache middleware
function cacheMiddleware(ttl = CACHE_TTL) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = req.originalUrl;
    const cached = cache.get(cacheKey);

    // Return cached response if still valid
    if (cached && Date.now() - cached.timestamp < ttl) {
      // Track cache hit
      if (req.performanceMarks) {
        req.performanceMarks.cacheHits++;
      }
      console.log(`💾 CACHE HIT: ${req.originalUrl}`);
      return res.json(cached.data);
    }
    
    // Track cache miss
    if (req.performanceMarks) {
      req.performanceMarks.cacheMisses++;
    }
    if (cached) {
      console.log(`⏰ CACHE EXPIRED: ${req.originalUrl}`);
    } else {
      console.log(`❌ CACHE MISS: ${req.originalUrl}`);
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      // Implement LRU: remove oldest entry if at capacity
      if (cache.size >= MAX_CACHE_SIZE) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
        console.log(`🗑️ CACHE EVICTION: ${firstKey}`);
      }

      // Store in cache
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      console.log(`✅ CACHE STORED: ${req.originalUrl} (${cache.size}/${MAX_CACHE_SIZE})`);

      return originalJson(data);
    };

    next();
  };
}

// Clear cache utility (can be called from admin routes)
function clearCache() {
  cache.clear();
  return { success: true, message: 'Cache cleared' };
}

// GET /api/resources — list with optional filters + keyword search + PAGINATION
// Cached for 2 minutes to reduce database load
router.get('/', cacheMiddleware(2 * 60 * 1000), async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const { scheme, branch, year, semester, subject, type, q, page = 1, limit = 20 } = req.query;
    const query = {};

    // Parse pagination params
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Validate pagination params
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ 
        error: 'Invalid pagination parameters',
        message: 'page must be >= 1, limit must be between 1 and 100'
      });
    }

    // Build filter query
    if (scheme)   query.scheme   = scheme;
    if (branch)   query.branch   = branch;
    if (year)     query.year     = Number(year);
    if (semester) query.semester = Number(semester);
    if (subject)  query.subject  = subject;
    if (type)     query.type     = type;
    if (q) {
      query.$or = [
        { title:       { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { subject:     { $regex: q, $options: 'i' } },
        { scheme:      { $regex: q, $options: 'i' } },
        { branch:      { $regex: q, $options: 'i' } },
        { tags:        { $in: [new RegExp(q, 'i')] } },
      ];
    }

    // Execute query with pagination and count in parallel
    const dbStart = Date.now();
    const [resources, total] = await Promise.all([
      Resource.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(), // Use lean() for better performance (returns plain objects)
      Resource.countDocuments(query)
    ]);
    const dbDuration = Date.now() - dbStart;
    
    // Track performance
    if (req.performanceMarks) {
      req.performanceMarks.dbQueries.push({ 
        operation: 'resources.list', 
        duration: dbDuration,
        resultCount: resources.length
      });
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;
    
    const totalDuration = Date.now() - startTime;
    
    // Log performance metrics
    console.log(`📊 GET /api/resources - Total: ${totalDuration}ms, DB: ${dbDuration}ms, Results: ${resources.length}/${total}`);

    res.json({
      resources,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/resources/search — MongoDB TEXT SEARCH with PAGINATION
router.get('/search', async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const { query, scheme, branch, year, semester, subject, type, page = 1, limit = 20 } = req.query;
    const q = String(query || '').trim();

    if (!q) {
      return res.status(400).json({ success: false, message: 'query is required' });
    }

    // Parse pagination params
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Validate pagination params
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid pagination parameters',
        message: 'page must be >= 1, limit must be between 1 and 100'
      });
    }

    // Build filter query
    const queryObj = {};
    if (scheme)   queryObj.scheme   = scheme;
    if (branch)   queryObj.branch   = branch;
    if (year)     queryObj.year     = Number(year);
    if (semester) queryObj.semester = Number(semester);
    if (subject)  queryObj.subject  = subject;
    if (type)     queryObj.type     = type;

    // Use MongoDB text search instead of regex (10-50× faster)
    queryObj.$text = { $search: q };

    // Execute query with text search, pagination, and count in parallel
    const dbStart = Date.now();
    const [resources, total] = await Promise.all([
      Resource.find(queryObj, { 
        score: { $meta: 'textScore' } // Include text search score
      })
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 }) // Sort by relevance, then date
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Resource.countDocuments(queryObj)
    ]);
    const dbDuration = Date.now() - dbStart;
    
    // Track performance
    if (req.performanceMarks) {
      req.performanceMarks.dbQueries.push({ 
        operation: 'resources.textSearch', 
        duration: dbDuration,
        query: q,
        resultCount: resources.length
      });
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limitNum);
    
    const totalDuration = Date.now() - startTime;
    
    // Log performance metrics
    console.log(`🔍 GET /api/resources/search - Total: ${totalDuration}ms, DB: ${dbDuration}ms, Query: "${q}", Results: ${resources.length}/${total}`);

    return res.json({ 
      success: true, 
      mode: 'text-search', 
      query: q, 
      resources,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    // Fallback to regex if text index not available
    if (err.code === 27 || err.message.includes('text index')) {
      console.warn('⚠️ Text index not found, falling back to regex search');
      return fallbackRegexSearch(req, res, next);
    }
    next(err);
  }
});

// Fallback regex search (used if text index doesn't exist yet)
async function fallbackRegexSearch(req, res, next) {
  try {
    const { query, scheme, branch, year, semester, subject, type, page = 1, limit = 20 } = req.query;
    const q = String(query || '').trim();

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const queryObj = {};
    if (scheme)   queryObj.scheme   = scheme;
    if (branch)   queryObj.branch   = branch;
    if (year)     queryObj.year     = Number(year);
    if (semester) queryObj.semester = Number(semester);
    if (subject)  queryObj.subject  = subject;
    if (type)     queryObj.type     = type;

    // Fallback to regex (slower)
    queryObj.$or = [
      { title:       { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { subjectName: { $regex: q, $options: 'i' } },
      { tags:        { $in: [new RegExp(q, 'i')] } },
    ];

    const [resources, total] = await Promise.all([
      Resource.find(queryObj)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Resource.countDocuments(queryObj)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.json({ 
      success: true, 
      mode: 'regex-fallback', 
      query: q, 
      resources,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/resources/facets — Optimized with aggregation pipeline
// Cached for 5 minutes (facets change less frequently)
router.get('/facets', cacheMiddleware(5 * 60 * 1000), async (req, res, next) => {
  try {
    const { scheme, branch, year, semester } = req.query;
    const baseFilter = {};
    if (scheme)   baseFilter.scheme   = scheme;
    if (branch)   baseFilter.branch   = branch;
    if (year)     baseFilter.year     = Number(year);
    if (semester) baseFilter.semester = Number(semester);

    // Use single aggregation pipeline instead of 6 separate distinct queries
    // This reduces database round trips from 6 to 1 (3-4× faster)
    const facetsResult = await Resource.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: null,
          schemes: { $addToSet: '$scheme' },
          branches: { $addToSet: '$branch' },
          years: { $addToSet: '$year' },
          semesters: { $addToSet: '$semester' },
          subjects: { $addToSet: '$subject' },
          types: { $addToSet: '$type' }
        }
      }
    ]);

    // Extract results or return empty arrays if no documents match
    const facets = facetsResult[0] || {
      schemes: [],
      branches: [],
      years: [],
      semesters: [],
      subjects: [],
      types: []
    };

    // Sort years and semesters numerically
    facets.years = (facets.years || []).sort((a, b) => a - b);
    facets.semesters = (facets.semesters || []).sort((a, b) => a - b);

    res.json(facets);
  } catch (err) {
    next(err);
  }
});

// Export cache utilities for admin use
router.clearCache = clearCache;

module.exports = router;
