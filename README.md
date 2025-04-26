# Dreamy / SpiralCoach

This is a [Next.js](https://nextjs.org) project, originally bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), now being refactored into **SpiralCoach**.

## Getting Started (Local Development)

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    pnpm install 
    # or npm install / yarn install
    ```
3.  **Set up Environment Variables:**
    *   Create a `.env` file in the project root.
    *   Add your Supabase URL and Anon Key:
        ```
        NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        DATABASE_URL=YOUR_SUPABASE_POSTGRES_CONNECTION_STRING # For Prisma migrations
        DIRECT_URL=YOUR_SUPABASE_DIRECT_POSTGRES_CONNECTION_STRING # For Prisma migrations
        ```
    *   Add your Google Gemini API Key:
        ```
        GEMINI_API_KEY=YOUR_GEMINI_API_KEY
        ```
    *   Add a secret for CRON job protection:
        ```
        CRON_SECRET=YOUR_SECURE_RANDOM_STRING
        ```
4.  **Run Database Migrations:**
    ```bash
    npx prisma migrate dev
    ```
5.  **Seed Database (Optional but Recommended):**
    ```bash
    # Run the Spiral Dynamics reference data seed
    npx prisma db seed 
    # Note: Ensure prisma.seed is configured in package.json (it is)
    ```
6.  **Run the development server:**
    ```bash
    pnpm dev
    # or npm run dev / yarn dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## Beta Testing Quick-Start (Using Deployed Preview)

*Access the deployed preview link provided by the development team (e.g., `spiral-coach-beta.vercel.app`).*

1.  **Sign Up / Log In:** Create a new account or log in using the provided test credentials.
2.  **Onboarding Wizard:** You should be automatically redirected to the 3-step onboarding wizard.
    *   **Step 1:** Confirm/enter your display name.
    *   **Step 2:** Answer the 10 worldview dilemma questions honestly.
    *   **Step 3:** Choose whether to include past dreams (if any exist) in the initial analysis.
    *   Click "Finish Onboarding & Analyze".
3.  **Dashboard:** You will be redirected to the main dashboard.
    *   Explore the **Spiral Passport** radar chart (it should now show your results).
    *   Try interacting with the **Daily Coach** chat panel. Ask questions related to your goals, dreams, or Spiral Dynamics stages.
    *   Use the **"+ Add" button** in the "Recent Dreams" card to log a new dream.
    *   Use the **"Set Goal" button** in the "Goals" card to define a personal goal (the AI will suggest milestones).
4.  **Progress Tab:** Navigate to the `/progress` route (link might be in the header/sidebar) to see placeholders for timeline, streaks, and tag cloud.
5.  **Feedback:** Report any bugs, unexpected behavior, or suggestions to the development team via [Specify Feedback Channel - e.g., GitHub Issues, Slack].

Thank you for testing!

---

## Learn More (Next.js)

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
