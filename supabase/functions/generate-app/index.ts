import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { prompt, conversationHistory, imageDataUrl } = await req.json();

    if (!prompt && !imageDataUrl) {
      throw new Error("No prompt or image provided");
    }

    const aiGatewayUrl = Deno.env.get("AI_GATEWAY_URL") ||
      "https://ai.gateway.lovable.dev/v1/chat/completions";
    const aiModel = Deno.env.get("AI_MODEL") ||
      "openai/gpt-4.1-mini";

    const systemPrompt = `You are an expert TypeScript web developer AI that generates complete, working Vite + React + TypeScript applications.

When a user describes what they want, generate a TypeScript-first project structure (not a single standalone HTML/CSS document).

RULES:
1. Default stack: Vite + React + TypeScript.
2. Prefer TS/TSX source files (src/main.tsx, src/App.tsx, components, hooks, utils, etc.).
3. Keep styling inside TypeScript-friendly patterns (CSS modules, inline style objects, or minimal separate CSS only when required).
4. Avoid generating pure static HTML/CSS-only apps.
5. Do not add explanations outside code.
6. Return output as one or more fenced code blocks, each with this exact format:
   \`\`\`file:path/to/file.ext
   ...file contents...
   \`\`\`
7. Include enough files so the generated app is runnable.

IMPORTANT: Return only file code blocks in the required file format. No prose.`;

    const messages = [
      { role: "system", content: systemPrompt },
    ];

    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    if (imageDataUrl) {
      const promptWithFallback = prompt || "Use the attached image as a visual reference and generate a complete web app.";
      messages.push({
        role: "user",
        content: [
          { type: "text", text: promptWithFallback },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      });
    } else {
      messages.push({ role: "user", content: prompt });
    }

    const response = await fetch(aiGatewayUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiModel,
        messages,
        max_tokens: 16000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API error [${response.status}]: ${errText}`);
    }

    const data = await response.json();
    const generatedMessage = data.choices?.[0]?.message?.content || "";

    // Extract file structure from the generated code
    const files = parseGeneratedFiles(generatedMessage);
    const generatedCode = getPreviewCode(files, generatedMessage);

    return new Response(
      JSON.stringify({
        code: generatedCode,
        files,
        message: generatedMessage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in generate-app:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function parseGeneratedFiles(code: string) {
  const files: { name: string; type: string; content: string }[] = [];

  const fileBlockRegex = /```file:([^\n]+)\n([\s\S]*?)```/g;
  const seen = new Set<string>();

  for (const match of code.matchAll(fileBlockRegex)) {
    const name = match[1].trim();
    const content = match[2].replace(/\s+$/, "");

    if (!name || seen.has(name)) continue;
    seen.add(name);

    files.push({ name, type: detectFileType(name), content });
  }

  if (files.length > 0) {
    return files;
  }

  // Main HTML file
  files.push({ name: "index.html", type: "html", content: code });

  // Extract CSS
  const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (styleMatch) {
    files.push({ name: "styles.css", type: "css", content: styleMatch[1].trim() });
  }

  // Extract JS
  const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  if (scriptMatch) {
    files.push({ name: "script.js", type: "js", content: scriptMatch[1].trim() });
  }

  return files;
}

function detectFileType(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext) return "text";

  const map: Record<string, string> = {
    ts: "ts",
    tsx: "tsx",
    js: "js",
    jsx: "jsx",
    json: "json",
    css: "css",
    html: "html",
    md: "md",
  };

  return map[ext] || ext;
}

function getPreviewCode(
  files: { name: string; type: string; content: string }[],
  fallback: string,
) {
  const htmlFile = files.find((file) => file.name === "index.html");
  if (htmlFile) {
    return htmlFile.content;
  }

  return fallback;
}
