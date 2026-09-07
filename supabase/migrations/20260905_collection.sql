-- V21 Cloud Collection
-- Run this once in Supabase SQL Editor.

create table if not exists public.collections (
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id integer not null check (card_id between 1 and 50),
  created_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

alter table public.collections enable row level security;

drop policy if exists "Collectors can view their own cards" on public.collections;
create policy "Collectors can view their own cards"
on public.collections
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Collectors can collect their own cards" on public.collections;
create policy "Collectors can collect their own cards"
on public.collections
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Collectors can remove their own cards" on public.collections;
create policy "Collectors can remove their own cards"
on public.collections
for delete
to authenticated
using (auth.uid() = user_id);

create index if not exists collections_user_id_idx
on public.collections(user_id);
