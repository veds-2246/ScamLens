# ScamLens Supabase setup

1. Review the existing schema in the target Supabase project before applying anything.
2. Run `migrations/20261028000000_scamlens_analysis_history.sql` in SQL Editor. It creates one table and user-scoped RLS policies and does not delete existing tables or rows.
3. In Authentication → URL Configuration, set the Site URL to your deployed app origin and add `http://localhost:3000/auth/callback` and `https://YOUR-DEPLOYED-DOMAIN/auth/callback` as redirect URLs.
4. Add these values to the project root `.env.local`:
   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
5. Install the dependencies with pnpm and run the app. Configure email confirmation in Supabase Auth as desired.

Never put a service-role/secret key in client code or a NEXT_PUBLIC_ variable. The app relies on RLS for row-level operations. Existing local reports are uploaded by ID after sign-in so syncing is idempotent.
