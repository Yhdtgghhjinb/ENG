import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/api';

const AIChatBot = () => {
  // Load chat history from sessionStorage on component mount
  const [messages, setMessages] = useState(() => {
    const savedMessages = sessionStorage.getItem('vtu-chat-history');
    if (savedMessages) {
      try {
        return JSON.parse(savedMessages);
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    }
    return [
      {
        role: 'assistant',
        content: `🎓 Welcome! I'm your VTU Exam Expert Assistant.

📖 **HOW TO USE:**

1️⃣ **Ask Any VTU Question**
   Simply type your question and mention marks if needed
   
2️⃣ **Get Perfect VTU Answers**
   • Textbook-aligned format
   • Proper exam structure
   • Ready to copy and use
   
3️⃣ **Mark-Based Responses**
   • 2 marks = Brief answer (70-90 words)
   • 5 marks = Detailed answer (220-260 words)
   • 10 marks = Complete answer (550-650 words)
   • 16 marks = Full explanation (1100-1300 words)

💡 **Features:**
✓ Copy any response with one click
✓ Your chat history is saved
✓ Exam-ready answers
✓ 100% Free

❓ Start by asking any VTU exam question!`,
        timestamp: new Date(),
        isWelcome: true // Mark this as welcome message
      }
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('vtu-chat-history', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/ai/chat', {
        message: input.trim(),
        history: messages.slice(-10) // Send last 10 messages for context
      });

      const aiMessage = {
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date(),
        marks: res.data.marks // Track if it was a marks-based question
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again or rephrase your question.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Copy message content to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Show a brief success indicator (you could add a toast notification here)
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="text-center space-y-2 py-4 flex-shrink-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
          🎓 VTU Exam Expert AI
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto px-2">
          Get exact VTU board answers • Mark-based responses • Textbook-aligned • 100% Free
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'rounded-tr-sm'
                    : 'rounded-tl-sm'
                }`}
                style={{
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : msg.isError
                    ? 'rgba(239,68,68,0.1)'
                    : 'rgba(255,255,255,0.05)',
                  border: msg.isError ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)',
                }}>
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-lg flex-shrink-0">
                    {msg.role === 'user' ? '👤' : '🎓'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-xs text-slate-400">
                        {msg.role === 'user' ? 'You' : 'VTU Expert'} • {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                      {msg.marks && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ 
                            background: 'rgba(245,158,11,0.2)', 
                            color: '#fbbf24',
                            border: '1px solid rgba(245,158,11,0.3)'
                          }}>
                          📝 {msg.marks} Marks Answer
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>
                    {/* Copy button for AI responses (except welcome message) */}
                    {msg.role === 'assistant' && !msg.isError && !msg.isWelcome && (
                      <button
                        onClick={() => copyToClipboard(msg.content)}
                        className="mt-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
                        style={{
                          background: 'rgba(99,102,241,0.15)',
                          border: '1px solid rgba(99,102,241,0.3)',
                          color: '#a5b4fc'
                        }}
                        title="Copy answer">
                        📋 Copy Answer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start">
            <div className="max-w-[75%] rounded-2xl rounded-tl-sm p-4"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask any VTU exam question..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: input.trim() && !loading ? '0 4px 20px rgba(99,102,241,0.3)' : 'none',
            }}>
            Send
          </button>
        </form>
        <p className="text-[10px] text-slate-600 text-center mt-2">
          💡 Tip: Your chat history is saved until you close this tab
        </p>
      </div>
    </div>
  );
};

export default AIChatBot;
