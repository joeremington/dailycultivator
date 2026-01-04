
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Habit, JournalEntry, AppUser } from '../types';
import { checkTierLimit } from '../services/tierService';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface AIChatProps {
  habits: Habit[];
  journalEntries: JournalEntry[];
  user: AppUser;
  onUserUpdate: (user: AppUser) => void;
  onNavigateToPricing: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ habits, journalEntries, user, onUserUpdate, onNavigateToPricing }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "DailyCultivator Performance Engine initialized. How can I help you optimize your workflows or analyze your growth metrics today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    // Check AI limit
    const aiCheck = checkTierLimit(user, 'aiRequestsPerDay');
    if (!aiCheck.allowed) {
      alert(`AI limit reached for your ${user.tier} tier. Upgrade for more.`);
      onNavigateToPricing();
      return;
    }

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `You are an expert productivity consultant. User data context: Habits: ${JSON.stringify(habits)}, Journal Archive: ${JSON.stringify(journalEntries.slice(0, 3))}. User query: ${userText}`,
        config: {
          systemInstruction: "You are a professional performance consultant. Provide objective, practical, and highly actionable advice. Avoid fluff.",
        }
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.text || "Communication timeout. Please re-verify parameters and resend." }]);
      // Increment AI usage
      onUserUpdate({
        ...user,
        usage: { ...user.usage, aiRequestsToday: user.usage.aiRequestsToday + 1 }
      });
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Service unavailable. Retrying connection to neural engine..." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[75vh] flex flex-col bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden transition-colors duration-300">
      <div className="bg-primary p-6 text-white flex items-center gap-4 shadow-lg">
         <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
            <i className="fa-solid fa-gauge-high text-xl"></i>
         </div>
         <div>
            <h3 className="font-black text-lg tracking-tight">Performance Consulting</h3>
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Logic-First Neural Interface</p>
         </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-950/30">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-primary text-white rounded-br-none shadow-primary/20' 
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700 font-medium'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] rounded-bl-none border border-gray-100 dark:border-gray-700">
                <div className="flex gap-1.5">
                   <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                   <div className="w-1.5 h-1.5 bg-primary/30 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
             </div>
           </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-4 transition-colors">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Analyze routine, troubleshoot blockers, or request data insight..."
          className="flex-1 px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:outline-none dark:text-white transition-all font-medium"
        />
        <button 
          type="submit"
          className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
        >
          <i className="fa-solid fa-bolt text-lg"></i>
        </button>
      </form>
    </div>
  );
};

export default AIChat;
