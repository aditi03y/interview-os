/// <reference types="vite/client" />

type AiProvider = 'gemini' | 'openai' | 'claude' | 'openrouter'

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_AI_PROVIDER: AiProvider
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_GEMINI_MODEL?: string
  readonly VITE_GEMINI_MAX_RETRIES?: string
  readonly VITE_GEMINI_CLIENT_RPM?: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_ANTHROPIC_API_KEY?: string
  readonly VITE_OPENROUTER_API_KEY?: string
  readonly VITE_GITHUB_TOKEN?: string
  readonly VITE_APP_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
