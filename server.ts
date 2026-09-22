import express from "express";
import path from "path";
import dns from "dns";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { runHeuristicScan } from "./src/utils/scannerEngine.ts";
import { ScanResult } from "./src/types.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini client to avoid crashes if GEMINI_API_KEY is absent
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.error("Failed to initialize GoogleGenAI client:", err);
      return null;
    }
  }
  return genAI;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Domain DNS verification endpoint
app.get("/api/domain-lookup", async (req, res) => {
  const domainQuery = req.query.domain as string;
  if (!domainQuery) {
    return res.status(400).json({ error: "domain query parameter is required" });
  }

  let cleanDomain = domainQuery.trim().toLowerCase();
  try {
    if (cleanDomain.startsWith("http://") || cleanDomain.startsWith("https://")) {
      cleanDomain = new URL(cleanDomain).hostname;
    } else if (cleanDomain.includes("@")) {
      cleanDomain = cleanDomain.split("@")[1];
    } else {
      cleanDomain = cleanDomain.split("/")[0].split(":")[0];
    }
  } catch {
    // Keep cleanDomain as is
  }

  let hasMx = false;
  let hasA = false;
  let mxRecords: dns.MxRecord[] = [];
  let ipAddresses: string[] = [];

  try {
    const mxLookup = await dns.promises.resolveMx(cleanDomain).catch(() => []);
    if (mxLookup && mxLookup.length > 0) {
      hasMx = true;
      mxRecords = mxLookup;
    }
  } catch {
    // Ignore DNS error
  }

  try {
    const aLookup = await dns.promises.resolve4(cleanDomain).catch(() => []);
    if (aLookup && aLookup.length > 0) {
      hasA = true;
      ipAddresses = aLookup;
    }
  } catch {
    // Ignore DNS error
  }

  return res.json({
    domain: cleanDomain,
    hasMx,
    hasA,
    mxCount: mxRecords.length,
    primaryIp: ipAddresses[0] || null,
    resolved: hasA || hasMx
  });
});

// Primary security inspection endpoint
app.post("/api/scan", async (req, res) => {
  const { text = "", url = "" } = req.body;

  if (!text.trim() && !url.trim()) {
    return res.status(400).json({ error: "Please provide either offer text or a URL to inspect." });
  }

  // 1. Run local deterministic heuristic scan
  const heuristicResult: ScanResult = runHeuristicScan(text, url);

  const aiClient = getGeminiClient();

  // If no Gemini key is available, return the high-precision heuristic scan immediately
  if (!aiClient) {
    return res.json({
      ...heuristicResult,
      modelUsed: "heuristic-defense-engine"
    });
  }

  try {
    const prompt = `You are a Senior Cyber Threat Intelligence Analyst specializing in employment fraud, fake appointment/offer letter schemes, rental deposit traps, and phishing.
Analyze the following text or URL for cyber fraud, fake job offer signs, pay-for-equipment phishing, and deposit traps:

--- INSPECT CONTENT START ---
URL / Target: ${url}
Text Content:
${text}
--- INSPECT CONTENT END ---

Assess this content and return ONLY valid JSON matching this exact structure:
{
  "aiThreatIndex": <number between 0 and 100>,
  "aiThreatLevel": <"LOW" | "MODERATE" | "HIGH" | "CRITICAL">,
  "summary": <concise forensic analysis paragraph (max 3 sentences) detailing the exact modus operandi>,
  "identifiedScamType": <"EQUIPMENT_CHECK_SCAM" | "RENTAL_DEPOSIT_TRAP" | "TELEGRAM_CRYPTO_PHISHING" | "TYPOSQUATTED_IMPERSONATION" | "LEGITIMATE_OFFER" | "UNKNOWN">,
  "financialDemandDetected": <boolean>,
  "demandedAmount": <string or null>,
  "demandedMethod": <string or null>,
  "additionalRedFlags": [
    {
      "category": <"PAYMENT_DEMAND" | "EQUIPMENT_SCAM" | "RENTAL_TRAP" | "DOMAIN_ANOMALY" | "URGENCY_COERCION" | "IDENTITY_EVASION">,
      "title": <short title>,
      "description": <technical reason why this is fraudulent>,
      "severity": <"critical" | "high" | "medium" | "low">,
      "flaggedText": <the exact quote from text that triggered this>,
      "recommendation": <actionable safety advice>
    }
  ],
  "expertCountermeasures": [<array of 3-4 specific immediate actions the victim must take>]
}`;

    let responseText = "";
    let usedModelName = "gemini-3.1-flash-lite";

    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });
      responseText = response.text || "{}";
    } catch (modelErr) {
      console.warn("Primary model busy, attempting gemini-3.8-flash:", modelErr);
      usedModelName = "gemini-3.8-flash";
      const response = await aiClient.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });
      responseText = response.text || "{}";
    }

    const parsedAi = JSON.parse(responseText || "{}");

    // Merge AI insights with heuristic findings
    const mergedRedFlags = [...heuristicResult.redFlags];
    if (Array.isArray(parsedAi.additionalRedFlags)) {
      for (const aiFlag of parsedAi.additionalRedFlags) {
        // avoid near-duplicates
        const exists = mergedRedFlags.some(
          f => f.title.toLowerCase() === (aiFlag.title || "").toLowerCase()
        );
        if (!exists && aiFlag.title) {
          mergedRedFlags.push({
            id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            category: aiFlag.category || "PAYMENT_DEMAND",
            title: aiFlag.title,
            description: aiFlag.description || "",
            severity: aiFlag.severity || "high",
            flaggedText: aiFlag.flaggedText || "",
            recommendation: aiFlag.recommendation || ""
          });
        }
      }
    }

    // Blend threat index (take maximum of AI and heuristic for strict safety, or weighted blend)
    const combinedIndex = Math.min(
      100,
      Math.max(
        heuristicResult.threatIndex,
        typeof parsedAi.aiThreatIndex === "number" ? parsedAi.aiThreatIndex : heuristicResult.threatIndex
      )
    );

    let threatLevel = heuristicResult.threatLevel;
    if (combinedIndex >= 78) threatLevel = "CRITICAL";
    else if (combinedIndex >= 52) threatLevel = "HIGH";
    else if (combinedIndex >= 25) threatLevel = "MODERATE";
    else threatLevel = "LOW";

    const mergedResult: ScanResult = {
      ...heuristicResult,
      threatIndex: combinedIndex,
      threatLevel,
      summary: parsedAi.summary || heuristicResult.summary,
      redFlags: mergedRedFlags,
      demandedAmount: parsedAi.demandedAmount || heuristicResult.demandedAmount,
      demandedMethod: parsedAi.demandedMethod || heuristicResult.demandedMethod,
      financialDemandDetected: parsedAi.financialDemandDetected ?? heuristicResult.financialDemandDetected,
      safeNextSteps: parsedAi.expertCountermeasures && parsedAi.expertCountermeasures.length > 0
        ? parsedAi.expertCountermeasures
        : heuristicResult.safeNextSteps,
      modelUsed: "gemini-ai"
    };

    return res.json(mergedResult);
  } catch (error) {
    console.error("Gemini analysis error, falling back to heuristic engine:", error);
    return res.json({
      ...heuristicResult,
      modelUsed: "heuristic-defense-engine"
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fake Offer & Phishing Inspector running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
