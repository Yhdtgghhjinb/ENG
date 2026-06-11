const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI (free tier available)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
```
Definition/Introduction (1-2 lines)
→ Key Points (numbered/bulleted)
→ Explanation (with technical terms)
→ Example/Diagram (if applicable)
→ Conclusion/Application
```

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
    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        response: '⚠️ AI service is not configured. Please add GEMINI_API_KEY to environment variables.\n\nGet a FREE API key from: https://makersuite.google.com/app/apikey\n\nGemini API is completely free with 60 requests per minute - perfect for students!'
      };
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.7, // Balanced creativity
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048, // Longer responses for detailed answers
      },
    });

    // Detect if question mentions marks
    const marksMatch = userMessage.match(/(\d+)\s*marks?/i);
    const marks = marksMatch ? parseInt(marksMatch[1]) : null;

    // Build conversation context with VTU focus
    let prompt = SYSTEM_PROMPT + '\n\n';
    
    if (marks) {
      prompt += `🎯 IMPORTANT: Student is asking for a ${marks}-mark exam answer. Provide COMPLETE answer formatted for VTU exam paper.\n\n`;
    }
    
    prompt += 'Conversation:\n';
    
    // Add recent history (last 6 exchanges for context)
    const recentHistory = conversationHistory.slice(-12);
    recentHistory.forEach(msg => {
      if (msg.role === 'user') {
        prompt += `Student: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        prompt += `VTU Assistant: ${msg.content}\n`;
      }
    });

    // Add current message with special handling
    prompt += `Student: ${userMessage}\n`;
    
    // Add mark-specific instruction if detected
    if (marks) {
      prompt += `\n[REMINDER: This is a ${marks}-mark question. Provide answer in VTU exam format with proper length and structure.]\n`;
    }
    
    prompt += `VTU Assistant:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return {
      success: true,
      response: text.trim(),
      marks: marks // Return detected marks for UI enhancement
    };

  } catch (error) {
    console.error('AI Service Error:', error);
    
    // Handle specific errors
    if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
      return {
        success: false,
        response: '⚠️ Invalid or missing API key.\n\n✅ Good News: Gemini API is 100% FREE!\n\nGet your free key:\n1. Visit: https://makersuite.google.com/app/apikey\n2. Sign in with Google\n3. Click "Get API Key"\n4. Add to Railway environment variables\n\nFree tier includes 60 requests/minute - more than enough for students!'
      };
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return {
        success: false,
        response: '⏳ API rate limit reached. Please wait a moment and try again.\n\nThe free tier allows 60 requests per minute, which should be plenty. If you\'re hitting this often, consider:\n• Waiting 1-2 minutes between complex questions\n• The API resets every minute\n\nDon\'t worry - it\'s still completely free!'
      };
    }

    return {
      success: false,
      response: '❌ Sorry, I encountered an error. Please try again.\n\nIf this persists:\n1. Check your internet connection\n2. Verify API key is correctly set\n3. Try asking the question differently\n\nThe service is working fine for others, so it should work for you too!'
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
