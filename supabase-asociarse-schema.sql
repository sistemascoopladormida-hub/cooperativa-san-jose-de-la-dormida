-- Tabla para solicitudes de asociación enviadas desde la web
create table if not exists public.membership_applications (
  id               bigserial primary key,
  nombre_completo  text        not null,
  email            text        not null,
  telefono         text        not null,
  direccion        text        not null,
  ocupacion        text,
  servicios_interes text[],
  acepta_terminos  boolean     not null default false,
  origen           text        not null default 'web',
  estado           text        not null default 'pendiente',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists membership_applications_created_at_idx
  on public.membership_applications (created_at desc);

create index if not exists membership_applications_estado_idx
  on public.membership_applications (estado);

-- Trigger para mantener updated_at
create or replace function public.handle_membership_applications_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_update_set_timestamp_membership_applications
  on public.membership_applications;

create trigger on_update_set_timestamp_membership_applications
before update on public.membership_applications
for each row
execute procedure public.handle_membership_applications_updated_at();


