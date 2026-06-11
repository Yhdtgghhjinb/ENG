import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import api from '../config/api';

const AIChatBot = () => {
  // Theme Management (Light/Dark)
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('vtu-theme');
    return savedTheme || 'dark';
  });

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
✓ Voice Input (🎤)
✓ Export to PDF (📄)
✓ Share Answers (📤)
✓ Dark/Light Mode (🌓)
✓ Copy with one click (📋)
✓ Chat history saved
✓ 100% Free

❓ Start by asking any VTU exam question!`,
        timestamp: new Date(),
        isWelcome: true
      }
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('vtu-chat-history', JSON.stringify(messages));
  }, [messages]);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('vtu-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        toast.success('Voice captured!');
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          toast.error('Voice input failed. Please try again.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

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
      toast.error('Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  // Voice Input Handler
  const handleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error('Voice input not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast('Listening... Speak now', { icon: '🎤' });
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        toast.error('Failed to start voice input');
      }
    }
  }, [isListening]);

  // Copy message content to clipboard
  const copyToClipboard = useCallback((text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedIndex(null), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy');
    });
  }, []);

  // Export Chat to PDF
  const exportToPDF = useCallback(async () => {
    if (messages.length <= 1) {
      toast.error('No messages to export');
      return;
    }

    const toastId = toast.loading('Generating PDF...');
    
    try {
      // Lazy load jsPDF only when needed
      const { jsPDF } = await import('jspdf');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const lineHeight = 7;
      let yPosition = 20;

      // Header
      pdf.setFontSize(18);
      pdf.setTextColor(99, 102, 241);
      pdf.text('VTU VAULT - Chat Export', margin, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Exported on: ${new Date().toLocaleString()}`, margin, yPosition);
      
      yPosition += 15;
      pdf.setDrawColor(99, 102, 241);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Messages
      messages.forEach((msg, idx) => {
        if (msg.isWelcome) return; // Skip welcome message

        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        // Message header
        pdf.setFontSize(10);
        pdf.setTextColor(99, 102, 241);
        const role = msg.role === 'user' ? 'You' : 'VTU Expert';
        const time = new Date(msg.timestamp).toLocaleTimeString();
        pdf.text(`${role} - ${time}`, margin, yPosition);
        yPosition += lineHeight;

        // Message content
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        const lines = pdf.splitTextToSize(msg.content, pageWidth - (2 * margin));
        
        lines.forEach(line => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, margin, yPosition);
          yPosition += lineHeight;
        });

        yPosition += 5; // Space between messages
      });

      // Footer
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text(
          `Page ${i} of ${totalPages} | VTU VAULT`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      pdf.save(`VTU-Chat-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF', { id: toastId });
    }
  }, [messages]);

  // Share Functionality
  const handleShare = useCallback((platform) => {
    const lastAiMessage = messages.filter(m => m.role === 'assistant' && !m.isWelcome).pop();
    
    if (!lastAiMessage) {
      toast.error('No answer to share');
      return;
    }

    const text = `Check out this VTU exam answer from VTU VAULT:\n\n${lastAiMessage.content}`;
    const url = window.location.href;

    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(`${text}\n\n${url}`).then(() => {
          toast.success('Link copied!');
          setShowShareMenu(false);
        });
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
        setShowShareMenu(false);
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        setShowShareMenu(false);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        setShowShareMenu(false);
        break;
      case 'email':
        window.location.href = `mailto:?subject=VTU VAULT - Exam Answer&body=${encodeURIComponent(text + '\n\n' + url)}`;
        setShowShareMenu(false);
        break;
      default:
        break;
    }
  }, [messages]);

  // Clear Chat
  const clearChat = useCallback(() => {
    if (confirm('Are you sure you want to clear all chat history?')) {
      setMessages([
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
✓ Voice Input (🎤)
✓ Export to PDF (📄)
✓ Share Answers (📤)
✓ Dark/Light Mode (🌓)
✓ Copy with one click (📋)
✓ Chat history saved
✓ 100% Free

❓ Start by asking any VTU exam question!`,
          timestamp: new Date(),
          isWelcome: true
        }
      ]);
      sessionStorage.removeItem('vtu-chat-history');
      toast.success('Chat cleared!');
    }
  }, []);

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    toast.success(`${theme === 'dark' ? 'Light' : 'Dark'} mode activated`);
  };

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: theme === 'dark' ? 'rgba(17,24,39,0.95)' : 'rgba(255,255,255,0.95)',
            color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
            border: `1px solid ${theme === 'dark' ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.5)'}`,
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500'
          }
        }}
      />
      
      <div 
        className="flex flex-col min-h-[600px] transition-colors duration-300"
        style={{
          background: theme === 'dark' 
            ? 'rgba(2,6,23,0.4)' 
            : 'rgba(248,250,252,0.9)',
          color: theme === 'dark' ? '#f1f5f9' : '#1e293b'
        }}>
        
        {/* Header with Actions */}
        <div className="flex-shrink-0 py-4 px-2 sm:px-4">
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight"
                style={{ color: theme === 'dark' ? '#ffffff' : '#1e293b' }}>
                🎓 VTU Exam Expert AI
              </h1>
              <p className="text-xs sm:text-sm mt-1"
                style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                Get exact VTU board answers • Mark-based responses • 100% Free
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2.5 rounded-xl transition-all duration-200"
                style={{
                  background: theme === 'dark' 
                    ? 'rgba(99,102,241,0.15)' 
                    : 'rgba(99,102,241,0.1)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.4)'}`,
                  color: theme === 'dark' ? '#a5b4fc' : '#6366f1'
                }}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
                <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
              </motion.button>

              {/* Export PDF */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportToPDF}
                disabled={messages.length <= 1}
                className="p-2.5 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: theme === 'dark' 
                    ? 'rgba(16,185,129,0.15)' 
                    : 'rgba(16,185,129,0.1)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.4)'}`,
                  color: theme === 'dark' ? '#6ee7b7' : '#059669'
                }}
                title="Export to PDF">
                <span className="text-lg">📄</span>
              </motion.button>

              {/* Share Menu */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  disabled={messages.filter(m => m.role === 'assistant' && !m.isWelcome).length === 0}
                  className="p-2.5 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: theme === 'dark' 
                      ? 'rgba(34,211,238,0.15)' 
                      : 'rgba(34,211,238,0.1)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(34,211,238,0.3)' : 'rgba(34,211,238,0.4)'}`,
                    color: theme === 'dark' ? '#5eead4' : '#0891b2'
                  }}
                  title="Share Answer">
                  <span className="text-lg">📤</span>
                </motion.button>

                {/* Share Dropdown */}
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl overflow-hidden z-50"
                      style={{
                        background: theme === 'dark' 
                          ? 'rgba(17,24,39,0.98)' 
                          : 'rgba(255,255,255,0.98)',
                        border: `1px solid ${theme === 'dark' ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)'}`,
                        backdropFilter: 'blur(12px)'
                      }}>
                      {[
                        { icon: '🔗', label: 'Copy Link', action: 'copy' },
                        { icon: '💬', label: 'WhatsApp', action: 'whatsapp' },
                        { icon: '✈️', label: 'Telegram', action: 'telegram' },
                        { icon: '🐦', label: 'Twitter', action: 'twitter' },
                        { icon: '📧', label: 'Email', action: 'email' }
                      ].map((item) => (
                        <button
                          key={item.action}
                          onClick={() => handleShare(item.action)}
                          className="w-full px-4 py-2.5 text-left text-sm font-medium transition-all duration-150 flex items-center gap-2"
                          style={{
                            color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
                            ':hover': {
                              background: theme === 'dark' 
                                ? 'rgba(99,102,241,0.15)' 
                                : 'rgba(99,102,241,0.1)'
                            }
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = theme === 'dark' 
                              ? 'rgba(99,102,241,0.15)' 
                              : 'rgba(99,102,241,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}>
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Clear Chat */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearChat}
                disabled={messages.length <= 1}
                className="p-2.5 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: theme === 'dark' 
                    ? 'rgba(239,68,68,0.15)' 
                    : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.4)'}`,
                  color: theme === 'dark' ? '#fca5a5' : '#dc2626'
                }}
                title="Clear Chat">
                <span className="text-lg">🗑️</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={chatContainerRef}
          className="space-y-3 mb-4 px-2 sm:px-4">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[90%] sm:max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-lg ${
                    msg.role === 'user'
                      ? 'rounded-tr-sm'
                      : 'rounded-tl-sm'
                  }`}
                  style={{
                    background: msg.role === 'user'
                      ? theme === 'dark'
                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                        : 'linear-gradient(135deg, #818cf8, #a78bfa)'
                      : msg.isError
                      ? theme === 'dark'
                        ? 'rgba(239,68,68,0.1)'
                        : 'rgba(239,68,68,0.15)'
                      : theme === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(255,255,255,0.9)',
                    border: msg.isError 
                      ? `1px solid ${theme === 'dark' ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.4)'}` 
                      : `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(203,213,225,0.5)'}`,
                    color: msg.role === 'user' 
                      ? '#ffffff' 
                      : theme === 'dark' ? '#f1f5f9' : '#1e293b'
                  }}>
                  <div className="flex items-start gap-2 mb-1">
                    <span className="text-lg sm:text-xl flex-shrink-0">
                      {msg.role === 'user' ? '👤' : '🎓'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-xs font-medium"
                          style={{ 
                            color: msg.role === 'user' 
                              ? 'rgba(255,255,255,0.8)' 
                              : theme === 'dark' ? '#94a3b8' : '#64748b' 
                          }}>
                          {msg.role === 'user' ? 'You' : 'VTU Expert'} • {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                        {msg.marks && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
                            style={{ 
                              background: theme === 'dark' 
                                ? 'rgba(245,158,11,0.2)' 
                                : 'rgba(245,158,11,0.15)', 
                              color: '#fbbf24',
                              border: `1px solid rgba(245,158,11,0.3)`
                            }}>
                            📝 {msg.marks} Marks Answer
                          </motion.span>
                        )}
                      </div>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </div>
                      {/* Copy button for AI responses (except welcome message) */}
                      {msg.role === 'assistant' && !msg.isError && !msg.isWelcome && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => copyToClipboard(msg.content, idx)}
                          className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                          style={{
                            background: copiedIndex === idx
                              ? theme === 'dark'
                                ? 'rgba(16,185,129,0.2)'
                                : 'rgba(16,185,129,0.15)'
                              : theme === 'dark'
                              ? 'rgba(99,102,241,0.15)'
                              : 'rgba(99,102,241,0.1)',
                            border: `1px solid ${
                              copiedIndex === idx
                                ? theme === 'dark' ? 'rgba(16,185,129,0.4)' : 'rgba(16,185,129,0.5)'
                                : theme === 'dark' ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.4)'
                            }`,
                            color: copiedIndex === idx
                              ? theme === 'dark' ? '#6ee7b7' : '#059669'
                              : theme === 'dark' ? '#a5b4fc' : '#6366f1'
                          }}
                          title="Copy answer">
                          {copiedIndex === idx ? '✅ Copied!' : '📋 Copy Answer'}
                        </motion.button>
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
              exit={{ opacity: 0 }}
              className="flex justify-start">
              <div className="max-w-[75%] rounded-2xl rounded-tl-sm p-4 shadow-lg"
                style={{
                  background: theme === 'dark' 
                    ? 'rgba(255,255,255,0.05)' 
                    : 'rgba(255,255,255,0.9)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(203,213,225,0.5)'}`,
                }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <div className="flex gap-1">
                    <motion.div 
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 rounded-full"
                      style={{ background: theme === 'dark' ? '#818cf8' : '#6366f1' }}
                    />
                    <motion.div 
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                      className="w-2 h-2 rounded-full"
                      style={{ background: theme === 'dark' ? '#818cf8' : '#6366f1' }}
                    />
                    <motion.div 
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                      className="w-2 h-2 rounded-full"
                      style={{ background: theme === 'dark' ? '#818cf8' : '#6366f1' }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-2 sm:px-4 pb-2 pt-3 border-t"
          style={{
            borderColor: theme === 'dark' ? 'rgba(99,102,241,0.2)' : 'rgba(203,213,225,0.3)',
            background: theme === 'dark' ? 'rgba(2,6,23,0.6)' : 'rgba(248,250,252,0.95)'
          }}>
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            {/* Voice Input Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVoiceInput}
              disabled={loading}
              className={`flex-shrink-0 p-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isListening ? 'animate-pulse' : ''
              }`}
              style={{
                background: isListening
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : theme === 'dark'
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'linear-gradient(135deg, #818cf8, #a78bfa)',
                boxShadow: isListening
                  ? '0 0 20px rgba(239,68,68,0.5)'
                  : !loading && theme === 'dark'
                  ? '0 4px 20px rgba(99,102,241,0.3)'
                  : '0 2px 10px rgba(99,102,241,0.2)',
                color: '#ffffff'
              }}
              title={isListening ? 'Stop listening' : 'Start voice input'}>
              <span className="text-xl">{isListening ? '🔴' : '🎤'}</span>
            </motion.button>

            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask any VTU exam question..."
              disabled={loading || isListening}
              className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all duration-200"
              style={{
                background: theme === 'dark' 
                  ? 'rgba(255,255,255,0.05)' 
                  : 'rgba(255,255,255,0.9)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(203,213,225,0.5)'}`,
                color: theme === 'dark' ? '#ffffff' : '#1e293b',
                boxShadow: theme === 'dark' 
                  ? 'inset 0 2px 4px rgba(0,0,0,0.2)' 
                  : 'inset 0 1px 2px rgba(0,0,0,0.05)'
              }}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!input.trim() || loading || isListening}
              className="flex-shrink-0 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'linear-gradient(135deg, #818cf8, #a78bfa)',
                boxShadow: input.trim() && !loading && !isListening
                  ? theme === 'dark'
                    ? '0 4px 20px rgba(99,102,241,0.3)'
                    : '0 2px 10px rgba(99,102,241,0.2)'
                  : 'none',
              }}>
              Send
            </motion.button>
          </form>
          <p className="text-[10px] text-center mt-2"
            style={{ color: theme === 'dark' ? '#64748b' : '#94a3b8' }}>
            💡 Tip: Use voice input (🎤) • Export to PDF (📄) • Share answers (📤) • Toggle theme ({theme === 'dark' ? '☀️' : '🌙'})
          </p>
        </div>
      </div>
    </>
  );
};

export default AIChatBot;
