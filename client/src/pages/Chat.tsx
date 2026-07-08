import React, { useEffect, useState, useRef } from 'react';
import { api } from '../utils/api';
import { useNotifications } from '../context/NotificationContext';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Volume2, 
  Copy, 
  Mic, 
  MicOff, 
  Paperclip,
  Check,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';

export const Chat: React.FC = () => {
  const { addToast } = useNotifications();

  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const loadSessions = async () => {
    try {
      const res = await api.chat.listSessions();
      setSessions(res);
      if (res.length > 0 && !activeSession) {
        setActiveSession(res[0]);
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (activeSession) {
      loadMessages(activeSession.id);
    }
  }, [activeSession]);

  const loadMessages = async (sessionId: string) => {
    try {
      const res = await api.chat.listMessages(sessionId);
      setMessages(res);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCreateSession = async () => {
    try {
      const session = await api.chat.createSession(`Chat-${Date.now().toString().slice(-4)}`);
      setSessions(prev => [session, ...prev]);
      setActiveSession(session);
      addToast('Session Created', 'New RAG session initialized.', 'info');
    } catch (err: any) {
      addToast('Error', err.message, 'danger');
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.chat.deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSession?.id === id) {
        setActiveSession(null);
        setMessages([]);
      }
      addToast('Deleted', 'Conversation cleared.', 'info');
    } catch (err: any) {
      addToast('Error', err.message, 'danger');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || sending) return;
    
    let currentSession = activeSession;
    if (!currentSession) {
      try {
        currentSession = await api.chat.createSession('New Session');
        setSessions(prev => [currentSession, ...prev]);
        setActiveSession(currentSession);
      } catch (err) {
        console.error('Failed to auto-create session', err);
        return;
      }
    }

    setSending(true);
    setInputMessage('');
    
    // Optimistic User Msg
    const tempUserMsg = { id: 'temp-user', sender: 'user', content: text, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMsg]);
    scrollToBottom();

    try {
      const response = await api.chat.sendMessage(currentSession.id, text);
      // Replace with official records
      setMessages(prev => prev.filter(m => m.id !== 'temp-user').concat([response.userMessage, response.assistantMessage]));
      scrollToBottom();
    } catch (error: any) {
      addToast('Failed to reply', error.message, 'danger');
    } finally {
      setSending(false);
    }
  };

  // Text to Speech voice audio helper
  const handleTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Strip markdown tags before reading
      const cleanText = text.replace(/[*#`_\-]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      window.speechSynthesis.speak(utterance);
      addToast('Audio Reader', 'Playing assistant response narration.', 'info');
    } else {
      addToast('TTS Error', 'Voice synthesis is not supported on this browser.', 'warning');
    }
  };

  // Clipboard copy
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('Copied', 'Message copied to clipboard.', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Web Speech recognition (STT) mic input toggling
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      addToast('STT Error', 'Speech recognition is not supported in this browser.', 'warning');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
      addToast('Listening...', 'Speak clearly into your microphone.', 'info');
    };

    recognition.onerror = (e: any) => {
      console.error(e);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setInputMessage(speechToText);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const promptSuggestions = [
    'What is our standard maternity leave duration?',
    'What were our achieved sales revenues in Q1 2026?',
    'What tech stack does Project CloudPilot build on?'
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      
      {/* 1. Left Chat Session List */}
      <div className="w-64 border-r border-slate-200/60 dark:border-slate-800/40 bg-white/30 dark:bg-slate-900/40 backdrop-blur-md flex flex-col justify-between flex-shrink-0">
        <div className="p-4 flex-1 overflow-y-auto">
          <button
            onClick={handleCreateSession}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-slate-350 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-brand-500/50 hover:text-brand-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Conversation</span>
          </button>

          <div className="mt-6 space-y-1.5">
            {sessions.map((s) => {
              const isActive = activeSession?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSession(s)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between group transition-all ${
                    isActive
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <span className="truncate pr-2">{s.title}</span>
                  <Trash2
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-rose-500 hover:scale-110 transition-all flex-shrink-0"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Right Chat Screen */}
      <div className="flex-1 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-950/20">
        
        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center space-y-8 pt-12 animate-slide-up">
              <div className="bg-gradient-to-tr from-brand-500 to-accent-500 p-4 rounded-3xl text-white shadow-xl shadow-brand-500/10 w-fit mx-auto">
                <Bot className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
                  CloudPilot AI Knowledge Assistant
                </h2>
                <p className="text-xs text-slate-400 mt-2">
                  Ask me anything about company guidelines, sales targets, or technical specs.
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                {promptSuggestions.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-brand-500/30 text-xs font-semibold text-slate-600 dark:text-slate-450 hover:text-brand-500 dark:hover:text-brand-400 shadow-sm transition-all text-left flex flex-col justify-between h-28 hover:-translate-y-0.5"
                  >
                    <span>{prompt}</span>
                    <Sparkles className="h-3.5 w-3.5 text-slate-400 mt-2 self-end flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div key={m.id} className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    
                    {/* Bot Avatar */}
                    {!isUser && (
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
                        <Bot className="h-5 w-5" />
                      </div>
                    )}

                    <div className={`max-w-[80%] rounded-2xl p-4 border text-xs shadow-sm ${
                      isUser
                        ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white border-transparent'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200/60 dark:border-slate-800/50'
                    }`}>
                      {/* Message Content */}
                      <div className="leading-relaxed whitespace-pre-wrap font-sans">
                        {m.content}
                      </div>

                      {/* Source references lists (RAG citations) */}
                      {!isUser && m.source_documents && m.source_documents.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50 flex flex-wrap gap-2">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 w-full font-bold">
                            <Paperclip className="h-3 w-3" /> References
                          </span>
                          {m.source_documents.map((doc: any) => (
                            <div
                              key={doc.id}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200/40 dark:border-slate-800 text-[10px]"
                            >
                              <FileText className="h-3 w-3 text-brand-500" />
                              <span>{doc.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Msg actions (TTS / Copy) */}
                      {!isUser && m.id !== 'temp-user' && (
                        <div className="flex items-center gap-2 mt-3 text-slate-400 dark:text-slate-500">
                          <button
                            onClick={() => handleCopy(m.id, m.content)}
                            className="hover:text-slate-700 dark:hover:text-slate-350 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-850"
                          >
                            {copiedId === m.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => handleTTS(m.content)}
                            className="hover:text-slate-700 dark:hover:text-slate-350 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-850"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* User Avatar */}
                    {isUser && (
                      <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm flex-shrink-0">
                        <User className="h-5 w-5" />
                      </div>
                    )}

                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Text Input Panel */}
        <div className="p-6 border-t border-slate-200/60 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
          <div className="max-w-3xl mx-auto flex gap-3 relative">
            
            {/* Input area */}
            <input
              type="text"
              placeholder={isRecording ? 'Listening...' : 'Type message here...'}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
              disabled={isRecording || sending}
              className="flex-1 bg-slate-100 dark:bg-slate-900/50 pl-4 pr-24 py-3 rounded-2xl text-xs border border-transparent focus:border-brand-500/20 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-slate-800 dark:text-slate-200"
            />

            {/* Mic voice triggers button */}
            <div className="absolute right-16 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={sending}
                className={`p-1.5 rounded-lg transition-colors ${
                  isRecording 
                    ? 'bg-rose-500/20 text-rose-500 animate-pulse' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                {isRecording ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
              </button>
            </div>

            {/* Send button */}
            <button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim() || sending}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-40 p-3 rounded-2xl text-white shadow-md shadow-brand-500/10 transition-colors flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
export default Chat;
