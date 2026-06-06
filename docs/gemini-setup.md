# Gemini 2.5 Flash — Setup Guide

InterviewOS uses **Google Gemini 2.5 Flash** (`gemini-2.5-flash`) for AI Mentor, GitHub Repository Evaluator, and other AI features.

## Required Accounts

1. **Google Account** — Any personal or workspace Google account.
2. **Google AI Studio** — Create an API key at [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey).

No credit card is required for the **Free tier**. Billing is optional and unlocks higher rate limits (Tier 1+).

## Environment Variables

Add to your `.env` file in the project root:

```env
VITE_AI_PROVIDER=gemini
VITE_GEMINI_API_KEY=your-api-key-here
```

### Optional tuning

```env
# Override model (default: gemini-2.5-flash)
VITE_GEMINI_MODEL=gemini-2.5-flash

# Max retry attempts on transient failures (default: 3)
VITE_GEMINI_MAX_RETRIES=3

# Client-side requests-per-minute guard (default: 10)
VITE_GEMINI_CLIENT_RPM=10
```

Restart the dev server after changing `.env`:

```bash
npm run dev
```

## Architecture

```
src/lib/gemini/
├── config.ts       # Env vars, model defaults
├── client.ts       # GeminiClient.generateContent()
├── errors.ts       # Typed errors + user-facing messages
├── retry.ts        # Exponential backoff + jitter
├── rateLimiter.ts  # Client-side RPM guard
└── types.ts        # Request/response types
```

The AI provider layer (`src/lib/ai/providers/gemini.provider.ts`) delegates to `GeminiClient`.

### Features

| Feature | Behavior |
|---------|----------|
| **Retry logic** | Retries on 429, 5xx, network errors, and timeouts (up to `VITE_GEMINI_MAX_RETRIES`) |
| **Rate limits** | Honors `Retry-After` header; exponential backoff with jitter |
| **Client RPM guard** | Sliding-window limiter to reduce 429s on free tier |
| **Timeouts** | 60s default per request (abort via `AbortController`) |
| **Error mapping** | Typed codes: `rate_limited`, `quota_exceeded`, `authentication_error`, etc. |

### Usage in code

```typescript
import { getGeminiClient, toGeminiContents } from '@/lib/gemini'

const client = getGeminiClient()

const response = await client.generateContent({
  systemInstruction: 'You are a helpful assistant.',
  contents: [{ role: 'user', parts: [{ text: 'Hello!' }] }],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
    thinkingBudget: 0, // disable thinking for lower latency
  },
})

console.log(response.text)
```

Or via the existing AI abstraction:

```typescript
import { completeChat } from '@/lib/ai'

const result = await completeChat({
  messages: [{ id: '1', role: 'user', content: 'Explain binary search' }],
})
```

## Free Tier Limits

Google applies rate limits **per project** (not per API key) across three dimensions:

- **RPM** — Requests per minute
- **TPM** — Input tokens per minute
- **RPD** — Requests per day (resets midnight **Pacific Time**)

Limits vary by model and tier. **Always check your active limits** in AI Studio:

- [Rate limits documentation](https://ai.google.dev/gemini-api/docs/rate-limits)
- [AI Studio — View rate limits](https://aistudio.google.com/) → your project → Rate limits

### Typical Free tier (approximate — verify in AI Studio)

| Model | Notes |
|-------|-------|
| `gemini-2.5-flash` | Lower RPM/TPM/RPD than paid tiers; suitable for development |
| Input context | Up to ~1M tokens |
| Output | Up to ~65K tokens |

When limits are exceeded, the API returns **HTTP 429** with status `RESOURCE_EXHAUSTED`. InterviewOS automatically retries with backoff.

### Upgrading limits

1. Enable billing in [Google AI Studio](https://aistudio.google.com/)
2. Tiers upgrade automatically based on spend (Tier 1 → Tier 2 → Tier 3)
3. See [usage tiers](https://ai.google.dev/gemini-api/docs/rate-limits#usage-tiers)

## Security Notes

- **Never commit** `.env` or expose `VITE_GEMINI_API_KEY` in public repos.
- Vite embeds `VITE_*` vars in the client bundle — acceptable for local/dev and trusted users only.
- For production, prefer a **backend proxy** (Supabase Edge Function) so the API key stays server-side.

## Troubleshooting

| Error | Fix |
|-------|-----|
| `missing_api_key` | Set `VITE_GEMINI_API_KEY` in `.env` and restart dev server |
| `authentication_error` | Regenerate key in AI Studio; check for typos |
| `rate_limited` | Wait and retry; lower `VITE_GEMINI_CLIENT_RPM` |
| `quota_exceeded` | Daily limit hit; wait until midnight PT or enable billing |
| `timeout` | Shorten prompt or increase timeout in code |
| Empty response | Rephrase prompt; check safety filters |

## Links

- [Gemini 2.5 Flash model card](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash)
- [Generate content API](https://ai.google.dev/api/generate-content)
- [Google AI Studio](https://aistudio.google.com/)
