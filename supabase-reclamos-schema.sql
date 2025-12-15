-- Tabla para reclamos ingresados desde la web
-- (si ya creaste la tabla con nombre "complaints" en Supabase UI,
--  puedes adaptar este script reemplazando "reclamos" por "complaints")
create table if not exists public.complaints (
  id           bigserial primary key,
  nombre       text        not null,
  email        text        not null,
  telefono     text,
  tipo         text        not null,
  mensaje      text        not null,
  origen       text        not null default 'web',
  estado       text        not null default 'pendiente',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists complaints_created_at_idx on public.complaints (created_at desc);
create index if not exists complaints_estado_idx on public.complaints (estado);

-- Trigger para mantener updated_at
create or replace function public.handle_complaints_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_update_set_timestamp_complaints on public.complaints;

create trigger on_update_set_timestamp_complaints
before update on public.complaints
for each row
execute procedure public.handle_complaints_updated_at();


