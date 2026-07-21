-- StudyMate private PDF library and pgvector retrieval index.
-- Safe to run repeatedly in a Supabase SQL editor for this MVP.
create extension if not exists vector;

do $$ begin
  create type public.book_status as enum ('processing', 'ready', 'failed');
exception when duplicate_object then null;
end $$;

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  file_path text not null unique,
  page_count integer not null check (page_count > 0),
  status public.book_status not null default 'processing',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.book_chunks (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  page_number integer not null check (page_number > 0),
  chunk_index integer not null check (chunk_index >= 0),
  content text not null,
  embedding vector(1536) not null,
  created_at timestamptz not null default now(),
  unique(book_id, page_number, chunk_index)
);

create index if not exists book_chunks_book_id_idx on public.book_chunks(book_id);
create index if not exists book_chunks_embedding_idx on public.book_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

alter table public.books enable row level security;
alter table public.book_chunks enable row level security;

drop policy if exists "Owners manage their books" on public.books;
create policy "Owners manage their books" on public.books for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Owners read their chunks" on public.book_chunks;
create policy "Owners read their chunks" on public.book_chunks for select using (auth.uid() = user_id);

-- Called from the server after the caller's Supabase user is verified.
create or replace function public.match_book_chunks(
  p_book_id uuid,
  p_user_id uuid,
  p_query_embedding vector(1536),
  p_match_count integer default 5,
  p_page_number integer default null
)
returns table ("chunkId" uuid, "pageNumber" integer, content text, similarity float)
language sql stable
as $$
  select id as "chunkId", page_number as "pageNumber", content,
    1 - (embedding <=> p_query_embedding) as similarity
  from public.book_chunks
  where book_id = p_book_id
    and user_id = p_user_id
    and (p_page_number is null or page_number between greatest(1, p_page_number - 1) and p_page_number + 1)
  order by embedding <=> p_query_embedding
  limit least(greatest(p_match_count, 1), 8);
$$;

insert into storage.buckets (id, name, public) values ('books', 'books', false)
on conflict (id) do nothing;

drop policy if exists "Users upload their own books" on storage.objects;
create policy "Users upload their own books" on storage.objects for insert to authenticated with check (bucket_id = 'books' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users read their own books" on storage.objects;
create policy "Users read their own books" on storage.objects for select to authenticated using (bucket_id = 'books' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users delete their own books" on storage.objects;
create policy "Users delete their own books" on storage.objects for delete to authenticated using (bucket_id = 'books' and (storage.foldername(name))[1] = auth.uid()::text);
