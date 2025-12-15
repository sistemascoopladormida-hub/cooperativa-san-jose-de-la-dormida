-- Tabla para noticias del sitio
create table if not exists public.news_posts (
  id          bigserial primary key,
  slug        text not null unique,
  title       text not null,
  excerpt     text not null,
  content     text not null,
  date        timestamptz not null default now(),
  author      text not null,
  category    text not null,
  image_url   text,
  read_time   text,
  tags        text[],
  created_at  timestamptz not null default now()
);

create index if not exists news_posts_date_idx on public.news_posts (date desc);
create index if not exists news_posts_category_idx on public.news_posts (category);

-- Opcional: habilitar RLS si quieres reglas más estrictas
-- alter table public.news_posts enable row level security;

-- Bucket de Storage para imágenes de noticias.
-- Esto se ejecuta en la base de datos de Supabase (SQL editor).
insert into storage.buckets (id, name, public)
values ('news-images', 'news-images', true)
on conflict (id) do nothing;


