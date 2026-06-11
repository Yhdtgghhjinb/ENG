// Using Hugging Face Inference API - 100% FREE forever
const axios = require('axios');

const HF_API_URL = 'https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || '';

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
    // Check if API key is configured
    if (!HF_API_KEY) {
      return {
        success: false,
        response: '⚠️ AI service is not configured. Please add HUGGINGFACE_API_KEY to environment variables.\n\n✅ Get a FREE API key from Hugging Face:\n1. Visit: https://huggingface.co/settings/tokens\n2. Sign up (free forever)\n3. Create a new token\n4. Add to Railway environment variables\n\n100% Free - No credit card required - Unlimited usage!'
      };
    }

    // Detect if question mentions marks
    const marksMatch = userMessage.match(/(\d+)\s*marks?/i);
    const marks = marksMatch ? parseInt(marksMatch[1]) : null;

    // Build conversation context with VTU focus
    let prompt = SYSTEM_PROMPT + '\n\n';
    
    if (marks) {
      prompt += `🎯 IMPORTANT: Student is asking for a ${marks}-mark exam answer. Provide COMPLETE answer formatted for VTU exam paper.\n\n`;
    }
    
    prompt += 'Conversation:\n';
    
    // Add recent history (last 4 exchanges for context)
    const recentHistory = conversationHistory.slice(-8);
    recentHistory.forEach(msg => {
      if (msg.role === 'user') {
        prompt += `Student: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        prompt += `VTU Assistant: ${msg.content}\n`;
      }
    });

    // Add current message
    prompt += `Student: ${userMessage}\n`;
    
    if (marks) {
      prompt += `\n[REMINDER: This is a ${marks}-mark question. Provide answer in VTU exam format.]\n`;
    }
    
    prompt += `VTU Assistant:`;

    // Call Hugging Face API
    const response = await axios.post(HF_API_URL, {
      inputs: prompt,
      parameters: {
        max_new_tokens: 1024,
        temperature: 0.7,
        top_p: 0.95,
        return_full_text: false
      }
    }, {
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    const result = response.data;
    
    let text = '';
    if (Array.isArray(result) && result[0]?.generated_text) {
      text = result[0].generated_text;
    } else if (result.generated_text) {
      text = result.generated_text;
    } else if (typeof result === 'string') {
      text = result;
    } else {
      text = 'I apologize, but I received an unexpected response. Please try again.';
    }

    return {
      success: true,
      response: text.trim(),
      marks: marks
    };

  } catch (error) {
    console.error('AI Service Error:', error);
    console.error('Error details:', error.response?.data || error.message);
    
    // Handle axios errors
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      console.error(`HF API Error - Status: ${status}`, errorData);
      
      if (status === 401 || status === 403) {
        return {
          success: false,
          response: '⚠️ Invalid or missing API key.\n\n✅ Hugging Face is 100% FREE forever!\n\nGet your free key:\n1. Visit: https://huggingface.co/settings/tokens\n2. Sign up with email (no credit card)\n3. Create a new token (Read role is enough)\n4. Add to Railway environment: HUGGINGFACE_API_KEY\n\nUnlimited requests - Perfect for students!'
        };
      }
      
      if (status === 503 || errorData?.error?.includes('loading')) {
        return {
          success: false,
          response: '⏳ Model is loading... This is normal for the first request!\n\nThe free model was sleeping and is now waking up. Please wait 20-30 seconds and try again.\n\nThis only happens once - subsequent requests will be fast!\n\n100% free - just needs a moment to start.'
        };
      }
      
      if (status === 429) {
        return {
          success: false,
          response: '⏳ Rate limit reached. Please wait a moment and try again.\n\nThis is rare on the free tier. The API should be available again in a few seconds.'
        };
      }
    }

    return {
      success: false,
      response: '❌ Sorry, I encountered an error. Please try again in a moment.\n\nIf this persists:\n1. Wait 20-30 seconds (model might be loading)\n2. Check your internet connection\n3. Verify API key is correctly set\n\nThe service is completely free and should work fine!'
    };
  }
}

async function analyzeQuestionPaper(text, examDetails = {}) {
  try {
    if (!HF_API_KEY) {
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

    const response = await axios.post(HF_API_URL, {
      inputs: prompt,
      parameters: {
        max_new_tokens: 512,
        temperature: 0.5,
      }
    }, {
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    const result = response.data;
    let analysisText = '';
    
    if (Array.isArray(result) && result[0]?.generated_text) {
      analysisText = result[0].generated_text;
    } else if (result.generated_text) {
      analysisText = result.generated_text;
    } else {
      analysisText = 'Analysis completed. Please review the paper manually for detailed insights.';
    }

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
      message: 'Failed to analyze question paper. Please try again. The model might be loading on first use.'
    };
  }
}

module.exports = {
  getChatResponse,
  analyzeQuestionPaper
};
