-- Clubs feed (Session 1). Applied manually in the Supabase dashboard SQL editor.
-- RLS intentionally NOT enabled (server/client split). Writes are blocked by plain grants.

create table if not exists public.clubs (
  username     text primary key,
  display_name text,
  avatar_url   text,
  enabled      boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.club_posts (
  id             uuid primary key,
  bot_dedup_key  text not null unique,
  origin         text not null default 'scraper:instagram',
  shortcode      text not null unique,
  club_username  text not null references public.clubs(username) on delete cascade,
  caption        text,
  post_url       text not null,
  image_url      text,
  image_path     text,
  is_event       boolean not null default false,
  post_type      text,
  posted_at      timestamptz not null,
  synced_at      timestamptz not null default now()
);

create index if not exists club_posts_posted_idx
  on public.club_posts (posted_at desc);
create index if not exists club_posts_club_posted_idx
  on public.club_posts (club_username, posted_at desc);
create index if not exists club_posts_events_idx
  on public.club_posts (posted_at desc) where is_event;

revoke insert, update, delete, truncate
  on public.clubs, public.club_posts from anon, authenticated;

insert into storage.buckets (id, name, public)
values ('club-posts', 'club-posts', true), ('club-avatars', 'club-avatars', true)
on conflict (id) do nothing;
