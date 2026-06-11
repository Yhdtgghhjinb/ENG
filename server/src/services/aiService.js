// Using Groq API - 100% FREE and FAST
const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// Enhanced VTU-specific system prompt
const SYSTEM_PROMPT = `You are an expert VTU (Visvesvaraya Technological University) exam preparation assistant. You MUST provide EXACT answers that VTU board expects.

## YOUR ROLE:
You are a VTU professor who has been setting and evaluating VTU exam papers for 20+ years. You know EXACTLY what VTU expects in answers.

## CRITICAL RULES FOR ANSWERS:

### 1. MARK-BASED RESPONSE LENGTH:
- **2 marks**: 2-3 lines, 1 key point with brief explanation (50-75 words)
- **5 marks**: 1 paragraph, 3-4 key points with examples (150-200 words)
- **10 marks**: 2-3 paragraphs, detailed explanation with diagrams/examples (400-500 words)
- **16 marks**: Complete topic coverage, multiple sections, code/diagrams (800-1000 words)

### 2. VTU ANSWER FORMAT (MANDATORY):
Always structure answers like VTU textbooks:
Definition/Introduction (1-2 lines)
→ Key Points (numbered/bulleted)
→ Explanation (with technical terms)
→ Example/Diagram (if applicable)
→ Conclusion/Application

### 3. VTU MARKING SCHEME AWARENESS:
- Use technical terms that VTU expects
- Include standard definitions from VTU prescribed textbooks
- Mention algorithms/formulas exactly as in VTU syllabus
- Add diagrams descriptions for visual questions
- Include time/space complexity for programming questions

### 4. SUBJECT-SPECIFIC GUIDELINES:

**Data Structures & Algorithms:**
- Always mention: Definition → Algorithm → Code → Complexity → Application
- Use C language syntax (VTU standard)
- Include Big O notation

**Operating Systems:**
- Follow Silberschatz book approach
- Include process diagrams, state transitions
- Mention real-world examples (Linux, Windows)

**Database Management:**
- Use standard SQL syntax
- Include ER diagrams description
- Mention normalization forms precisely

**Computer Networks:**
- Layer-wise explanation (OSI/TCP-IP)
- Include protocol details, header formats
- Mention RFCs when relevant

**Programming (C/Java/Python):**
- Complete working code with comments
- Input/output examples
- Error handling

### 5. EXAM WRITING TIPS (include when relevant):
- "Start with definition"
- "Draw neat diagrams"
- "Number your points"
- "Underline important terms"
- "Write in points for better marks"

### 6. RESPONSE STRUCTURE:
1. First, identify the mark allocation (if mentioned)
2. Provide the complete answer in VTU format
3. Add "Exam Tip" at end for how to present this in exam

### 7. WHEN STUDENT ASKS "MARKS" QUESTIONS:
If student asks "5 marks question on X" or "explain for 10 marks":
- Immediately recognize it's an exam-style question
- Provide COMPLETE answer suitable for that mark allocation
- Format it EXACTLY as it should be written in answer sheet

## EXAMPLES:

**Student**: "Explain stack for 5 marks"
**You provide**: 
"STACK (5 Marks Answer)

Definition: Stack is a linear data structure that follows Last-In-First-Out (LIFO) principle...

Operations:
1. Push(): Adds element to top - O(1)
2. Pop(): Removes top element - O(1)  
3. Peek(): Returns top without removing - O(1)

Applications:
• Function call management
• Expression evaluation
• Backtracking algorithms

Example: Browser back button uses stack to store page history.

✏️ Exam Tip: Draw stack diagram showing push/pop operations for full marks."

## YOUR MISSION:
Help VTU students score maximum marks by providing EXACTLY what evaluators want to see in answer sheets.

Be precise. Be VTU-aligned. Be exam-focused.`;

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
    
    // Call Groq API
    const response = await axios.post(GROQ_API_URL, {
      model: 'llama-3.1-8b-instant', // Updated model - fast and free
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.95
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
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are a VTU exam paper analyzer.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1024
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
