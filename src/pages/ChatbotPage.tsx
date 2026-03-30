import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader } from 'lucide-react';
import { chatbotService } from '../services/chatbotService';
import ChatMessage from '../components/ChatMessage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your travel assistant. Ask me anything about trips, packing, destinations or budget planning.",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "What should I pack for a beach trip?",
    "Best time to visit Kerala?",
    "Travel safety tips for solo travelers",
    "How to plan a budget trip?",
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🔥 fallback responses (VERY IMPORTANT)
  const getFallbackResponse = (text: string) => {
    const q = text.toLowerCase();

    if (q.includes('pack')) {
      return "For most trips: clothes, toiletries, charger, ID, medicines. For beaches: sunscreen, slippers. For mountains: warm layers.";
    }
    if (q.includes('kerala')) {
      return "Best time to visit Kerala is October to March for pleasant weather. Avoid heavy monsoon if sightseeing.";
    }
    if (q.includes('budget')) {
      return "For budget travel: book early, use trains/buses, stay in hostels, track expenses, and avoid peak season.";
    }
    if (q.includes('safety')) {
      return "Always share your itinerary, keep emergency contacts, avoid isolated areas at night, and keep copies of documents.";
    }

    return "I’m still learning 😅. Try asking about packing, destinations, or budget travel!";
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input;

    const userMsg: Message = {
      role: 'user',
      content: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let reply = '';

      try {
        reply = await chatbotService.detectIntentAndRespond(userText);
      } catch {
        reply = '';
      }

      // 🔥 fallback if service fails or empty
      if (!reply || reply.trim().length < 5) {
        reply = getFallbackResponse(userText);
      }

      // small delay → feels natural
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: reply,
            timestamp: new Date(),
          },
        ]);
        setLoading(false);
      }, 500);

    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: getFallbackResponse(userText),
          timestamp: new Date(),
        },
      ]);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 flex justify-center px-4 py-6">
        <div className="w-full max-w-3xl flex flex-col">

          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Travel Assistant</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Ask anything about trips, packing, destinations or budget
            </p>
          </div>

          {messages.length === 1 && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Try asking:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-left px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm hover:shadow-md transition border"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[400px]">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}

            {loading && (
              <div className="text-gray-500 flex items-center gap-2">
                <Loader className="animate-spin" size={16} />
                Thinking...
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow border">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your travel question..."
              className="flex-1 outline-none px-3 py-2 bg-transparent"
              disabled={loading}
            />

            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
            >
              <Send size={18} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;