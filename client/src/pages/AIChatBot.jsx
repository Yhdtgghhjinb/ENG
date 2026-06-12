import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import api from '../config/api';
import ContextDetector from '../utils/ai/contextDetector';
import MemoryManager from '../utils/ai/memoryManager';
import streamingClient from '../utils/ai/streamingClient';

const AIChatBot = () => {
  // Theme Management (Light/Dark)
  const [theme, setTheme] = useState(() => {
    const prefs = MemoryManager.getPreferences();
    return prefs.theme || 'dark';
  });

  // Context Detection
  const [context, setContext] = useState(() => {
    return ContextDetector.detectContext();
  });

  // Mode Selection
  const [mode, setMode] = useState('normal');
  const [availableModes, setAvailableModes] = useState([
    { key: 'normal', name: 'Normal' },
    { key: 'exam', name: 'VTU Exam Mode' },
    { key: 'tutor', name: 'AI Tutor' },
    { key: 'viva', name: 'Mock Viva' },
    { key: 'quiz', name: 'Quiz Mode' },
    { key: 'code', name: 'Coding Assistant' }
  ]);

  // Active conversation
  const [activeConversationId, setActiveConversationId] = useState(() => {
    return MemoryManager.getActiveConversationId();
  });

  // Load chat history from active conversation or create new
  const [messages, setMessages] = useState(() => {
    if (activeConversationId) {
      const conversation = MemoryManager.getConversation(activeConversationId);
      if (conversation) {
        return conversation.messages;
      }
    }

    // Create new conversation
    const newConv = MemoryManager.createConversation();
    newConv.messages.push({
      role: 'assistant',
      content: `🎓 Welcome! I'm your VTU AI Assistant with multi-model intelligence.

📖 **NEW FEATURES:**

🎯 **Smart Modes:**
${availableModes.map(m => `   • ${m.name}`).join('\n')}

🧠 **Context Aware:**
   Automatically detects your Branch, Semester, Subject

🤖 **Multi-Model AI:**
   Uses best AI (GPT-4o, Claude, Gemini, Groq) for each task

💡 **Features:**
✓ Voice Input (🎤)
✓ Export to PDF (📄)
✓ Multiple AI Modes
✓ Conversation History
✓ Context Detection
✓ 100% Free

❓ Ask me anything!`,
      timestamp: new Date(),
      isWelcome: true
    });

    MemoryManager.saveConversation(newConv);
    MemoryManager.setActiveConversationId(newConv.id);
    setActiveConversationId(newConv.id);

    return newConv.messages;
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const chatContainerRef = useRef(null);
  const modeSelectorRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Close mode selector on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modeSelectorRef.current && !modeSelectorRef.current.contains(event.target)) {
        setShowModeSelector(false);
      }
    };

    if (showModeSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModeSelector]);

  // Update context when URL changes
  useEffect(() => {
    const detectedContext = ContextDetector.detectContext();
    setContext(detectedContext);
    
    // Save to localStorage
    if (ContextDetector.hasContext(detectedContext)) {
      ContextDetector.saveContext(detectedContext);
    }
  }, [window.location.pathname]);

  // Save messages to conversation when they change
  useEffect(() => {
    if (activeConversationId && messages.length > 0) {
      const conversation = MemoryManager.getConversation(activeConversationId);
      if (conversation) {
        conversation.messages = messages;
        conversation.updatedAt = new Date().toISOString();
        conversation.totalMessages = messages.length;
        MemoryManager.saveConversation(conversation);
      }
    }
  }, [messages, activeConversationId]);

  // Save theme preference
  useEffect(() => {
    MemoryManager.updatePreference('theme', theme);
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
    if (!input.trim() || loading || isStreaming) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      context: context
    };

    // Add user message immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Add to conversation
    if (activeConversationId) {
      MemoryManager.addMessage(activeConversationId, userMessage);
    }
    
    const userInput = input.trim();
    setInput('');
    setIsStreaming(true);
    setStreamingMessage('');

    try {
      // Get conversation history
      const history = MemoryManager.getActiveConversationHistory(10);
      
      // Detect marks from message
      const marksMatch = userInput.match(/(\d+)\s*marks?/i);
      const marks = marksMatch ? parseInt(marksMatch[1]) : null;

      // Stream response
      await streamingClient.streamMessage(
        {
          message: userInput,
          history,
          context,
          mode,
          marks
        },
        {
          onStart: (metadata) => {
            console.log('🌊 Stream started:', metadata);
          },
          
          onToken: (token, fullText) => {
            setStreamingMessage(fullText);
          },
          
          onComplete: (fullResponse, metadata) => {
            console.log('✅ Stream complete:', metadata);
            
            const aiMessage = {
              role: 'assistant',
              content: fullResponse,
              timestamp: new Date(),
              metadata: {
                model: metadata.model,
                tokens: metadata.tokens,
                mode: mode,
                marks: metadata.marks
              }
            };

            setMessages(prev => [...prev, aiMessage]);
            setStreamingMessage('');
            setIsStreaming(false);
            
            // Add to conversation
            if (activeConversationId) {
              MemoryManager.addMessage(activeConversationId, aiMessage);
            }
          },
          
          onError: (error) => {
            console.error('❌ Stream error:', error);
            const errorMessage = {
              role: 'assistant',
              content: `❌ Error: ${error}`,
              timestamp: new Date(),
              isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
            setStreamingMessage('');
            setIsStreaming(false);
            toast.error('Streaming failed');
          }
        }
      );

    } catch (error) {
      console.error('❌ Submit error:', error);
      const errorMessage = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      setStreamingMessage('');
      setIsStreaming(false);
      toast.error('Failed to send message');
    }
  };

  // Stop streaming
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (streamingMessage && activeConversationId) {
      // Save partial response
      const partialMessage = {
        role: 'assistant',
        content: streamingMessage + '\n\n[Generation stopped]',
        timestamp: new Date(),
        metadata: { partial: true }
      };
      
      setMessages(prev => [...prev, partialMessage]);
      MemoryManager.addMessage(activeConversationId, partialMessage);
    }
    
    setIsStreaming(false);
    setStreamingMessage('');
    toast.success('Generation stopped');
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

  // Clear Chat / Start New Conversation
  const clearChat = useCallback(() => {
    if (confirm('Start a new conversation? Current chat will be saved.')) {
      // Create new conversation
      const newConv = MemoryManager.createConversation();
      newConv.messages.push({
        role: 'assistant',
        content: `🎓 New Conversation Started!

I'm ready to help with:
• ${availableModes.find(m => m.key === mode)?.name || 'Normal Mode'}
${ContextDetector.hasContext(context) ? `• Context: ${ContextDetector.formatForDisplay(context)}` : ''}

Ask me anything!`,
        timestamp: new Date(),
        isWelcome: true
      });

      MemoryManager.saveConversation(newConv);
      MemoryManager.setActiveConversationId(newConv.id);
      
      setActiveConversationId(newConv.id);
      setMessages(newConv.messages);
      
      toast.success('New conversation started!');
    }
  }, [mode, context, availableModes]);

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
        className="flex flex-col transition-colors duration-300"
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
                🎓 VTU AI Assistant
              </h1>
              <p className="text-xs sm:text-sm mt-1"
                style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                Multi-Model AI • Context Aware • 7+ Modes
                {ContextDetector.hasContext(context) && ` • ${ContextDetector.formatForDisplay(context)}`}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Mode Selector */}
              <div className="relative" ref={modeSelectorRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModeSelector(!showModeSelector)}
                  className="p-2.5 rounded-xl transition-all duration-200 flex items-center gap-2"
                  style={{
                    background: theme === 'dark' 
                      ? 'rgba(139,92,246,0.15)' 
                      : 'rgba(139,92,246,0.1)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.4)'}`,
                    color: theme === 'dark' ? '#c4b5fd' : '#7c3aed'
                  }}
                  title="Select AI Mode">
                  <span className="text-lg">🎯</span>
                  <span className="text-xs font-medium hidden sm:inline">
                    {availableModes.find(m => m.key === mode)?.name || 'Normal'}
                  </span>
                </motion.button>

                {/* Mode Dropdown */}
                <AnimatePresence>
                  {showModeSelector && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 w-56 rounded-xl shadow-2xl z-50"
                      style={{
                        background: theme === 'dark' 
                          ? 'rgba(17,24,39,0.95)' 
                          : 'rgba(255,255,255,0.95)',
                        border: `1px solid ${theme === 'dark' ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.4)'}`,
                        backdropFilter: 'blur(12px)'
                      }}>
                      <div className="p-2">
                        <div className="text-xs font-semibold px-3 py-2"
                          style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                          SELECT MODE
                        </div>
                        {availableModes.map(m => (
                          <button
                            key={m.key}
                            onClick={() => {
                              setMode(m.key);
                              setShowModeSelector(false);
                              toast.success(`Switched to ${m.name}`);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200"
                            style={{
                              background: mode === m.key 
                                ? theme === 'dark' ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'
                                : 'transparent',
                              color: theme === 'dark' ? '#f1f5f9' : '#1e293b'
                            }}
                            onMouseEnter={(e) => {
                              if (mode !== m.key) {
                                e.currentTarget.style.background = theme === 'dark' ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (mode !== m.key) {
                                e.currentTarget.style.background = 'transparent';
                              }
                            }}>
                            {m.name}
                            {mode === m.key && ' ✓'}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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

              {/* New Chat */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearChat}
                className="p-2.5 rounded-xl transition-all duration-200"
                style={{
                  background: theme === 'dark' 
                    ? 'rgba(59,130,246,0.15)' 
                    : 'rgba(59,130,246,0.1)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.4)'}`,
                  color: theme === 'dark' ? '#93c5fd' : '#2563eb'
                }}
                title="New Conversation">
                <span className="text-lg">➕</span>
              </motion.button>

              {/* Clear Chat */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (confirm('Clear ALL conversations? This cannot be undone.')) {
                    MemoryManager.clearAllConversations();
                    window.location.reload();
                  }
                }}
                disabled={messages.length <= 1}
                className="p-2.5 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: theme === 'dark' 
                    ? 'rgba(239,68,68,0.15)' 
                    : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.4)'}`,
                  color: theme === 'dark' ? '#fca5a5' : '#dc2626'
                }}
                title="Clear All Conversations">
                <span className="text-lg">🗑️</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-2 sm:px-4 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-transparent">
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
                        {msg.metadata?.marks && (
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
                            📝 {msg.metadata.marks} Marks
                          </motion.span>
                        )}
                        {msg.metadata?.model && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap"
                            style={{ 
                              background: theme === 'dark' 
                                ? 'rgba(139,92,246,0.2)' 
                                : 'rgba(139,92,246,0.15)', 
                              color: theme === 'dark' ? '#c4b5fd' : '#7c3aed',
                              border: `1px solid ${theme === 'dark' ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.4)'}`
                            }}>
                            🤖 {msg.metadata.model}
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

          {/* Streaming Message */}
          {isStreaming && streamingMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start">
              <div
                className="max-w-[90%] sm:max-w-[85%] md:max-w-[75%] rounded-2xl rounded-tl-sm p-4 shadow-lg"
                style={{
                  background: theme === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(255,255,255,0.9)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(203,213,225,0.5)'}`,
                  color: theme === 'dark' ? '#f1f5f9' : '#1e293b'
                }}>
                <div className="flex items-start gap-2">
                  <span className="text-lg sm:text-xl flex-shrink-0">🎓</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-medium"
                        style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                        VTU Expert • Streaming...
                      </p>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-2 h-2 rounded-full"
                        style={{ background: theme === 'dark' ? '#818cf8' : '#6366f1' }}
                      />
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {streamingMessage}
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block ml-1">
                        ▊
                      </motion.span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {loading && !isStreaming && (
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
        <div className="flex-shrink-0 px-2 sm:px-4 pb-4">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            {/* Voice Input Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVoiceInput}
              disabled={loading || isStreaming}
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
                  : !(loading || isStreaming) && theme === 'dark'
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
              disabled={loading || isListening || isStreaming}
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
            
            {/* Send or Stop Button */}
            {isStreaming ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStopGeneration}
                className="flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#ffffff',
                  boxShadow: '0 4px 20px rgba(239,68,68,0.3)'
                }}
                title="Stop Generation">
                ⏹ Stop
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!input.trim() || loading}
                className="flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: theme === 'dark'
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'linear-gradient(135deg, #818cf8, #a78bfa)',
                  color: '#ffffff',
                  boxShadow: !input.trim() || loading
                    ? 'none'
                    : theme === 'dark'
                    ? '0 4px 20px rgba(99,102,241,0.3)'
                    : '0 2px 10px rgba(99,102,241,0.2)'
                }}
                title="Send Message">
                {loading ? '...' : 'Send'}
              </motion.button>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default AIChatBot;
