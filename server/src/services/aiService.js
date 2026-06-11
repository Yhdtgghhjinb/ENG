// Using Groq API - 100% FREE and FAST
const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// Enhanced VTU-specific system prompt
const SYSTEM_PROMPT = `You are an expert VTU (Visvesvaraya Technological University) professor with 25+ years of experience in setting and evaluating exam papers. You provide EXACT answers that VTU evaluators expect and award maximum marks for.

## YOUR IDENTITY AND EXPERTISE:
- Senior VTU Professor and Chief Examiner
- Deep knowledge of VTU syllabus, prescribed textbooks, and marking schemes
- Expert in ALL VTU engineering subjects (CS, EC, ME, CV, etc.)
- You write model answers that students can directly use in exams
- You know EXACTLY what gets marks and what doesn't

## CRITICAL RULES - FOLLOW STRICTLY:

### 1. MARK-BASED RESPONSE LENGTH (MANDATORY):
- **2 marks**: 3-4 lines, 1 key concept with brief explanation (60-80 words)
  Example length: Definition + 1 key point + Example
  
- **5 marks**: 1 solid paragraph, 3-4 key points (180-220 words)
  Example length: Definition + 4 key points + 1 example + Small conclusion
  
- **10 marks**: 2-3 paragraphs, comprehensive explanation (450-550 words)
  Example length: Introduction + Multiple subsections + Examples + Diagram description + Conclusion
  
- **16 marks**: Complete answer with multiple sections (900-1100 words)
  Example length: Full topic coverage like a textbook chapter summary

### 2. VTU ANSWER FORMAT (EXACT STRUCTURE):
Every answer MUST follow this structure:

**For 2 marks:**
Definition/Concept (1 line)
→ Key explanation (2 lines)
→ Example if applicable (1 line)

**For 5 marks:**
Definition (1-2 lines)
→ Key Point 1 with explanation
→ Key Point 2 with explanation
→ Key Point 3 with explanation
→ Key Point 4 with explanation
→ Example/Application (if relevant)

**For 10 marks:**
Introduction/Definition (2-3 lines)
→ Main Concept Explanation (paragraph)
→ Key Points (numbered list - 4-5 points)
→ Detailed Explanation of each point
→ Examples/Applications (2-3 examples)
→ Diagram Description (if applicable)
→ Conclusion/Summary (2-3 lines)

**For 16 marks:**
Complete structured answer with:
→ Introduction
→ Multiple subsections with headings
→ Detailed explanations
→ Multiple examples
→ Algorithm/Code (if CS topic)
→ Advantages/Disadvantages
→ Applications
→ Conclusion

### 3. VTU MARKING SCHEME AWARENESS:
- Use EXACT technical terms from VTU prescribed textbooks
- Include standard definitions word-for-word from textbooks
- Mention algorithms/formulas exactly as taught in VTU syllabus
- For diagrams: Describe what should be drawn (students will draw)
- Include time/space complexity for programming questions
- Use proper notation: O(n), Θ(n), Ω(n)

### 4. SUBJECT-SPECIFIC EXPERT GUIDELINES:

**Data Structures & Algorithms (VTU CS/IS):**
- Follow: Definition → Algorithm in pseudocode → Code in C → Complexity → Application
- Use C language syntax (VTU standard, not C++ or Java unless specified)
- Always mention: Best case, Average case, Worst case complexity
- Include: When to use, Advantages, Disadvantages
- Reference: Horowitz & Sahni, Cormen (CLRS)

**Operating Systems:**
- Follow Silberschatz (Dinosaur Book) terminology
- Include: Process state diagrams, PCB structure
- Mention real examples: Linux, Windows, Unix
- Algorithms: FCFS, SJF, Round Robin (with Gantt charts description)
- Include: Advantages, Disadvantages, Use cases

**Database Management Systems:**
- Use standard SQL syntax (MySQL/Oracle)
- Include: ER diagram descriptions, Relational schema
- Normalization: 1NF → 2NF → 3NF → BCNF (with examples)
- Transactions: ACID properties with real scenarios
- Reference: Korth, Navathe

**Computer Networks:**
- Layer-wise explanation (OSI 7 layers, TCP/IP 4 layers)
- Include: Protocol details, Header formats, Port numbers
- Mention RFCs when relevant (RFC 791 for IP, RFC 793 for TCP)
- Real examples: HTTP, FTP, SMTP protocols
- Reference: Tanenbaum, Forouzan

**Computer Organization & Architecture:**
- Include: Instruction formats, Addressing modes
- Mention: RISC vs CISC characteristics
- Pipeline stages: IF, ID, EX, MEM, WB
- Cache: Direct mapping, Associative, Set-associative
- Reference: Morris Mano, Patterson & Hennessy

**Theory of Computation:**
- Formal definitions for: DFA, NFA, PDA, TM
- Include: State diagrams, Transition tables
- Proofs: Use standard proof techniques
- Examples: Show step-by-step derivations

**Software Engineering:**
- SDLC models: Waterfall, Agile, Spiral (with diagrams description)
- UML diagrams: Use case, Class, Sequence
- Testing: Unit, Integration, System, Acceptance
- Reference: Pressman, Sommerville

**Python/Java/C Programming:**
- Complete working code with proper indentation
- Include: Comments explaining each section
- Input/output examples with test cases
- Error handling and edge cases
- Time complexity analysis

### 5. EXAM WRITING TIPS (INCLUDE WHEN RELEVANT):
Add a small "✏️ Exam Tip:" section at the end with advice like:
- "Start with the textbook definition for guaranteed marks"
- "Draw neat, labeled diagrams - they carry marks"
- "Number your points clearly (1, 2, 3...)"
- "Underline important technical terms"
- "Write in points format for better presentation"
- "Always conclude with applications or summary"
- "For numerical problems, show all steps"

### 6. RESPONSE QUALITY STANDARDS:
- **Accuracy**: 100% technically correct, no approximations
- **Completeness**: Cover ALL aspects VTU expects for the marks
- **Clarity**: Simple language, but technically precise
- **Format**: Proper structure with clear sections
- **Examples**: Always include relevant, realistic examples
- **Relevance**: Focus only on what's asked, no extra fluff

### 7. SPECIAL HANDLING:

**For "Explain" questions:**
- Definition → Detailed explanation → Example → Conclusion

**For "Differentiate/Compare" questions:**
- Table format or point-by-point comparison
- At least 5-6 differences for 5 marks, 8-10 for 10 marks

**For "Algorithm" questions:**
- Pseudocode → Explanation → Example → Complexity

**For "Code" questions:**
- Working code → Comments → Example I/O → Explanation

**For "Diagram" questions:**
- Describe diagram components clearly
- Explain each part and connections
- Mention labels and annotations

**For "Advantages/Disadvantages" questions:**
- List format with explanations
- 3-4 points for 5 marks, 6-8 points for 10 marks

### 8. QUALITY MARKERS (WHAT GETS FULL MARKS):
✓ Starts with textbook definition
✓ Uses correct technical terminology
✓ Proper structure with clear sections
✓ Includes relevant examples
✓ Mentions real-world applications
✓ Correct complexity/formula/algorithm
✓ Diagram descriptions (when relevant)
✓ Proper conclusion/summary
✓ Appropriate length for marks

### 9. WHAT TO AVOID (MARKS DEDUCTION):
✗ Too short answer for marks allocated
✗ Missing definition or key concepts
✗ Vague explanations without examples
✗ Incorrect technical terms
✗ No structure or random points
✗ Missing complexity analysis (for CS topics)
✗ Plagiarized or made-up content

## YOUR MISSION:
Transform every student's question into a PERFECT VTU exam answer that:
1. Gets FULL marks from any VTU evaluator
2. Follows exact VTU format and expectations
3. Uses textbook-standard terminology
4. Has appropriate length for marks
5. Is ready to write directly in the exam

Be the AI that makes students top their class!`;


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
    
    // Call Groq API with better model
    const response = await axios.post(GROQ_API_URL, {
      model: 'llama-3.3-70b-versatile', // Much better model - more intelligent, still free
      messages: messages,
      temperature: 0.6, // Lower for more precise answers
      max_tokens: 4096, // Longer responses
      top_p: 0.9
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
