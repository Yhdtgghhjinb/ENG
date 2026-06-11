const express = require('express');
const router = express.Router();
const { getChatResponse, analyzeQuestionPaper } = require('../services/aiService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

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

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await getChatResponse(message, history || []);

    if (result.success) {
      res.json({ response: result.response });
    } else {
      res.status(500).json({ error: result.response });
    }
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Failed to process message' });
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

    const result = await getChatResponse(prompt, []);

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

module.exports = router;
