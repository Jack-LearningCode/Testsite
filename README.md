# Simple NPS

Marketing site + customer portal for Simple NPS, built with React + Vite,
Supabase email/password auth, and Firebase Hosting.

## Setup

```bash
npm install
cp .env.example .env   # fill in your Supabase project URL and publishable key
npm run dev
```

Apply the database migration in `supabase/migrations/` (see [supabase/README.md](supabase/README.md))
before testing signup end to end.

## Deploy

```bash
npm run build
firebase deploy
```

Firebase project: `learningcode-250e9` (see `.firebaserc`).
