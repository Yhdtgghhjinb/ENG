import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/api';

const AIChatBot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your VTU Study Assistant. I can help you with:\n\n📚 Explain concepts and topics\n🎯 Suggest study strategies\n📝 Recommend resources\n❓ Answer VTU-related questions\n\nWhat would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    { icon: '📖', text: 'Explain Data Structures' },
    { icon: '🎯', text: 'Study tips for exams' },
    { icon: '💡', text: 'Recommend resources' },
    { icon: '🔍', text: 'VTU syllabus help' },
  ];

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
        timestamp: new Date()
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

  const handleQuickPrompt = (text) => {
    setInput(text);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="text-center space-y-2 py-4 flex-shrink-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
          🤖 AI Study Assistant
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto px-2">
          Your 24/7 VTU study companion powered by AI
        </p>
      </div>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="flex-shrink-0 mb-4">
          <p className="text-xs text-slate-500 mb-2 text-center">Quick questions:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleQuickPrompt(prompt.text)}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  color: '#a5b4fc',
                }}>
                <span className="mr-1">{prompt.icon}</span>
                {prompt.text}
              </button>
            ))}
          </div>
        </div>
      )}

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
                  <span className="text-lg">
                    {msg.role === 'user' ? '👤' : '🤖'}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 mb-1">
                      {msg.role === 'user' ? 'You' : 'AI Assistant'} • {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                    <div className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>
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
            placeholder="Ask me anything about VTU, studies, or concepts..."
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
          AI responses may not always be accurate. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default AIChatBot;
