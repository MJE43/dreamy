# SpiralCoach Pivot Roadmap

> **Purpose:** A living reference for you and Cursors AI Agent while refactoring *Dreamy* into *SpiralCoach*.

---

## 1. End‑Product Snapshot

| Area                        | What the user sees                                                                                   | Tech notes                                 |
| --------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **Onboarding wizard**       | 3‑step flow → (1) account basics, (2) worldview dilemmas quiz, (3) optional dream‑import toggle      | `/app/(auth)/onboarding`, client component |
| **Home dashboard**          | • **Spiral Passport** radar card<br>• **Daily Coach** chat panel<br>• **Dream log** quick‑add button | `DashboardPage.tsx` server component │     |
| **Dream module (existing)** | Same editor & list, accessible from left nav                                                         | Reuse routes; adjust parent layout         |
| **Goal creator**            | Modal to set a goal → AI auto‑splits milestones                                                      | New dialog + `/api/goals`                  |
| **Coach chat**              | Streaming chat bubble UI with AI replies & “try again” button                                        | `/api/coach` SSE route                     |
| **Progress tab**            | Stage‑shift timeline, goal streaks, trigger/tag cloud                                                | Recharts Radar & Line charts               |
| **Settings / Data sources** | Toggles for dream import, health data, export JSON                                                   | No change to auth plumbing                 |
| **Mobile‑friendly**         | Same dark theme (navy / light‑blue / purple)                                                         | Tailwind responsive classes                |

---

## 2. Implementation Road‑map (12 Steps)

| #       | Objective                     | Key subtasks (hand to Cursors)                                                                                 | Acceptance criteria                  |
| ------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **✅ 0** | **Branch & baseline**         | • `git checkout -b spiral-coach`<br>• Rename “Dreamy” branding strings to “SpiralCoach”                        | App builds; tests pass               |
| **✅ 1** | **DB schema expansion**       | • Add `SpiralProfile`, `Goal`, `CheckIn` to `schema.prisma`<br>• `npx prisma migrate dev -n add_spiral_tables` | Tables exist; Prisma types generated |
| **✅ 2** | **Seed Spiral data**          | • `/scripts/seedSpiral.ts` inserts stage definitions & dilemmas into `spiral_reference`                        | Script runnable locally & prod       |
| **✅ 3** | **Onboarding wizard**         | • `/onboarding` 3‑step route<br>• Step 2 fetches 10 dilemmas                                                   | Wizard writes `SpiralProfile` row    |
| **✅ 4** | **Worldview classifier API**  | • `/api/classifyWorldview` (POST JSON)<br>• Gemini prompt with SD rubric & user data<br>• Save stage blend     | Returns 200 + saved profile          |
| **✅ 5** | **Spiral Passport component** | • `components/SpiralPassport.tsx` with Recharts RadarChart + narrative                                         | Storybook demo with mock data        |
| **6**   | **Dashboard assembly**        | • `DashboardPage.tsx` server‑side<br>• Imports `SpiralPassport`, `CoachChat`, `RecentDreams`                   | SSR renders; hydration OK            |
| **7**   | **Coach chat API & UI**       | • SSE `/api/coach`<br>• Prompt = latest profile, goals, last 5 dreams<br>• `CoachChat.tsx` streams messages    | Chat streams; retry works            |
| **8**   | **Goal creator**              | • ShadCN modal → `/api/goals`<br>• Gemini splits milestones                                                    | Goal card appears                    |
| **9**   | **Early‑warning rules**       | • CRON Edge function every 6h<br>• Query `CheckIn` + sleep/mood deltas; write `Alert`                          | Toast shows on dashboard             |
| **10**  | **Progress tab**              | • `/progress` route<br>• Stage timeline (LineChart), streak counters, tag cloud                                | Charts render dummy data             |
| **11**  | **Polish & perf**             | • Swap purple accent to orange for action prompts<br>• Lighthouse > 90                                         | Responsive mobile                    |
| **12**  | **Beta hand‑off**             | • Seed test accounts<br>• README quick‑start<br>• Deploy preview to Vercel `spiral-coach-beta`                 | Testers can sign up & finish wizard  |

---

## 3. Cursors AI Prompt Template (example)

```text
### Title
Create SpiralProfile and Goal models in Prisma

### Context
We are pivoting Dreamy (Next.js 15) into SpiralCoach. New data tables are needed.

### Instructions
1. Open prisma/schema.prisma.
2. Add the following models exactly:
   model SpiralProfile { … }
   model Goal          { … }
3. Run `npx prisma generate` and `npx prisma migrate dev -n add_spiral_tables`.
4. Ensure project compiles via `pnpm build`.

### Constraints
* Do not modify existing Dream model.
* Use `DateTime @default(now())` for timestamps.

### Expected files changed
* prisma/schema.prisma
* prisma/migrations/* (auto)
* No other files.
```

---

## 4. Immediate Next Steps

1. ~~ **Branch & baseline** (step 0).~~
2. ~~ **DB Schema Expansion** (Step 1).~~
3. ~~ **Seed Spiral data** (Step 2).~~
4. ~~ **Onboarding wizard** (Step 3).~~
5. ~~ **Worldview classifier API** (Step 4).~~
6. ~~ **Spiral Passport component** (Step 5).~~
7. Proceed to **Dashboard assembly** (Step 6).

---

*Last updated: [Current Date - I'll let you fill this in]*

