# Garden Project Grow — AI App Builder

A professional React + Supabase AI app builder that can generate complete web apps from prompts, optionally using **image attachments** as visual references.

## Highlights

- **Vercel AI Gateway compatible backend** (OpenAI-compatible Chat Completions API)
- **Configurable model routing** via environment variables
- **Image attachment support in chat** (vision-capable models)
- **Ollama local and cloud-ready setup guidance**
- **Hugging Face model recommendation** for code/web generation workflows

## Stack

- Vite + React + TypeScript
- Tailwind + shadcn/ui
- Zustand state management
- Supabase Edge Function (`generate-app`) as AI gateway proxy

## Local Development

```bash
npm install
npm run dev
```

## Environment Configuration

Create/update your `.env` and Supabase secrets for the Edge Function:

### Required

- `LOVABLE_API_KEY`: API key used by the gateway endpoint.

### Optional (recommended)

- `AI_GATEWAY_URL`: OpenAI-compatible endpoint.
  - Default: `https://ai.gateway.lovable.dev/v1/chat/completions`
- `AI_MODEL`: Model identifier accepted by your gateway/provider.
  - Default: `openai/gpt-4.1-mini`

> The app now supports both text-only and multimodal (`image_url`) chat payloads when an image is attached.

## Vercel AI Gateway Setup

Use an OpenAI-compatible gateway URL and route requests through the Supabase Edge Function:

```bash
AI_GATEWAY_URL=https://gateway.ai.vercel.com/v1/chat/completions
AI_MODEL=openai/gpt-4.1-mini
```

Then configure your function secret for auth headers (token/key expected by your gateway route).

## Ollama Installation (Local)

### macOS / Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama serve
ollama pull llama3.1:8b
```

### Windows

1. Install from: https://ollama.com/download
2. Start Ollama.
3. Pull a model:

```bash
ollama pull llama3.1:8b
```

### Route through OpenAI-compatible interface

If your Ollama endpoint exposes OpenAI-compatible routes, set:

```bash
AI_GATEWAY_URL=http://localhost:11434/v1/chat/completions
AI_MODEL=llama3.1:8b
```

## Ollama Cloud / Remote Deployment

For managed or cloud-hosted Ollama-compatible endpoints:

```bash
AI_GATEWAY_URL=https://<your-ollama-cloud-endpoint>/v1/chat/completions
AI_MODEL=llama3.1:70b
```

Use secure token-based auth and set your secret in Supabase so the Edge Function can call your remote endpoint privately.

## Hugging Face Model Recommendation

For high-quality coding/web generation, a strong option is:

- **Qwen/Qwen2.5-Coder-32B-Instruct**

If available through your gateway/provider, set:

```bash
AI_MODEL=Qwen/Qwen2.5-Coder-32B-Instruct
```

Choose a vision-capable model whenever you want to use chat image attachments.

## Chat Image Attachment

The chat composer now supports attaching an image file:

- Click the paperclip icon
- Select an image
- Send with or without text prompt

The image is sent to the Edge Function as `imageDataUrl`, then forwarded in OpenAI-style multimodal format (`content` with `text` + `image_url`).

## Deploy

- Deploy frontend on Vercel/Netlify/your preferred host.
- Deploy Supabase Edge Function (`generate-app`) with required secrets.
- Point `AI_GATEWAY_URL` + `AI_MODEL` to your production provider.
