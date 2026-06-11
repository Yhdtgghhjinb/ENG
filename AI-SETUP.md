# VTU Exam Expert AI - Setup Guide

This guide explains how to set up the VTU-focused AI features that provide **exact exam answers**.

## 🎯 What Makes This AI Special

Unlike generic AI assistants, this AI is specifically trained to:

1. **Provide VTU Board Expected Answers** - Answers formatted exactly as VTU evaluators expect
2. **Mark-Based Response Length** - Knows how much to write for 2/5/10/16 mark questions
3. **Textbook-Aligned Content** - Follows VTU prescribed textbooks and syllabus
4. **Exam Writing Format** - Proper structure with definitions, points, examples, diagrams
5. **Subject-Specific Guidelines** - Different approach for DS, OS, DBMS, Networks, etc.
6. **100% FREE** - Uses Gemini API's generous free tier (60 requests/min)

## 💡 How to Use the AI

### For Best Results:

**❌ Wrong Way:**
- "Tell me about stacks"
- "What is operating system"

**✅ Right Way:**
- "Explain stack for 5 marks"
- "Define operating system (2 marks)"
- "Write about TCP/IP protocol for 10 marks"
- "Explain DBMS normalization (16 marks)"

### Why Mention Marks?

When you mention marks, the AI:
- Provides **complete exam-formatted answer**
- Uses **proper length** for that mark allocation
- Includes **diagrams/examples** where needed
- Adds **exam writing tips**
- Formats answer as it should appear on **answer sheet**

## 📝 Response Examples

### 2 Marks Question:
**Input:** "Define stack (2 marks)"
**Output:** 
- 2-3 lines
- Definition + key characteristic
- 50-75 words
- Exam tip included

### 5 Marks Question:
**Input:** "Explain stack for 5 marks"
**Output:**
- 1 paragraph
- Definition + Operations + Applications + Example
- 150-200 words
- Diagram description
- Exam tip included

### 10 Marks Question:
**Input:** "Write about operating system for 10 marks"
**Output:**
- 2-3 paragraphs
- Complete topic coverage
- Multiple sections with examples
- 400-500 words
- Detailed explanations
- Exam tip included

## Features

1. **VTU Exam Expert AI** - 24/7 AI that provides exact VTU board answers
2. **Question Paper Analyzer** - Analyze PYQs to identify patterns
3. **Multi-language Support** - English, Kannada (ಕನ್ನಡ), Hindi (हिंदी)

## Setup Instructions

### 1. Get Gemini API Key (FREE)

The AI features use Google's Gemini API, which has a generous free tier.

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the generated API key

### 2. Add API Key to Environment

**For Local Development:**

1. Open `server/.env` file (create if it doesn't exist)
2. Add this line:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with your actual API key

**For Railway Deployment:**

1. Go to your Railway project dashboard
2. Click on your service → **Variables** tab
3. Add new variable:
   - Key: `GEMINI_API_KEY`
   - Value: Your Gemini API key
4. Click **Add** and redeploy

**For Vercel (if using serverless functions):**

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add new variable:
   - Key: `GEMINI_API_KEY`
   - Value: Your API key
3. Redeploy the project

### 3. Install Required Package

The AI service requires the Google Generative AI package:

```bash
cd server
npm install @google/generative-ai
```

### 4. Restart the Server

After adding the API key and installing the package:

```bash
# Stop the server (Ctrl+C)
# Start again
npm start
```

## Testing the Features

### AI ChatBot
1. Navigate to **AI Assistant** from the menu
2. Type a question like "Explain Data Structures"
3. The AI will respond with helpful information

### Question Paper Analyzer
1. Navigate to **QP Analyzer** from the menu
2. Upload a question paper (TXT format works best)
3. Add subject details (optional)
4. Click **Analyze Question Paper**
5. View topics, difficulty, and study recommendations

### Multi-language Support
1. Click the language selector (🇬🇧) in the header
2. Choose your preferred language:
   - 🇬🇧 English
   - 🇮🇳 ಕನ್ನಡ (Kannada)
   - 🇮🇳 हिंदी (Hindi)
3. The interface will update to show text in your selected language

## API Limits

**Gemini Free Tier:**
- 60 requests per minute
- Plenty for educational use
- No credit card required

If you exceed the free tier limits, consider:
- Upgrading to a paid plan
- Implementing request rate limiting
- Adding caching for common queries

## Troubleshooting

### "AI service is not configured"
- Make sure `GEMINI_API_KEY` is added to your `.env` file
- Restart the server after adding the key
- Check the key is valid at https://makersuite.google.com

### "Invalid API key"
- Double-check you copied the entire API key
- No spaces before/after the key
- Key should start with `AIza...`

### AI responses are slow
- Free tier has rate limits
- First request may take longer
- Consider implementing caching

### Question Paper Analyzer not working for images
- Currently only text files (.txt) provide full analysis
- For images/PDFs, manually copy the text content
- OCR support can be added with Google Vision API

## Future Enhancements

- Add conversation history persistence
- Implement caching for common questions
- Add OCR support for image/PDF question papers
- Personalized study recommendations based on user history
- Voice input/output support

## Need Help?

If you encounter issues:
1. Check the server logs for error messages
2. Verify your API key is correct
3. Ensure the package is installed: `npm list @google/generative-ai`
4. Make sure your internet connection is working (API requires internet)

## Security Notes

- Never commit your API keys to version control
- Add `.env` to `.gitignore`
- Use environment variables for all sensitive data
- Rotate API keys periodically
