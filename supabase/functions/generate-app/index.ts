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
  const hasViteEntry = files.some((file) =>
    ["src/main.tsx", "src/main.ts", "src/main.jsx", "src/main.js"].includes(file.name)
  );

  if (hasViteEntry) {
    return buildInlineVitePreview(files, fallback);
  }

  if (htmlFile) {
    return htmlFile.content;
  }

  return fallback;
}

function buildInlineVitePreview(
  files: { name: string; type: string; content: string }[],
  fallback: string,
) {
  const moduleFiles = files.filter((file) =>
    ["ts", "tsx", "js", "jsx", "mjs", "cjs"].includes(file.type)
  );

  const entry = ["src/main.tsx", "src/main.ts", "src/main.jsx", "src/main.js"]
    .find((candidate) => moduleFiles.some((file) => file.name === candidate));

  if (!entry) {
    return fallback;
  }

  const cssByFile = Object.fromEntries(
    files
      .filter((file) => file.type === "css")
      .map((file) => [file.name, file.content]),
  );

  const moduleByFile = Object.fromEntries(
    moduleFiles.map((file) => [file.name, file.content]),
  );

  const escapedModules = JSON.stringify(moduleByFile).replace(/<\/(script)/gi, "<\\/$1");
  const escapedCss = JSON.stringify(cssByFile).replace(/<\/(script)/gi, "<\\/$1");
  const escapedEntry = entry.replace(/"/g, '\\"');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Generated App Preview</title>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      const moduleByFile = ${escapedModules};
      const cssByFile = ${escapedCss};
      const entryFile = "${escapedEntry}";
      const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

      function normalizePath(path) {
        const parts = [];
        for (const chunk of path.split("/")) {
          if (!chunk || chunk === ".") continue;
          if (chunk === "..") {
            parts.pop();
            continue;
          }
          parts.push(chunk);
        }
        return parts.join("/");
      }

      function resolveImport(fromFile, specifier) {
        if (!specifier.startsWith(".") && !specifier.startsWith("/")) {
          return { kind: "bare", value: specifier };
        }

        const fromParts = fromFile.split("/").slice(0, -1);
        const target = specifier.startsWith("/")
          ? normalizePath(specifier)
          : normalizePath([...fromParts, specifier].join("/"));

        if (moduleByFile[target]) {
          return { kind: "module", value: target };
        }

        for (const ext of extensions) {
          if (moduleByFile[target + ext]) {
            return { kind: "module", value: target + ext };
          }
        }

        if (cssByFile[target]) {
          return { kind: "css", value: target };
        }

        if (cssByFile[target + ".css"]) {
          return { kind: "css", value: target + ".css" };
        }

        return { kind: "missing", value: target };
      }

      const style = document.createElement("style");
      style.setAttribute("data-generated-preview", "true");
      document.head.appendChild(style);
      const appendedCss = new Set();

      const moduleUrls = {};
      const building = new Set();

      function rewriteSpecifiers(code, fileName) {
        const importExportRegex = /(import\\s+(?:[^'"\\n]+?\\s+from\\s+)?|export\\s+[^'"\\n]*?\\s+from\\s+)(["'])([^"']+)(["'])/g;
        const dynamicImportRegex = /(import\\(\\s*)(["'])([^"']+)(["'])(\\s*\\))/g;

        const rewrite = (_, start, quoteStart, specifier, quoteEnd) => {
          const resolved = resolveImport(fileName, specifier);

          if (resolved.kind === "css") {
            if (!appendedCss.has(resolved.value)) {
              style.textContent += "\\n" + (cssByFile[resolved.value] || "");
              appendedCss.add(resolved.value);
            }
            return "";
          }

          if (resolved.kind === "module") {
            ensureModuleUrl(resolved.value);
            return `${start}${quoteStart}${moduleUrls[resolved.value]}${quoteEnd}`;
          }

          if (resolved.kind === "bare") {
            return `${start}${quoteStart}https://esm.sh/${specifier}${quoteEnd}`;
          }

          return `${start}${quoteStart}${specifier}${quoteEnd}`;
        };

        const rewrittenImports = code.replace(importExportRegex, rewrite);
        return rewrittenImports.replace(dynamicImportRegex, (match, start, quoteStart, specifier, quoteEnd, end) => {
          const resolved = resolveImport(fileName, specifier);

          if (resolved.kind === "module") {
            ensureModuleUrl(resolved.value);
            return `${start}${quoteStart}${moduleUrls[resolved.value]}${quoteEnd}${end}`;
          }

          if (resolved.kind === "bare") {
            return `${start}${quoteStart}https://esm.sh/${specifier}${quoteEnd}${end}`;
          }

          return match;
        });
      }

      function ensureModuleUrl(fileName) {
        if (moduleUrls[fileName]) return moduleUrls[fileName];
        if (building.has(fileName)) return moduleUrls[fileName];

        const source = moduleByFile[fileName];
        if (!source) throw new Error(`Missing module file: ${fileName}`);

        building.add(fileName);
        const transformed = Babel.transform(source, {
          filename: fileName,
          sourceType: "module",
          presets: ["typescript", "react"],
          retainLines: true,
        }).code;

        const rewritten = rewriteSpecifiers(transformed, fileName);
        const blob = new Blob([rewritten], { type: "text/javascript" });
        moduleUrls[fileName] = URL.createObjectURL(blob);
        building.delete(fileName);
        return moduleUrls[fileName];
      }

      try {
        const entryUrl = ensureModuleUrl(entryFile);
        await import(entryUrl);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        document.body.innerHTML = `<pre style="padding:16px;color:#b91c1c;background:#fef2f2;border:1px solid #fecaca;white-space:pre-wrap;">Preview failed: ${message}</pre>`;
      }
    </script>
  </body>
</html>`;
}
