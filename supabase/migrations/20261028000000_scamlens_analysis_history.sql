-- Review the target project's existing schema before applying this migration.
-- Adds cloud history without deleting or altering existing tables or rows.
create table if not exists public.analysis_history (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('message', 'url')),
  created_at timestamptz not null,
  label text not null,
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  score integer not null check (score between 0 and 100),
  result jsonb not null,
  input text,
  updated_at timestamptz not null default now()
);
create index if not exists analysis_history_user_created_idx on public.analysis_history (user_id, created_at desc);
alter table public.analysis_history enable row level security;
drop policy if exists "Users can read their own ScamLens history" on public.analysis_history;
create policy "Users can read their own ScamLens history" on public.analysis_history for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can add their own ScamLens history" on public.analysis_history;
create policy "Users can add their own ScamLens history" on public.analysis_history for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update their own ScamLens history" on public.analysis_history;
create policy "Users can update their own ScamLens history" on public.analysis_history for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete their own ScamLens history" on public.analysis_history;
create policy "Users can delete their own ScamLens history" on public.analysis_history for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.analysis_history to authenticated;
