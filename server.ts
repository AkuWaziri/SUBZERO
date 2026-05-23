import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI endpoint for parsing subscription natural language
  app.post("/api/ai/parse-subscription", async (req, res) => {
    try {
      if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
        Parse the following subscription information into a JSON object:
        "${text}"

        The JSON object should have:
        - name: string (e.g., "Netflix")
        - amount: number (numeric value only)
        - currency: string (3-letter code, default to "USD" if not specified)
        - frequency: "monthly", "yearly", or "weekly" (default to "monthly")
        - category: string (e.g., "Entertainment", "SaaS", "Utilities")

        Return ONLY the JSON object.
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const response = result;
      let jsonString = response.text || "{}";
      
      // Clean up markdown if present
      if (jsonString.startsWith("```json")) {
        jsonString = jsonString.slice(7, -3).trim();
      } else if (jsonString.startsWith("```")) {
        jsonString = jsonString.slice(3, -3).trim();
      }

      const parsedData = JSON.parse(jsonString);
      res.json(parsedData);
    } catch (error) {
      console.error("AI Parse Error:", error);
      res.status(500).json({ error: "Failed to parse subscription" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
