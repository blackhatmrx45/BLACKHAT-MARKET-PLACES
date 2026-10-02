import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDatabase, db } from './server/db';
import authRoutes from './server/routes/authRoutes';
import userRoutes from './server/routes/userRoutes';
import adminRoutes from './server/routes/adminRoutes';
import productRoutes from './server/routes/productRoutes';
import { optionalAuth, AuthRequest } from './server/middleware/auth';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cookieParser());

// Initialize MySQL / Persistent Database
initDatabase();

// Initialize GoogleGenAI SDK with server-side API key and User-Agent telemetry
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Dynamic Product Knowledge Provider directly querying Database
export async function getLiveProductKnowledge() {
  try {
    const products = await db.query('SELECT * FROM products ORDER BY id ASC');
    return products.map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: `${Number(p.price)} ${p.currency || 'LKR'}`,
      version: p.version,
      platform: p.platform,
      status: p.status,
      description: p.description,
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
      requirements: p.requirements,
      license: p.license,
      lastUpdated: p.last_updated,
      supportInfo: p.support_info || 'WhatsApp: 0724332896 / Telegram: @blackhatmrx',
    }));
  } catch (err) {
    return [];
  }
}

// REST API Routers
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);

// BHODT AI 24/7 Chat Assistant Endpoint (Integrated with Auth & Database)
app.post('/api/ai/chat', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { message, context, language = 'en', history = [], conversationId } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const liveProducts = await getLiveProductKnowledge();
    const userId = req.user ? req.user.id : null;

    // Handle Conversation Persistence if authenticated
    let activeConvId = conversationId ? Number(conversationId) : null;
    if (userId) {
      if (!activeConvId) {
        // Create new conversation
        const titleSnippet = message.slice(0, 35) + (message.length > 35 ? '...' : '');
        const convResult = await db.execute(
          'INSERT INTO ai_conversations (user_id, title) VALUES (?, ?)',
          [userId, titleSnippet]
        );
        activeConvId = convResult.insertId || null;
      }

      // Record user message
      if (activeConvId) {
        await db.execute(
          'INSERT INTO ai_messages (conversation_id, sender, message) VALUES (?, ?, ?)',
          [activeConvId, 'user', message]
        );
      }
    }

    // If Gemini API is available, use Gemini 3.8 Flash
    if (ai) {
      const systemInstruction = `
You are BHODT AI, the official 24/7 Digital Assistant for the BHODT Digital Tools Marketplace (BLACK_HAR_OFFICIAL_DEVELOPING_TEAM).
Website Owner & Developer Contact: Telegram @blackhatmrx / WhatsApp 0724332896.

PERSONALITY & TONE:
- Professional, friendly, helpful, concise, technology-focused, and easy to understand.
- Never claim something that is not known. Never invent product features, prices, or tools.
- If information is not in the live database, say: "I don't have that information yet. Please contact BHODT on Telegram (@blackhatmrx) or WhatsApp (0724332896) for confirmation."

SAFETY RULES:
- Never provide instructions for malware creation, trojans, credential theft, phishing, unauthorized access, DDoS, or illegal hacking.
- All cybersecurity tools and advice must be strictly for legitimate defensive security, authorized testing, or education.

LIVE PRODUCT DATABASE (SINGLE SOURCE OF TRUTH - REAL TIME):
${JSON.stringify(liveProducts, null, 2)}

AUTHENTICATED USER CONTEXT:
- Authenticated: ${userId ? `Yes (User ID #${userId}, ${req.user?.username})` : 'No (Guest)'}
- Current Page: ${context?.page || 'index.html'}
- Current Product ID: ${context?.productId || 'none'}
- Active Section: ${context?.activeTab || 'home'}
- Preferred Language: ${language === 'si' ? 'Sinhala' : 'English'}

PURCHASE ASSISTANCE:
If the user indicates they want to buy a tool:
1. Identify the tool from the live database.
2. State its price in LKR and availability status.
3. Provide purchase instructions via Telegram @blackhatmrx or WhatsApp 0724332896.
4. Output matching tool id in "matchingProductIds".

LANGUAGE INSTRUCTIONS:
- Support English and Sinhala (including Singlish).
- Answer in the same language. Do NOT translate product names.

OUTPUT FORMAT:
Respond with a JSON object:
{
  "reply": "Your clear conversational response",
  "matchingProductIds": ["tool-001"],
  "suggestedActions": ["EXPLORE TOOLS", "CHECK PRICES", "CONTACT BHODT"]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          ...history.slice(-6).map((h: { sender: string; text: string }) => ({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          })),
          { role: 'user', parts: [{ text: message }] },
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const text = response.text || '{}';
      try {
        const parsed = JSON.parse(text);
        const matchingProducts = liveProducts.filter((p: any) =>
          parsed.matchingProductIds?.includes(p.id)
        );

        // Record AI response to database if conversation is active
        if (userId && activeConvId) {
          await db.execute(
            'INSERT INTO ai_messages (conversation_id, sender, message) VALUES (?, ?, ?)',
            [activeConvId, 'ai', parsed.reply]
          );
        }

        res.json({
          reply: parsed.reply,
          products: matchingProducts,
          actions: parsed.suggestedActions || [],
          conversationId: activeConvId,
          mode: 'ai_powered',
        });
        return;
      } catch (e) {
        // Fallback if parsing fails
        if (userId && activeConvId) {
          await db.execute(
            'INSERT INTO ai_messages (conversation_id, sender, message) VALUES (?, ?, ?)',
            [activeConvId, 'ai', text]
          );
        }

        res.json({
          reply: text,
          products: [],
          actions: ['EXPLORE TOOLS', 'CONTACT BHODT'],
          conversationId: activeConvId,
          mode: 'ai_powered',
        });
        return;
      }
    }

    // Offline / Local Smart Fallback Engine
    const rawProducts = await db.query('SELECT * FROM products');
    const fallbackResponse = runLocalKnowledgeEngine(message, rawProducts, context, language);

    if (userId && activeConvId) {
      await db.execute(
        'INSERT INTO ai_messages (conversation_id, sender, message) VALUES (?, ?, ?)',
        [activeConvId, 'ai', fallbackResponse.reply]
      );
    }

    res.json({
      ...fallbackResponse,
      conversationId: activeConvId,
    });
  } catch (error: any) {
    console.error('AI chat endpoint error:', error);
    const rawProducts = await db.query('SELECT * FROM products');
    const fallback = runLocalKnowledgeEngine(
      req.body.message || '',
      rawProducts,
      req.body.context,
      req.body.language
    );
    res.json(fallback);
  }
});

function runLocalKnowledgeEngine(message: string, productsList: any[], context: any, language: string) {
  const query = (message || '').toLowerCase().trim();
  const isSinhala = language === 'si' || /[\u0D80-\u0DFF]|keeyada|kiyada|ganne|thiyenawada/.test(query);

  if (query.match(/^(hi|hello|hey|ayubowan)/)) {
    return {
      reply: isSinhala
        ? "ආයුබෝවන්! මම BHODT AI, ඔබගේ 24/7 ඩිජිටල් සහයකයා. අපගේ tools, මිල ගණන් සහ purchase විස්තර දැනගැනීමට මට උදවු කළ හැක."
        : "Hello! I'm BHODT AI, your 24/7 digital assistant. I can help you explore our digital tools, check prices, features, availability, and guide you through purchasing.",
      products: [],
      actions: ['EXPLORE TOOLS', 'CHECK PRICES', 'CONTACT BHODT'],
      mode: 'basic_assistant_mode',
    };
  }

  if (query.includes('tool') || query.includes('list') || query.includes('what')) {
    const list = productsList.map((p) => `• **${p.name}** (${p.category}) - ${p.price} LKR [${p.status}]`).join('\n');
    return {
      reply: isSinhala
        ? `දැනට ලබාගත හැකි BHODT tools මෙන්න:\n\n${list}`
        : `Here are the currently available BHODT digital tools:\n\n${list}\n\nAsk me about any tool's features, requirements, or purchase details!`,
      products: productsList.slice(0, 4),
      actions: ['CHECK PRICES', 'BUY NOW', 'CONTACT BHODT'],
      mode: 'basic_assistant_mode',
    };
  }

  const matched = productsList.find((p) => {
    const pName = p.name.toLowerCase();
    return query.includes(pName) || query.includes(p.id.toLowerCase());
  });

  if (matched) {
    if (query.includes('buy') || query.includes('order') || query.includes('purchase')) {
      return {
        reply: isSinhala
          ? `**${matched.name}** මිලදී ගැනීම සඳහා:\n• මිල: **${matched.price} LKR**\n• තත්ත්වය: **${matched.status}**\n\nWhatsApp (0724332896) හෝ Telegram (@blackhatmrx) ඔස්සේ සම්බන්ධ වන්න.`
          : `To purchase **${matched.name}**:\n• Price: **${matched.price} LKR**\n• Status: **${matched.status}**\n• Version: v${matched.version}\n\nDirect orders are processed via WhatsApp: 0724332896 or Telegram: @blackhatmrx.`,
        products: [matched],
        actions: [`BUY ${matched.name}`, 'CONTACT BHODT'],
        mode: 'basic_assistant_mode',
      };
    }

    return {
      reply: `**${matched.name}**\n• Price: **${matched.price} LKR**\n• Status: **${matched.status}**\n• Category: ${matched.category}\n\n${matched.description}`,
      products: [matched],
      actions: ['BUY NOW', 'VIEW DETAILS'],
      mode: 'basic_assistant_mode',
    };
  }

  return {
    reply: "I'm BHODT AI. Ask me about any specific tool, price in LKR, system requirements, or purchase details.",
    products: productsList.slice(0, 2),
    actions: ['EXPLORE TOOLS', 'CHECK PRICES', 'CONTACT BHODT'],
    mode: 'basic_assistant_mode',
  };
}

// Serve Static Frontend Pages
app.use(express.static(path.resolve(__dirname, 'public')));

// Setup Vite middleware in dev or static serving in prod
async function startServer() {
  const port = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`BHODT Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
