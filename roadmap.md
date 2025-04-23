# Spiral‑Coach Project Roadmap

> **Purpose**  — A living reference for you and the Cursors AI agent while refactoring **Dreamy** into **Spiral‑Coach**. Feel free to update this file as tasks complete or priorities change.

---

## 1. End‑Product Snapshot (North‑Star)

| Area                  | User Experience                                                                                 | Tech Notes                                       |
| --------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Onboarding Wizard** | 3‑step flow → (1) account basics, (2) worldview dilemmas quiz, (3) optional dream‑import toggle | `/app/(auth)/onboarding` route, client component |
| **Home Dashboard**    | • *Spiral Passport* radar card                                                                  |
• *Daily Coach* chat panel  
• *Dream Log* quick‑add button | `DashboardPage.tsx` server component that streams child client components |
| **Dream Module** | Existing editor & list, accessible from left nav | Reuse routes; change parent layout only |
| **Goal Creator** | Modal to set a goal ➜ AI auto‑splits milestones | New dialog component + `/api/goals` |
| **Coach Chat** | Streaming chat bubble UI with AI replies & "try again" button | `/api/coach` SSE route |
| **Progress Tab** | Stage‑shift timeline • goal streaks • trigger/tag cloud | Uses Recharts Radar & Line |
| **Settings / Data Sources** | Toggles for dream import, health data, export JSON | Existing Supabase auth plumbing |
| **Mobile‑Friendly** | Same dark theme (navy / light‑blue / purple accents) | Tailwind responsive classes |

---

## 2. Implementation Road‑map (12 Logical Steps)

| #                                                                    | Objective                                        | Key Sub‑tasks (for Cursors)                                                                   | Acceptance Criteria             |
| -------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------- |
| **✅ 0**                                                             | **Branch & Baseline**                            | • `git checkout -b spiral-coach`                                                              |
|                                                                      |                                                  | • Rename "Dreamy" branding strings to working codename "SpiralCoach"                          | App builds; tests pass          |
| **✅ 1**                                                             | **DB Schema Expansion**                          | • Add `SpiralProfile`, `Goal`, `CheckIn` models to `schema.prisma`                            |
|                                                                      |                                                  | • Convert `Dream.tags` from `String` to `String[]` & refactor usages                           |
|                                                                      |                                                  | • Run `prisma migrate dev -n spiral_coach_models`                                             | Tables exist; types generated   |
| **✅ 2**                                                             | **Seed Spiral Data**                             | • Create `SpiralReference` table & seed script                                                |
|                                                                      |                                                  | • Run seed script (`tsx scripts/seedSpiral.ts`)                                               | Seed script runs locally & prod |
| **3**                                                                | **Onboarding Wizard**                            | • Generate `/onboarding` route with 3 steps                                                   |
| • Step 2 pulls 10 dilemmas from `spiral_reference` via server action | Completing wizard writes `SpiralProfile` row     |
| **4**                                                                | **Worldview Classifier API**                     | • Create `/app/api/classifyWorldview/route.ts`                                                |
• Accept JSON {answers, dreams?}  
• Call Gemini with inline SD rubric & user data  
• Save stageBlend → DB | Returns 200 with `{stageBlend}`; profile saved |
| **5** | **Spiral Passport Component** | • `components/SpiralPassport.tsx` → Recharts `RadarChart` + narrative summary | Displays with mock data in Storybook |
| **6** | **Dashboard Assembly** | • New `DashboardPage.tsx` (server)  
• Imports `SpiralPassport`, `CoachChat`, `RecentDreams` | SSR works; children hydrate |
| **7** | **Coach Chat API & UI** | • SSE route `/api/coach`  
• Prompt = latest `SpiralProfile`, goals, last 5 dreams  
• `CoachChat.tsx` streams via EventSource | Streaming replies render; retry works |
| **8** | **Goal Creator** | • ShadCN modal; posts to `/api/goals`  
• Gemini splits milestones ➜ persist `Goal` row | Goal appears in dashboard |
| **9** | **Early‑Warning Rules** | • CRON edge function every 6 h → query `CheckIn` + sleep deltas  
• If risk, write `Alert` row | Alerts show as toast in dashboard |
| **10** | **Progress Tab** | • Route `/progress` with stage timeline, streak counters, tag cloud | Charts render with dummy data |
| **11** | **Polish & Perf** | • Swap purple accent to orange for action prompts  
• Lighthouse > 90 perf, mobile responsive | — |
| **12** | **Beta Hand‑off** | • Seed test accounts  
• README quick‑start  
• Deploy preview to Vercel env `spiral-coach-beta` | Test users can sign up and complete wizard |

---

## 3. Sample Cursors‑Agent Prompt Template

```text
### Title
Create SpiralProfile and Goal models in Prisma

### Context
We are pivoting Dreamy (Next.js 15) into SpiralCoach. New data tables are needed.

### Instructions
1. Open **prisma/schema.prisma**.
2. Add the following models exactly:

model SpiralProfile { … }
model Goal { … }

3. Run `npx prisma generate` and `npx prisma migrate dev -n add_spiral_tables`.
4. Ensure generated client compiles by running `pnpm build`.

### Constraints
* Do **not** modify existing Dream model.
* Use `DateTime @default(now())` for timestamps.

### Expected files changed
* prisma/schema.prisma
* prisma/migrations/* (auto‑generated)
* No other files.
```

Use this structure as a scaffold for each subsequent task—swap out file paths & specifics.

---

## 4. Immediate Next Steps

1. ~~**Branch & baseline** (Step 0).~~ (Completed)
2. ~~**DB Schema Expansion** (Step 1).~~ (Completed)
3. ~~**Seed Spiral Data** (Step 2).~~ (Completed)
4. Proceed to **Onboarding Wizard** (Step 3).

---

> **Remember:** update this file as you progress—tick off steps, jot decisions, paste prompt snippets. It's your shared source‑of‑truth.

