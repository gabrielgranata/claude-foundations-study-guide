import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import express from "express";

import { fromIni } from "@aws-sdk/credential-providers";

const PROFILE = process.env.AWS_PROFILE || "default";
const REGION = process.env.AWS_REGION || "us-east-1";
const MODEL = process.env.BEDROCK_MODEL || "us.anthropic.claude-sonnet-4-6";
const PORT = process.env.PORT || 3456;

const bedrock = new BedrockRuntimeClient({
  region: REGION,
  credentials: fromIni({ profile: PROFILE }),
});
const app = express();
app.use(express.json({ limit: "512kb" }));

app.post("/api/chat", async (req, res) => {
  try {
    const { system, messages, max_tokens = 1024 } = req.body;
    const result = await bedrock.send(new InvokeModelCommand({
      modelId: MODEL,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: max_tokens,
        system,
        messages,
      }),
    }));
    const data = JSON.parse(new TextDecoder().decode(result.body));
    res.json({ text: data.content?.[0]?.text || "" });
  } catch (err) {
    console.error("Bedrock error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Bedrock proxy on :${PORT}`));
