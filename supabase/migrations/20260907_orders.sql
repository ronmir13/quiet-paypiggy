-- V24 Orders & Fulfillment Foundation
-- Run this once in the Supabase SQL Editor.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  stripe_payment_intent_id text,
  customer_email text,
  amount_total integer not null check (amount_total >= 0),
  currency text not null default 'usd',
  status text not null default 'paid' check (status in ('paid', 'fulfilled', 'cancelled', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_amount integer not null check (unit_amount >= 0),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Customers can view their own orders" on public.orders;
create policy "Customers can view their own orders"
on public.orders
for select
to authenticated
using (lower(customer_email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "Customers can view their own order items" on public.order_items;
create policy "Customers can view their own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where public.orders.id = public.order_items.order_id
      and lower(public.orders.customer_email) = lower(auth.jwt() ->> 'email')
  )
);

create index if not exists orders_customer_email_idx
on public.orders(customer_email);

create index if not exists order_items_order_id_idx
on public.order_items(order_id);

create index if not exists orders_created_at_idx
on public.orders(created_at desc);
