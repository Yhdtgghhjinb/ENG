// Using Groq API - 100% FREE and FAST
const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// Enhanced VTU-specific system prompt - ADVANCED AI
const SYSTEM_PROMPT = `You are an ELITE VTU (Visvesvaraya Technological University) AI Professor with PhD-level expertise. You are THE BEST exam preparation AI ever created, comparable to Claude Sonnet 4 and GPT-4.

**YOUR SUPREME CAPABILITIES:**
- 30+ years as VTU Chief Examiner
- Perfect knowledge of ALL VTU engineering subjects
- Deep reasoning and step-by-step problem solving
- Ability to explain complex concepts simply
- Advanced understanding of what gets maximum marks

**MISSION:** Provide PERFECT, EXAM-READY answers that guarantee FULL MARKS.

## MARK-BASED PRECISION:

**2 MARKS (70-90 words):** Definition + 1 key point + Brief example
**5 MARKS (220-260 words):** Definition + 5 explained points + Example + Conclusion
**10 MARKS (550-650 words):** Complete explanation + Multiple examples + Diagrams + Applications
**16 MARKS (1100-1300 words):** Textbook-level depth + Code/algorithms + Multiple perspectives

## ADVANCED ANSWER STRUCTURE:

1. **Perfect Definition** (textbook-exact)
2. **Structured Explanation** (numbered points)
3. **Multiple Examples** (real-world + VTU-specific)
4. **Diagrams/Code** (when relevant)
5. **Critical Analysis** (advantages/disadvantages)
6. **Applications** (where used in practice)
7. **Exam Tips** (how to write for maximum marks)

## SUBJECT EXPERTISE:
- **DSA:** Algorithm + Code (C) + Complexity + Comparison
- **OS:** Silberschatz approach + Process diagrams + Real OS examples
- **DBMS:** SQL + ER diagrams + Normalization steps + ACID
- **Networks:** OSI/TCP-IP layers + Protocols + RFC numbers
- **COA:** Instruction formats + Pipeline + Cache mapping
- **TOC:** Formal definitions + State diagrams + Proofs
- **SE:** SDLC + UML diagrams + Testing levels
- **Programming:** Working code + Comments + Test cases + Complexity

## QUALITY STANDARDS:
✅ 100% technically accurate | ✅ Textbook definitions | ✅ Perfect structure | ✅ Rich examples | ✅ Proper length | ✅ Exam tips

Be precise. Be comprehensive. Be exam-focused. Make every answer a MASTERPIECE that gets FULL MARKS!`;

async function getChatResponse(userMessage, conversationHistory = []) {
  try {
    console.log('=== AI Service Called ===');
    console.log('Message:', userMessage.substring(0, 100));
    console.log('API Key present:', !!GROQ_API_KEY);
    console.log('API Key length:', GROQ_API_KEY ? GROQ_API_KEY.length : 0);
    
    // Check if API key is configured
    if (!GROQ_API_KEY) {
      console.log('ERROR: No API key found');
      return {
        success: false,
        response: '⚠️ AI service is not configured. Please add GROQ_API_KEY to environment variables.\n\n✅ Get a FREE API key from Groq:\n1. Visit: https://console.groq.com/keys\n2. Sign up (free forever)\n3. Create a new API key\n4. Add to Railway environment variables\n\n100% Free - No credit card required - Super fast responses!'
      };
    }

    // Detect if question mentions marks
    const marksMatch = userMessage.match(/(\d+)\s*marks?/i);
    const marks = marksMatch ? parseInt(marksMatch[1]) : null;
    console.log('Detected marks:', marks);

    // Build messages array for Groq
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      }
    ];

    // Add conversation history (last 4 exchanges)
    const recentHistory = conversationHistory.slice(-8);
    recentHistory.forEach(msg => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    });

    // Add current user message with marks reminder if applicable
    let userContent = userMessage;
    if (marks) {
      userContent += `\n\n[IMPORTANT: This is a ${marks}-mark VTU exam question. Provide a complete answer in VTU exam format with appropriate length.]`;
    }

    messages.push({
      role: 'user',
      content: userContent
    });

    console.log('Calling Groq API...');
    
    // Call Groq API with MAXIMUM POWER
    const response = await axios.post(GROQ_API_URL, {
      model: 'llama-3.3-70b-versatile', // 70B params - GPT-4 level
      messages: messages,
      temperature: 0.5, // Balanced for accuracy
      max_tokens: 8192, // MAXIMUM output length
      top_p: 0.9,
      frequency_penalty: 0.2,
      presence_penalty: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000 // 30 second timeout
    });

    console.log('Groq API response received');
    console.log('Status:', response.status);

    const text = response.data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    console.log('Response length:', text.length);

    return {
      success: true,
      response: text.trim(),
      marks: marks
    };

  } catch (error) {
    console.error('=== AI Service Error ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Handle axios errors
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      if (status === 401 || status === 403) {
        return {
          success: false,
          response: '⚠️ Invalid or missing API key.\n\n✅ Groq is 100% FREE forever!\n\nGet your free key:\n1. Visit: https://console.groq.com/keys\n2. Sign up with email (no credit card)\n3. Create a new API key\n4. Add to Railway environment: GROQ_API_KEY\n\nSuper fast - Perfect for students!'
        };
      }
      
      if (status === 429) {
        return {
          success: false,
          response: '⏳ Rate limit reached. Please wait a moment and try again.\n\nGroq free tier has generous limits. Try again in a few seconds.'
        };
      }
      
      if (status === 400) {
        return {
          success: false,
          response: '⚠️ Bad request to AI service.\n\nError: ' + (errorData.error?.message || 'Invalid request format')
        };
      }
    }
    
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return {
        success: false,
        response: '⏳ Request timed out. The AI service is taking too long to respond.\n\nPlease try again with a shorter question.'
      };
    }

    return {
      success: false,
      response: '❌ Sorry, I encountered an error connecting to the AI service.\n\nError: ' + error.message + '\n\nPlease try again in a moment.'
    };
  }
}

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
      model: 'llama-3.3-70b-versatile', // Better model for analysis
      messages: [
        { role: 'system', content: 'You are a VTU exam paper analyzer with deep knowledge of VTU examination patterns.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4, // Lower for more analytical responses
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
  getChatResponse,
  analyzeQuestionPaper
};
