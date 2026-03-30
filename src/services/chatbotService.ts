import { supabase } from './supabase';
import { geminiService } from './geminiService';

interface ChatbotData {
  id: string;
  intent: string;
  keywords: string[];
  response: string;
}

export const chatbotService = {
  async detectIntentAndRespond(userMessage: string): Promise<string> {
    try {
      // 🛑 validation
      if (!userMessage || userMessage.trim().length === 0) {
        return "Please type a message.";
      }

      const message = userMessage.toLowerCase().trim();

      // 🔥 STEP 0: instant local fallback (FAST UX)
      if (message.includes("pack")) {
        return "Pack essentials: clothes, toiletries, charger, ID, and medicines. Add sunscreen for beaches and jackets for mountains.";
      }

      if (message.includes("budget")) {
        return "For budget travel: book early, use trains/buses, stay in hostels, and avoid peak seasons.";
      }

      if (message.includes("kerala")) {
        return "Best time to visit Kerala is October to March for pleasant weather.";
      }

      // 🔹 STEP 1: Fetch only needed data (OPTIMIZED)
      const { data, error } = await supabase
        .from('chatbot_data')
        .select('intent, keywords, response');

      if (!error && data?.length) {
        for (const entry of data as ChatbotData[]) {
          const keywords = entry.keywords || [];

          const isMatch = keywords.some((keyword: string) =>
            message.includes(keyword.toLowerCase())
          );

          if (isMatch) {
            return entry.response;
          }
        }
      }

      // 🔹 STEP 2: Gemini AI fallback
      let geminiResponse = "";
      try {
        geminiResponse = await geminiService.sendMessage(userMessage);
      } catch (err) {
        console.error("Gemini error:", err);
      }

      if (geminiResponse && geminiResponse.trim().length > 5) {
        return geminiResponse;
      }

      // 🔥 FINAL FALLBACK (never let chatbot feel dead)
      return "I’m still learning 😅. Try asking about packing, budget travel, destinations, or safety tips.";

    } catch (error) {
      console.error("Chatbot Service Error:", error);

      return "Something went wrong. Please try again.";
    }
  },
};