import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize Gemini
let genAI: GoogleGenerativeAI | null = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
} else {
  console.warn('Gemini API key missing. Chatbot will use fallback.');
}

// System instructions (keep simple to avoid errors)
const SYSTEM_INSTRUCTIONS = `
You are a helpful travel assistant for the Roam Ready app.

Rules:
- Keep answers short (max 80 words)
- Give practical travel advice
- Do NOT include pricing
- Do NOT suggest booking links
- Focus on tips, planning, and safety
`;

// Limit user input
const MAX_MESSAGE_LENGTH = 500;

export const geminiService = {
  async sendMessage(userMessage: string): Promise<string> {
    try {
      // Safety checks
      if (!genAI) {
        return "Chatbot is not configured. Please try again later.";
      }

      if (!userMessage || userMessage.trim().length === 0) {
        return "Please enter a message.";
      }

      if (userMessage.length > MAX_MESSAGE_LENGTH) {
        return "Please keep your message shorter.";
      }

      // ✅ FIXED MODEL (IMPORTANT)
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const prompt = `
${SYSTEM_INSTRUCTIONS}

User: ${userMessage}
Answer:
`;

      // Generate response
      const result = await model.generateContent(prompt);

      const text = result?.response?.text();

      // Handle empty response
      if (!text || text.trim().length === 0) {
        return "Try asking about travel tips, packing, or destinations.";
      }

      // Limit output size (prevents crashes)
      return text.trim().slice(0, 500);

    } catch (error: any) {
      console.error("Gemini Error:", error);

      if (error?.message?.includes("API key")) {
        return "Invalid API key configuration.";
      }

      if (error?.message?.includes("quota")) {
        return "Usage limit reached. Please try again later.";
      }

      return "Chatbot is temporarily unavailable. Please try again.";
    }
  },

  validateApiKey(): boolean {
    return !!API_KEY && !!genAI;
  },
};