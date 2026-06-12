/**
 * Legacy AI Service - Only QP Analysis (will be moved to dedicated service later)
 */

const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

async function analyzeQuestionPaper(text, examDetails = {}) {
  try {
    if (!GROQ_API_KEY) {
      return {
        success: false,
        message: 'AI service not configured'
      };
    }

    const prompt = `Analyze this VTU question paper and extract important information:

${text.substring(0, 2000)} ${text.length > 2000 ? '...(truncated)' : ''}

Exam Details: ${JSON.stringify(examDetails)}

Please provide:
1. Important Topics: List main topics (comma-separated)
2. Question Types: Types of questions
3. Difficulty Level: Easy/Medium/Hard
4. Repeated Topics: Topics appearing multiple times
5. Study Recommendations: Top 5 focus areas

Provide a clear, structured analysis.`;

    const response = await axios.post(GROQ_API_URL, {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a VTU exam paper analyzer with deep knowledge of VTU examination patterns.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 2048
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    const analysisText = response.data.choices[0]?.message?.content || 'Analysis completed.';

    return {
      success: true,
      analysis: {
        summary: analysisText,
        topics: [],
        questionTypes: [],
        difficulty: 'Medium',
        repeatedTopics: [],
        recommendations: []
      }
    };

  } catch (error) {
    console.error('Question Paper Analysis Error:', error);
    console.error('Error details:', error.response?.data || error.message);
    return {
      success: false,
      message: 'Failed to analyze question paper. Please try again.'
    };
  }
}

module.exports = {
  analyzeQuestionPaper
};
