# InterviewOS

AI-powered SDE Interview Preparation Platform for IIT students, engineering students, SDE intern candidates, and new graduates.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 8
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **State:** Zustand
- **Backend:** Supabase (Auth + PostgreSQL)
- **Charts:** Recharts
- **Icons:** Lucide React

## Features

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Overview stats and quick actions |
| Study Plan | `/study-plan` | Structured learning roadmap |
| DSA Tracker | `/dsa-tracker` | Problem logging and pattern tracking |
| Tests | `/tests` | MCQ and coding assessments |
| Analytics | `/analytics` | Progress charts and insights |
| AI Mentor | `/ai-mentor` | Gemini-powered guidance |
| GitHub Evaluator | `/github-evaluator` | Repository quality analysis |
| Settings | `/settings` | Profile and preferences |
| Login | `/auth/login` | Sign in |
| Sign Up | `/auth/signup` | Create account |

## Project Structure

```
src/
├── app/
│   ├── providers/       # App-level providers (router, theme, auth init)
│   └── router/          # Route definitions and path constants
├── components/
│   ├── auth/            # ProtectedRoute, PublicRoute
│   ├── layout/          # AppLayout, Sidebar, Header, MobileNav
│   └── ui/              # Reusable UI primitives
├── features/
│   ├── auth/            # Login, SignUp, AuthLayout
│   └── ...              # Other feature modules
├── hooks/
│   └── auth/            # useAuth, useSignIn, useSignUp, useSignOut
├── lib/
│   ├── constants/       # App constants and navigation config
│   ├── supabase/        # Supabase client
│   └── utils/           # Utility functions
├── stores/              # Zustand stores (theme, ui, auth)
├── styles/              # Theme CSS variables
└── types/               # Shared TypeScript types
```

## Local Setup

### Prerequisites

- Node.js 20+
- npm 10+

### Commands

```bash
# Clone and enter project
cd interview_os

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

### Environment Variables

Create a `.env` file from `.env.example`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_APP_URL=http://localhost:5173
```

### Supabase Database Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in **SQL Editor**:
   - File: `supabase/migrations/20250606000000_initial_schema.sql`
3. Configure **Authentication → URL Configuration**:
   - Site URL: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173/**`
4. Enable **Email** auth provider

See `supabase/README.md` for full details.

### Authentication

- **Sign Up** — `/auth/signup` (creates `auth.users` + `public.users` via trigger)
- **Login** — `/auth/login` (email/password)
- **Logout** — Settings page
- **Session** — Persisted in localStorage (`interviewos-auth`)
- **Protected Routes** — All app pages require authentication

## Architecture

### Routing

- Nested routes under `AppLayout` with lazy-loaded pages
- Path constants in `src/app/router/paths.ts`

### Layout

- Desktop: collapsible sidebar + header + main content
- Mobile: hamburger menu with slide-in sidebar overlay

### Theme

- CSS custom properties in `src/styles/theme.css`
- Zustand `themeStore` with light / dark / system modes
- FOUC prevention via inline script in `index.html`

### State

| Store | Purpose |
|-------|---------|
| `themeStore` | Theme mode and resolved theme |
| `uiStore` | Sidebar collapse, mobile nav state |
| `authStore` | Supabase auth session and user profile |

## Deployment

- **Vercel:** Connect repo, set env vars, deploy
- **GitHub Pages:** Set `base` in `vite.config.ts` to your repo name

## License

Private — All rights reserved.
