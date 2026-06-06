# Supabase Setup

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for local dev)
- A Supabase project at [supabase.com](https://supabase.com)

## Apply Migrations

### Option A: Supabase Dashboard (recommended for first setup)

1. Open your project → **SQL Editor**
2. Paste and run `migrations/20250606000000_initial_schema.sql`

### Option B: Supabase CLI

```bash
# Link to your remote project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

## Auth Configuration

In Supabase Dashboard → **Authentication** → **Providers**:

1. Enable **Email** provider
2. Set **Site URL** to `http://localhost:5173` (dev) or your production URL
3. Add redirect URLs:
   - `http://localhost:5173/**`
   - `https://your-domain.com/**`

For email confirmation, configure **Authentication** → **Email Templates** as needed.

## Environment Variables

Copy root `.env.example` to `.env` and set:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find these in **Project Settings** → **API**.

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Users can only read/write their own rows (`auth.uid() = user_id`)
- Profile creation is handled by a `security definer` trigger on signup
- Never expose the `service_role` key in frontend code

## Tables

| Table | Purpose |
|-------|---------|
| `users` | User profiles (linked to `auth.users`) |
| `study_day_progress` | Per-day study plan progress (15-day roadmap) |
| `ai_conversations` | AI Mentor chat sessions |
| `ai_messages` | Messages within AI conversations |
| `dsa_progress` | DSA problem tracking |
| `tests` | Test attempts and scores |
| `notes` | User notes |
| `github_reviews` | GitHub repo evaluations |
| `analytics` | Daily metrics and readiness scores |
