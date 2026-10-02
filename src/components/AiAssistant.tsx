import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Minus,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Play,
  Pause,
  Square,
  AlertCircle
} from 'lucide-react';
import { Product } from '../types/product';
import { getProductKnowledge } from '../services/productService';
import { voiceService } from '../services/voiceService';
import { formatPrice, getBuyToolUrl, TELEGRAM_BASE_URL, TELEGRAM_USERNAME } from '../utils/telegram';
import blackHatLogoImg from '../assets/images/bhodt_black_hat_logo_1790928314687.jpg';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  products?: Product[];
  actions?: string[];
  mode?: 'ai_powered' | 'basic_assistant_mode';
}

interface AiAssistantProps {
  theme: 'dark' | 'light';
  currentProduct?: Product | null;
  activeTab?: string;
  onOpenProductModal?: (product: Product) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  theme,
  currentProduct = null,
  activeTab = 'home',
  onOpenProductModal,
  onNavigateSection,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [language, setLanguage] = useState<'en' | 'si'>('en');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load product catalog for dynamic knowledge base
  useEffect(() => {
    getProductKnowledge().then((data) => {
      setAllProducts(data);
    });
  }, []);

  const welcomeMessageEn =
    "Hello! I'm BHODT AI, your 24/7 digital assistant. I can help you explore our tools, check product information, prices, features and guide you through purchasing.";
  const welcomeMessageSi =
    "ආයුබෝවන්! මම BHODT AI, ඔබගේ 24/7 ඩිජිටල් සහයකයා. අපගේ tools, මිල ගණන්, විශේෂාංග පරීක්ෂා කිරීමට සහ මිලදී ගැනීමේ ක්‍රියාවලියට මට ඔබට උදව් කළ හැක.";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: welcomeMessageEn,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: ['EXPLORE TOOLS', 'CHECK PRICES', 'FIND A TOOL', 'CONTACT BHODT'],
    },
  ]);

  // Update welcome message if language switches initially
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome-msg') {
      setMessages([
        {
          id: 'welcome-msg',
          sender: 'ai',
          text: language === 'si' ? welcomeMessageSi : welcomeMessageEn,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: ['EXPLORE TOOLS', 'CHECK PRICES', 'FIND A TOOL', 'CONTACT BHODT'],
        },
      ]);
    }
  }, [language]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Focus input when opening chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, isMinimized]);

  // 1. Send Message to Backend / AI Answering Engine
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage('');
    setSpeechError(null);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language,
          context: {
            page: window.location.pathname || 'index.html',
            productId: currentProduct ? currentProduct.id : null,
            productName: currentProduct ? currentProduct.name : null,
            activeTab,
          },
          history: messages.slice(-5).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('AI Server responded with an error');
      }

      const data = await response.json();

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || "I'm here to assist you with BHODT digital tools.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        products: data.products || [],
        actions: data.actions || [],
        mode: data.mode,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.warn('Backend unavailable, running dynamic client-side knowledge engine:', err);
      // Seamless offline fallback execution
      const fallbackMsg = runClientSideKnowledge(text, allProducts, currentProduct, language);
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side fallback rule engine when server is unreachable
  const runClientSideKnowledge = (
    text: string,
    productsList: Product[],
    ctxProduct: Product | null,
    lang: 'en' | 'si'
  ): Message => {
    const q = text.toLowerCase();
    const isSi = lang === 'si' || /[\u0D80-\u0DFF]|keeyada|kiyada|ganne|mila/.test(q);

    // Check specific tool match
    const matched = productsList.find(
      (p) =>
        q.includes(p.name.toLowerCase()) ||
        q.includes(p.id.toLowerCase()) ||
        (p.name.split(' ').some((word) => word.length > 3 && q.includes(word.toLowerCase())))
    ) || (q.includes('this') || q.includes('meka') ? ctxProduct : null);

    if (matched) {
      if (q.includes('buy') || q.includes('purchase') || q.includes('order') || q.includes('ganne')) {
        return {
          id: `ai-fb-${Date.now()}`,
          sender: 'ai',
          text: isSi
            ? `**${matched.name}** මිලදී ගැනීමට:\n• මිල: **${formatPrice(matched.price)}**\n• තත්ත්වය: **${matched.status}**\n\nසෘජු මිලදී ගැනීම සඳහා පහත "BUY NOW VIA TELEGRAM" බොත්තම ඔබන්න.`
            : `To purchase **${matched.name}**:\n• Price: **${formatPrice(matched.price)}**\n• Status: **${matched.status}**\n• Version: v${matched.version}\n\nClick the button below to message BHODT on Telegram @blackhatmrx with your pre-filled order.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          products: [matched],
          actions: ['CONTACT BHODT', 'EXPLORE TOOLS'],
          mode: 'basic_assistant_mode',
        };
      }

      return {
        id: `ai-fb-${Date.now()}`,
        sender: 'ai',
        text: `**${matched.name}**\n• Price: **${formatPrice(matched.price)}**\n• Status: **${matched.status}**\n• Category: ${matched.category}\n• Platform: ${matched.platform}\n\n${matched.description}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        products: [matched],
        actions: ['BUY NOW', 'CHECK PRICES', 'EXPLORE TOOLS'],
        mode: 'basic_assistant_mode',
      };
    }

    if (q.includes('price') || q.includes('keeyada') || q.includes('cost')) {
      const list = productsList.map((p) => `• **${p.name}**: ${formatPrice(p.price)} [${p.status}]`).join('\n');
      return {
        id: `ai-fb-${Date.now()}`,
        sender: 'ai',
        text: isSi
          ? `සියලුම BHODT tools වල වත්මන් මිල ගණන් මෙන්න:\n\n${list}`
          : `Here are the current prices for all BHODT tools in LKR:\n\n${list}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        products: productsList.slice(0, 3),
        actions: ['BUY NOW', 'EXPLORE TOOLS', 'CONTACT BHODT'],
        mode: 'basic_assistant_mode',
      };
    }

    if (q.includes('tool') || q.includes('what tools') || q.includes('list')) {
      const avail = productsList.filter((p) => p.status === 'AVAILABLE');
      return {
        id: `ai-fb-${Date.now()}`,
        sender: 'ai',
        text: isSi
          ? `දැනට ලබාගත හැකි BHODT Tools ${avail.length}ක් ඇත. පහතින් බලන්න:`
          : `We currently have ${avail.length} available digital tools built by BHODT. You can inspect features or order directly:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        products: avail,
        actions: ['CHECK PRICES', 'CONTACT BHODT'],
        mode: 'basic_assistant_mode',
      };
    }

    if (q.includes('contact') || q.includes('telegram')) {
      return {
        id: `ai-fb-${Date.now()}`,
        sender: 'ai',
        text: `You can reach BHODT development team directly on Telegram: **@${TELEGRAM_USERNAME}** (${TELEGRAM_BASE_URL}).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        products: [],
        actions: ['OPEN TELEGRAM', 'EXPLORE TOOLS'],
        mode: 'basic_assistant_mode',
      };
    }

    return {
      id: `ai-fb-${Date.now()}`,
      sender: 'ai',
      text: isSi
        ? "මම BHODT AI. ඔබට අවශ්‍ය tool එකක නමක් හෝ මිලක් ගැන අසන්න."
        : "I'm BHODT AI. Ask me about any specific tool, price in LKR, features, or how to order via Telegram @blackhatmrx.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      products: productsList.slice(0, 2),
      actions: ['EXPLORE TOOLS', 'CHECK PRICES', 'CONTACT BHODT'],
      mode: 'basic_assistant_mode',
    };
  };

  // 2. Voice Input (Speech Recognition)
  const toggleVoiceInput = () => {
    if (isListening) {
      voiceService.stopVoiceInput();
      setIsListening(false);
      return;
    }

    setSpeechError(null);
    if (!voiceService.isSpeechRecognitionSupported()) {
      setSpeechError('Voice input is not supported by this browser. Please use text chat.');
      return;
    }

    voiceService.startVoiceInput(
      {
        onStart: () => setIsListening(true),
        onEnd: () => setIsListening(false),
        onResult: (transcript) => {
          setIsListening(false);
          setInputMessage(transcript);
          handleSendMessage(transcript);
        },
        onError: (err) => {
          setIsListening(false);
          setSpeechError(err);
        },
      },
      language
    );
  };

  // 3. Voice Output (Speech Synthesis)
  const handleSpeakMessage = (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      voiceService.stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(msgId);
    voiceService.speakAIResponse(
      text,
      language,
      () => setSpeakingMessageId(null),
      () => setSpeakingMessageId(null)
    );
  };

  // Quick Action Click
  const handleQuickAction = (action: string) => {
    if (action === 'EXPLORE TOOLS' || action === 'FIND A TOOL') {
      onNavigateSection?.('marketplace-section');
      handleSendMessage('What tools are currently available?');
    } else if (action === 'CHECK PRICES') {
      handleSendMessage('Show me the prices of all BHODT tools in LKR');
    } else if (action === 'CONTACT BHODT' || action === 'OPEN TELEGRAM') {
      window.open(TELEGRAM_BASE_URL, '_blank', 'noopener,noreferrer');
    } else if (action.startsWith('BUY ')) {
      const toolName = action.replace('BUY ', '');
      handleSendMessage(`I want to buy ${toolName}`);
    } else {
      handleSendMessage(action);
    }
  };

  const handleClearChat = () => {
    voiceService.stopSpeaking();
    voiceService.stopVoiceInput();
    setSpeakingMessageId(null);
    setIsListening(false);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: language === 'si' ? welcomeMessageSi : welcomeMessageEn,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: ['EXPLORE TOOLS', 'CHECK PRICES', 'FIND A TOOL', 'CONTACT BHODT'],
      },
    ]);
  };

  return (
    <>
      {/* 1. Floating AI Assistant Launch Button (Bottom Right) */}
      {!isOpen && (
        <aside
          aria-label="BHODT AI 24/7 Digital Assistant"
          className="fixed bottom-6 right-6 z-50 animate-bounce-subtle"
        >
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            aria-label="Open BHODT AI 24/7 Digital Assistant"
            className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#0A0A0A]/95 text-white border-2 border-[#00FF66] shadow-[0_0_25px_rgba(0,255,102,0.5),0_0_40px_rgba(0,229,255,0.3)] hover:shadow-[0_0_40px_rgba(0,255,102,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer backdrop-blur-xl"
          >
            {/* Black Hat Logo Badge with Pulse */}
            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-[#00FF66] shadow-[0_0_10px_#00FF66] shrink-0">
              <img
                src={blackHatLogoImg}
                alt="BHODT"
                className="w-full h-full object-cover"
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-ping" />
            </div>

            <div className="flex flex-col text-left leading-none">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xs tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#00FF66] to-[#00FF66]">
                  BHODT AI
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
              </div>
              <span className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase font-semibold mt-0.5">
                24/7 ASSISTANT
              </span>
            </div>

            {/* Glowing Accent Badge */}
            <div className="ml-1 p-1 rounded-full bg-[#00FF66]/20 text-[#00FF66] group-hover:rotate-12 transition-transform">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </button>
        </aside>
      )}

      {/* 2. Glassmorphic Chat Window */}
      {isOpen && (
        <section
          aria-label="BHODT AI Chat Assistant"
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? 'bottom-6 right-6 w-72 h-14 rounded-2xl overflow-hidden'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] md:w-[450px] h-[580px] max-h-[85vh] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,255,102,0.25)] border border-[#00FF66]/40 flex flex-col backdrop-blur-2xl'
          } ${
            theme === 'dark' ? 'bg-[#0A0A0A]/95 text-white' : 'bg-neutral-900/95 text-white'
          }`}
        >
          {/* Header Bar */}
          <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-black/60 relative select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-[#00FF66] shadow-[0_0_10px_rgba(0,255,102,0.4)] shrink-0">
                <img src={blackHatLogoImg} alt="BHODT" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#00FF66] to-[#00FF66]">
                    BHODT AI
                  </h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
                    ONLINE
                  </span>
                </div>
                <p className="text-[10px] font-mono text-neutral-400 tracking-wider">
                  24/7 DIGITAL ASSISTANT · BLACK HAT TEAM
                </p>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center gap-1.5">
              {/* Language Selector (EN / සිං) */}
              <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 text-[10px] font-mono font-bold mr-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                    language === 'en'
                      ? 'bg-[#00FF66] text-black font-extrabold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Switch to English"
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('si')}
                  className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                    language === 'si'
                      ? 'bg-[#00FF66] text-black font-extrabold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Switch to Sinhala"
                >
                  සිං
                </button>
              </div>

              {/* Clear Chat */}
              {!isMinimized && (
                <button
                  onClick={handleClearChat}
                  title="Clear chat history"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Minimize / Expand */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  voiceService.stopSpeaking();
                  voiceService.stopVoiceInput();
                  setIsOpen(false);
                }}
                title="Close BHODT AI"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-[#FF1744] hover:bg-[#FF1744]/10 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Context Banner (If looking at a specific tool) */}
              {currentProduct && (
                <div className="px-3.5 py-1.5 bg-[#00E5FF]/10 border-b border-[#00E5FF]/20 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-300 truncate font-mono">
                    Viewing: <strong className="text-[#00E5FF]">{currentProduct.name}</strong> ({formatPrice(currentProduct.price)})
                  </span>
                  <span className="text-[10px] text-[#00E5FF] font-bold shrink-0 ml-2">Active Context</span>
                </div>
              )}

              {/* Speech Error Banner */}
              {speechError && (
                <div className="px-3 py-1.5 bg-[#FF1744]/20 border-b border-[#FF1744]/30 text-[#FF1744] text-xs flex items-center justify-between">
                  <span>{speechError}</span>
                  <button onClick={() => setSpeechError(null)} className="p-0.5 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Chat Message Scrollable Viewport */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans scrollbar-thin">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 relative leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#00FF66] text-[#0A0A0A] font-medium shadow-[0_0_15px_rgba(0,255,102,0.3)] rounded-br-none'
                          : 'bg-[#141414] text-neutral-200 border border-white/10 shadow-lg rounded-bl-none'
                      }`}
                    >
                      {/* Message Content with Markdown rendering */}
                      <div className="whitespace-pre-wrap break-words">
                        {msg.text.split('\n').map((line, idx) => {
                          // Format bold text
                          const boldFormatted = line.split(/(\*\*.*?\*\*)/).map((part, pIdx) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return (
                                <strong key={pIdx} className="font-extrabold text-white">
                                  {part.slice(2, -2)}
                                </strong>
                              );
                            }
                            return part;
                          });

                          return (
                            <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>
                              {boldFormatted}
                            </p>
                          );
                        })}
                      </div>

                      {/* AI Message Footer: Timestamp, Voice TTS Speaker, Offline Badge */}
                      {msg.sender === 'ai' && (
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5 text-[10px] text-neutral-400">
                          <span className="font-mono">{msg.timestamp}</span>

                          <div className="flex items-center gap-2">
                            {msg.mode === 'basic_assistant_mode' && (
                              <span className="text-[9px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-1.5 py-0.5 rounded border border-[#00E5FF]/20">
                                24/7 Knowledge
                              </span>
                            )}

                            {/* Voice Output Speaker Button */}
                            <button
                              onClick={() => handleSpeakMessage(msg.id, msg.text)}
                              title={speakingMessageId === msg.id ? 'Stop Voice Output' : 'Read aloud with AI voice'}
                              className={`p-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                                speakingMessageId === msg.id
                                  ? 'text-[#00FF66] bg-[#00FF66]/20 animate-pulse'
                                  : 'text-neutral-400 hover:text-white'
                              }`}
                            >
                              {speakingMessageId === msg.id ? (
                                <>
                                  <Square className="w-3 h-3 fill-current" />
                                  <span className="text-[9px] font-mono">Stop</span>
                                </>
                              ) : (
                                <Volume2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Attached Product Cards in AI response */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="w-full max-w-[90%] mt-2 space-y-2">
                        {msg.products.map((prod) => (
                          <div
                            key={prod.id}
                            className="p-3 rounded-xl bg-black/80 border border-[#00FF66]/30 shadow-[0_0_15px_rgba(0,255,102,0.15)] flex flex-col gap-2 hover:border-[#00FF66] transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-mono uppercase text-[#00E5FF] font-bold">
                                  {prod.category} · v{prod.version}
                                </span>
                                <h4 className="font-bold text-sm text-white leading-tight mt-0.5">
                                  {prod.name}
                                </h4>
                              </div>
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                                  prod.status === 'AVAILABLE'
                                    ? 'bg-[#00FF66]/15 text-[#00FF66] border-[#00FF66]/40'
                                    : 'bg-[#FF1744]/15 text-[#FF1744] border-[#FF1744]/40'
                                }`}
                              >
                                {prod.status}
                              </span>
                            </div>

                            <p className="text-[11px] text-neutral-300 line-clamp-2">
                              {prod.description}
                            </p>

                            <div className="flex items-center justify-between pt-1 border-t border-white/10">
                              <span className="font-display font-extrabold text-sm text-[#00FF66]">
                                {formatPrice(prod.price)}
                              </span>

                              <div className="flex items-center gap-1.5">
                                {onOpenProductModal && (
                                  <button
                                    onClick={() => onOpenProductModal(prod)}
                                    className="px-2 py-1 rounded text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                                  >
                                    Details
                                  </button>
                                )}

                                <a
                                  href={getBuyToolUrl(prod)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded text-[11px] font-bold bg-[#00FF66] text-[#0A0A0A] hover:bg-[#00e65c] transition-all flex items-center gap-1 shadow-sm"
                                >
                                  <span>BUY NOW</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Suggestion Actions */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.actions.map((act, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleQuickAction(act)}
                            className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-white/5 border border-white/15 text-neutral-300 hover:text-white hover:border-[#00FF66] hover:bg-[#00FF66]/10 transition-all cursor-pointer"
                          >
                            {act}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* AI Thinking Animation */}
                {isLoading && (
                  <div className="flex items-center gap-2 text-neutral-400 text-xs">
                    <div className="w-6 h-6 rounded-lg bg-black border border-[#00FF66] flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-[#00FF66] animate-spin" />
                    </div>
                    <div className="flex items-center gap-1 bg-[#141414] px-3 py-2 rounded-xl border border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF1744] animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="ml-1 text-[11px] font-mono text-neutral-400">BHODT AI checking live data...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Voice Listening Active Pulse Banner */}
              {isListening && (
                <div className="px-4 py-2 bg-[#00E5FF]/20 border-t border-[#00E5FF]/40 flex items-center justify-between text-xs text-[#00E5FF] animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping" />
                    <span className="font-mono font-bold">Listening... Speak now</span>
                  </div>
                  <button
                    onClick={toggleVoiceInput}
                    className="text-[10px] font-mono underline hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Footer Input Area */}
              <div className="p-3 border-t border-white/10 bg-black/70">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      language === 'si'
                        ? 'BHODT AI ගෙන් ඕනෑම දෙයක් අසන්න...'
                        : 'Ask BHODT AI anything...'
                    }
                    className="flex-1 bg-[#141414] border border-white/15 focus:border-[#00FF66] focus:shadow-[0_0_10px_rgba(0,255,102,0.3)] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-all"
                  />

                  {/* Voice Input (Microphone) */}
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    title={isListening ? 'Stop listening' : 'Speak to BHODT AI'}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isListening
                        ? 'bg-[#FF1744] text-white border-[#FF1744] shadow-[0_0_15px_#FF1744]'
                        : 'bg-[#141414] text-[#00E5FF] border-white/15 hover:border-[#00E5FF] hover:bg-[#00E5FF]/10'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    title="Send message"
                    className="p-2.5 rounded-xl bg-[#00FF66] text-[#0A0A0A] hover:bg-[#00e65c] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_10px_rgba(0,255,102,0.4)] cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="flex items-center justify-between mt-2 text-[9px] font-mono text-neutral-500">
                  <span>Telegram: @{TELEGRAM_USERNAME}</span>
                  <span className="text-[#00FF66]">● 24/7 Verified AI Assistant</span>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
};
