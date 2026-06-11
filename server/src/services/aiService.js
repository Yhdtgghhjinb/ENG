const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI (free tier available)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are a helpful VTU (Visvesvaraya Technological University) study assistant. Your role is to:

1. Help students understand concepts, topics, and subjects
2. Provide study tips and exam preparation strategies
3. Recommend learning resources and study materials
4. Answer questions about VTU curriculum, syllabus, and academic matters
5. Explain technical concepts in simple, easy-to-understand language

Guidelines:
- Be friendly, encouraging, and supportive
- Keep responses concise but informative (2-3 paragraphs max)
- Use emojis occasionally to make responses engaging
- If you don't know something, admit it honestly
- For programming/technical questions, provide code examples when helpful
- Focus on VTU-specific context when relevant

Remember: You're helping students succeed in their VTU education!`;

async function getChatResponse(userMessage, conversationHistory = []) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        response: '⚠️ AI service is not configured. Please add GEMINI_API_KEY to environment variables.\n\nYou can get a free API key from: https://makersuite.google.com/app/apikey'
      };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build conversation context
    let prompt = SYSTEM_PROMPT + '\n\nConversation:\n';
    
    // Add recent history (last 5 exchanges)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      if (msg.role === 'user') {
        prompt += `Student: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Assistant: ${msg.content}\n`;
      }
    });

    // Add current message
    prompt += `Student: ${userMessage}\nAssistant:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return {
      success: true,
      response: text.trim()
    };

  } catch (error) {
    console.error('AI Service Error:', error);
    
    // Handle specific errors
    if (error.message?.includes('API_KEY')) {
      return {
        success: false,
        response: '⚠️ Invalid API key. Please check your GEMINI_API_KEY configuration.'
      };
    }

    return {
      success: false,
      response: '❌ Sorry, I\'m having trouble processing your request. Please try again in a moment.'
    };
  }
}

async function analyzeQuestionPaper(text, examDetails = {}) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        message: 'AI service not configured'
      };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze this VTU question paper and extract important information:

${text}

Exam Details: ${JSON.stringify(examDetails)}

Please provide:
1. **Important Topics**: List the main topics covered (as a comma-separated list)
2. **Question Types**: Types of questions (MCQ, descriptive, numerical, etc.)
3. **Difficulty Level**: Overall difficulty (Easy/Medium/Hard)
4. **Repeated Questions**: Any topics that appear multiple times
5. **Study Recommendations**: Top 5 topics students should focus on

Format your response as JSON with keys: topics, questionTypes, difficulty, repeatedTopics, recommendations`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Try to parse JSON response
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          analysis
        };
      }
    } catch (e) {
      // If JSON parsing fails, return raw text
      return {
        success: true,
        analysis: {
          summary: responseText,
          topics: [],
          questionTypes: [],
          difficulty: 'Medium',
          repeatedTopics: [],
          recommendations: []
        }
      };
    }

  } catch (error) {
    console.error('Question Paper Analysis Error:', error);
    return {
      success: false,
      message: 'Failed to analyze question paper'
    };
  }
}

module.exports = {
  getChatResponse,
  analyzeQuestionPaper
};
