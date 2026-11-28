# Roadmap Galaxy

Roadmap Galaxy is a dark, space-themed learning tracker for students exploring computer science and engineering skills. It is built as a React application with Vite.

## What is included

- Dashboard with overall completion, topic counts, weighted mastery and roadmap progress.
- Clickable solar-system-style roadmap explorer.
- Library of **13 roadmaps and 132 topics**, with search and category/difficulty filters.
- Roadmap detail pages with expandable topic guides, learning-resource search links and practice missions.
- Topic status tracking: Not Started, Learning and Done.
- Learn Next recommendations using the existing prerequisite-aware recommendation logic.
- Hackathon Idea Lab with **8 curated project ideas** and individual detail pages.
- My Plans: save a personal shortlist of roadmaps and see active/completed topics.
- Career Compass: compare six target roles, estimate skill readiness from roadmap progress and identify gaps.
- Focus Mode: 25/45/60-minute focus timer with a local session history.
- Memory Probe: Leitner spaced-repetition cards for completed topics, using the agreed 1/2/4/7/14-day review intervals.
- Progress persistence in browser `localStorage` (same browser/device; no account or cloud sync).
- Responsive dark-blue theme and reduced-motion support.

## Technology

- React 18 + Vite 5
- JavaScript and React Router
- Tailwind CSS 3
- Vitest for unit and prototype-parity tests
- Static JSON catalogue; no custom backend or Supabase connection

## Requirements

- Node.js 20.19+ or 22 LTS
- npm

## Run locally (Windows PowerShell)

1. Extract the project ZIP.
2. Open the extracted `roadmap-galaxy-app` folder in VS Code. This is the folder containing `package.json`.
3. Open **Terminal → New Terminal** and run:

```powershell
npm install
npm test
npm run build
npm run check:palette
npm run dev
```

4. Open the local URL printed by Vite, normally `http://localhost:5173`.

If PowerShell blocks npm scripts, use `npm.cmd` in place of `npm`.

## Production build

`npm run build` creates the deployable static site in `dist/`. Deploy the contents of `dist/` to a static hosting provider. The included `vercel.json` and `public/_redirects` configure SPA route fallback for Vercel and Netlify.

## Project structure

```text
reference/       Original prototype retained for reference/parity tests
scripts/         Catalogue extraction and palette verification
src/components/  Shared layout and cards
src/config/      Palette and application rules
src/data/        Roadmaps, taxonomy and hackathon ideas
src/lib/         Progress, recommendations and learning logic
src/pages/       Dashboard, roadmaps, idea lab, plans, career compass, focus and memory probe
tests/           Unit and prototype-parity tests
```

## Progress and privacy

Topic statuses are stored under the `roadmap-galaxy-progress-v1` localStorage key. Data remains in the browser profile where it was created. Clearing browser storage removes that local progress. There is no login, remote database, or cross-device synchronization in this version.

## Current scope and limitations

- Topic catalogue entries contain topic names, levels, weights and prerequisites. The topic detail view therefore provides a guided study checklist and links to search for learning material rather than claiming to contain full authored lessons.
- Learn Next uses the existing algorithm and the current default learner level of Beginner.
- Career Compass readiness is an indicative checklist based on roadmap completion, not a validated hiring or skills assessment.
- Focus sessions, plans, review cards and progress are stored locally in the browser; there is no cross-device sync until Supabase is configured.
- Hackathon ideas are curated concepts, not live hackathon listings.
- Authentication, cloud sync and Supabase/RLS are not configured.

## Palette check

The approved palette is defined in `src/config/palette.js`. Run `npm run check:palette` after building to check source and generated CSS for off-palette colours.


## Supabase authentication and cloud progress

1. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and the public anon/publishable key from Supabase Project Settings → API.
2. Install dependencies with `npm install` and restart Vite with `npm run dev`.
3. In Supabase Authentication → URL Configuration, set the Site URL to your local URL while developing (for example `http://localhost:5173`) and add the deployed Vercel URL to Redirect URLs. Also allow `http://localhost:5173/**` and `https://YOUR-VERCEL-DOMAIN/**` as redirect patterns.
4. Enable email/password sign-in in Authentication → Providers. Email confirmation may be enabled; if enabled, users must confirm their email before their first login.
5. The `public.user_progress` table must have RLS enabled and the four per-user policies for SELECT, INSERT, UPDATE and DELETE. Its status constraint must allow `not_started`, `learning`, and `done`.

The app includes `/signup`, `/login`, `/forgot-password`, and `/reset-password`. Roadmap pages require an authenticated user. Topic progress is scoped by authenticated user ID and synced to `public.user_progress`; legacy browser progress is migrated once to the first account that signs in on that browser. Keep `.env.local` private and never use a Supabase service-role key in the browser.
