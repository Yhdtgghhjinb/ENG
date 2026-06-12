const express = require('express');
const router = express.Router();
const ConversationEngine = require('../services/ai/conversationEngine');
const StreamingService = require('../services/ai/streamingService');
const ContextDetector = require('../utils/contextDetector');
const { analyzeQuestionPaper } = require('../services/aiService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Initialize services
const conversationEngine = new ConversationEngine();
const streamingService = new StreamingService();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/question-papers');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'qp-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and text files are allowed!'));
    }
  }
});

// Chat endpoint (Enhanced with multi-model routing)
router.post('/chat', async (req, res) => {
  try {
    const { message, history, context, mode = 'normal', marks, files = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('💬 Chat request:', { 
      messageLength: message.length, 
      historyCount: history?.length || 0,
      mode,
      marks,
      hasContext: !!context?.subject
    });

    // Detect context from referer URL if not provided
    let detectedContext = context || {};
    if (!detectedContext.branch && req.headers.referer) {
      const urlContext = ContextDetector.detectFromURL(req.headers.referer);
      detectedContext = ContextDetector.mergeContext(urlContext, context, {});
    }

    // Generate response using conversation engine
    const result = await conversationEngine.generateResponse({
      message,
      history: history || [],
      context: detectedContext,
      mode,
      marks,
      files
    });

    console.log('✅ Response generated:', { 
      success: result.success, 
      model: result.model,
      tokens: result.tokens
    });

    if (result.success) {
      res.json({ 
        response: result.response,
        marks: result.marks,
        metadata: {
          model: result.model,
          tokens: result.tokens,
          mode: mode
        }
      });
    } else {
      // Return the error message as the response
      res.json({ 
        response: result.response,
        marks: null,
        metadata: {
          model: null,
          tokens: 0,
          mode: mode
        }
      });
    }
  } catch (error) {
    console.error('❌ Chat API Error:', error);
    console.error('Stack:', error.stack);
    res.json({ 
      response: '❌ Sorry, an unexpected error occurred. Please try again.\n\nError: ' + error.message,
      marks: null,
      metadata: {
        model: null,
        tokens: 0
      }
    });
  }
});

// Streaming chat endpoint (SSE)
router.post('/chat/stream', async (req, res) => {
  try {
    const { message, history, context, mode = 'normal', marks } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🌊 Streaming request:', { 
      messageLength: message.length, 
      mode,
      marks
    });

    // Detect context from referer URL if not provided
    let detectedContext = context || {};
    if (!detectedContext.branch && req.headers.referer) {
      const urlContext = ContextDetector.detectFromURL(req.headers.referer);
      detectedContext = ContextDetector.mergeContext(urlContext, context, {});
    }

    // Stream response
    await streamingService.streamResponse(res, {
      message,
      history: history || [],
      context: detectedContext,
      mode,
      marks
    });

  } catch (error) {
    console.error('❌ Streaming API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Streaming failed' });
    }
  }
});

// Question paper analysis endpoint
router.post('/analyze-paper', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { subject, semester, year } = req.body;
    const examDetails = { subject, semester, year };

    // For now, we'll just return the file info
    // In a real implementation, you'd use OCR for images/PDFs
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    if (fileExtension === '.txt') {
      // Read text file
      const text = await fs.readFile(req.file.path, 'utf-8');
      const result = await analyzeQuestionPaper(text, examDetails);

      if (result.success) {
        res.json({
          success: true,
          filename: req.file.originalname,
          analysis: result.analysis
        });
      } else {
        res.status(500).json({ error: result.message });
      }
    } else {
      // For images/PDFs, return placeholder response
      // In production, integrate with Google Vision API or similar for OCR
      res.json({
        success: true,
        filename: req.file.originalname,
        message: 'File uploaded successfully. OCR processing for images/PDFs will be available soon.',
        analysis: {
          topics: ['Upload a .txt file for detailed analysis'],
          questionTypes: ['Various'],
          difficulty: 'Medium',
          repeatedTopics: [],
          recommendations: [
            'For best results, upload question papers as text files',
            'Image/PDF OCR support coming soon',
            'You can manually copy-paste question paper text'
          ]
        }
      });
    }

    // Clean up file after processing
    await fs.unlink(req.file.path).catch(() => {});

  } catch (error) {
    console.error('Analyze Paper Error:', error);
    res.status(500).json({ error: 'Failed to analyze question paper' });
  }
});

// Get AI suggestions for a subject
router.post('/suggest-resources', async (req, res) => {
  try {
    const { subject, topic } = req.body;

    const prompt = `Suggest study resources and tips for VTU students learning ${subject}${topic ? ` - specifically ${topic}` : ''}`;

    const result = await conversationEngine.generateResponse({
      message: prompt,
      history: [],
      context: {},
      mode: 'normal'
    });

    if (result.success) {
      res.json({ suggestions: result.response });
    } else {
      res.status(500).json({ error: result.response });
    }
  } catch (error) {
    console.error('Suggest Resources Error:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

// Get available modes
router.get('/modes', (req, res) => {
  const ModeController = require('../services/ai/modeController');
  const modes = ModeController.getAllModes();
  res.json({ modes });
});

module.exports = router;
