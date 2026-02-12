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

    const systemPrompt = `You are an expert web developer AI that generates complete, working web applications.

When a user describes what they want, you generate a COMPLETE standalone HTML file that includes all HTML, CSS, and JavaScript needed.

RULES:
1. Always return a COMPLETE HTML document with <!DOCTYPE html>, <html>, <head>, <body>
2. Include ALL CSS inline in a <style> tag
3. Include ALL JavaScript inline in a <script> tag
4. Make the output visually beautiful with modern design
5. Use animations, gradients, and smooth transitions where appropriate
6. Make it responsive
7. Use modern CSS features (flexbox, grid, custom properties)
8. The app should be fully functional and interactive
9. Do NOT use any external CDN links or imports
10. Return ONLY the HTML code, no explanations, no markdown code blocks

IMPORTANT: Return ONLY raw HTML code. No \`\`\`html blocks, no explanations before or after. Just the pure HTML document.`;

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
    let generatedCode = data.choices?.[0]?.message?.content || "";

    // Clean up any markdown wrapping
    generatedCode = generatedCode.replace(/^```html\s*/i, "").replace(/\s*```$/i, "").trim();

    // Extract file structure from the generated code
    const files = parseGeneratedFiles(generatedCode);

    return new Response(
      JSON.stringify({
        code: generatedCode,
        files,
        message: data.choices?.[0]?.message?.content || "",
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
