import "dotenv/config";
import express from "express";
import { initDb, dbGet, dbSet, dbDelete, dbGetAll } from "./db.js";

const PORT = process.env.PORT || 3456;
const app = express();
app.use(express.json({ limit: "512kb" }));

// Determine backend: ANTHROPIC_API_KEY = direct API, else Bedrock
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const USE_BEDROCK = !ANTHROPIC_API_KEY;

let callModel;

if (USE_BEDROCK) {
  const { BedrockRuntimeClient, InvokeModelCommand } = await import("@aws-sdk/client-bedrock-runtime");
  const { fromIni } = await import("@aws-sdk/credential-providers");
  const PROFILE = process.env.AWS_PROFILE || "default";
  const REGION = process.env.AWS_REGION || "us-east-1";
  const MODEL = process.env.BEDROCK_MODEL || "us.anthropic.claude-sonnet-4-6";
  const bedrock = new BedrockRuntimeClient({ region: REGION, credentials: fromIni({ profile: PROFILE }) });

  callModel = async (system, messages, max_tokens) => {
    const result = await bedrock.send(new InvokeModelCommand({
      modelId: MODEL,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({ anthropic_version: "bedrock-2023-05-31", max_tokens, system, messages }),
    }));
    const data = JSON.parse(new TextDecoder().decode(result.body));
    return data.content?.[0]?.text || "";
  };
  console.log(`Backend: Bedrock (${MODEL}, profile=${PROFILE}, region=${REGION})`);
} else {
  const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

  callModel = async (system, messages, max_tokens) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: MODEL, max_tokens, system, messages }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Anthropic API ${res.status}`);
    }
    const data = await res.json();
    return data.content?.[0]?.text || "";
  };
  console.log(`Backend: Anthropic API (${MODEL})`);
}

app.post("/api/chat", async (req, res) => {
  try {
    const { system, messages, max_tokens = 1024 } = req.body;
    const text = await callModel(system, messages, max_tokens);
    res.json({ text });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── State persistence ──────────────────────────────────
app.get("/api/state", (req, res) => {
  res.json(dbGetAll());
});

app.get("/api/state/:key", (req, res) => {
  const val = dbGet(req.params.key);
  if (val === null) return res.status(404).json({ error: "not found" });
  res.json({ key: req.params.key, value: val });
});

app.put("/api/state/:key", (req, res) => {
  dbSet(req.params.key, req.body.value);
  res.json({ ok: true });
});

app.delete("/api/state/:key", (req, res) => {
  dbDelete(req.params.key);
  res.json({ ok: true });
});

// ── Start ─────────────────────────────────────────────
await initDb();
app.listen(PORT, () => console.log(`Proxy on :${PORT} (db: ${process.env.DB_PATH || "./study_guide.db"})`));
