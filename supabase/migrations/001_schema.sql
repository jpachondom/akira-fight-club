-- ============================================================
-- AKIRA FIGHT CLUB — Schema completo
-- ============================================================

-- Extensión para UUIDs
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLA: profiles (extiende auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nombre text not null,
  apellido text not null,
  email text not null,
  telefono text,
  fecha_nacimiento date,
  foto_url text,
  rol text not null default 'alumno' check (rol in ('admin', 'instructor', 'alumno')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- TABLA: disciplinas
-- ============================================================
create table public.disciplinas (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  descripcion text,
  color text not null default '#E8000D'
);

-- ============================================================
-- TABLA: planes
-- ============================================================
create table public.planes (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  precio integer not null check (precio > 0),
  duracion_dias integer not null check (duracion_dias > 0),
  clases_incluidas integer,
  descripcion text,
  activo boolean not null default true
);

-- ============================================================
-- TABLA: membresias
-- ============================================================
create table public.membresias (
  id uuid primary key default uuid_generate_v4(),
  alumno_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.planes(id),
  fecha_inicio date not null,
  fecha_fin date not null,
  estado text not null default 'activa' check (estado in ('activa', 'vencida', 'cancelada', 'pendiente_pago')),
  clases_usadas integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TABLA: pagos
-- ============================================================
create table public.pagos (
  id uuid primary key default uuid_generate_v4(),
  membresia_id uuid references public.membresias(id),
  alumno_id uuid not null references public.profiles(id),
  monto integer not null check (monto > 0),
  metodo text not null check (metodo in ('efectivo', 'transferencia', 'debito', 'webpay', 'mercadopago')),
  estado text not null default 'pendiente' check (estado in ('pagado', 'pendiente', 'fallido', 'reembolsado')),
  comprobante_url text,
  notas text,
  fecha_pago timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

-- ============================================================
-- TABLA: horarios (plantillas recurrentes)
-- ============================================================
create table public.horarios (
  id uuid primary key default uuid_generate_v4(),
  disciplina_id uuid not null references public.disciplinas(id),
  instructor_id uuid not null references public.profiles(id),
  dia_semana integer not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fin time not null,
  sala text,
  cupos_max integer not null default 20,
  activo boolean not null default true
);

-- ============================================================
-- TABLA: clases (instancias programadas)
-- ============================================================
create table public.clases (
  id uuid primary key default uuid_generate_v4(),
  horario_id uuid references public.horarios(id),
  disciplina_id uuid not null references public.disciplinas(id),
  instructor_id uuid not null references public.profiles(id),
  fecha date not null,
  hora_inicio time not null,
  hora_fin time not null,
  sala text,
  cupos_max integer not null default 20,
  cupos_ocupados integer not null default 0 check (cupos_ocupados >= 0),
  estado text not null default 'programada' check (estado in ('programada', 'en_curso', 'completada', 'cancelada')),
  notas text
);

-- ============================================================
-- TABLA: reservas
-- ============================================================
create table public.reservas (
  id uuid primary key default uuid_generate_v4(),
  clase_id uuid not null references public.clases(id) on delete cascade,
  alumno_id uuid not null references public.profiles(id),
  estado text not null default 'confirmada' check (estado in ('confirmada', 'cancelada', 'lista_espera', 'asistio', 'no_asistio')),
  created_at timestamptz not null default now(),
  unique(clase_id, alumno_id)
);

-- ============================================================
-- TABLA: asistencia
-- ============================================================
create table public.asistencia (
  id uuid primary key default uuid_generate_v4(),
  clase_id uuid not null references public.clases(id) on delete cascade,
  alumno_id uuid not null references public.profiles(id),
  presente boolean not null default false,
  tomada_por uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(clase_id, alumno_id)
);

-- ============================================================
-- TABLA: notificaciones
-- ============================================================
create table public.notificaciones (
  id uuid primary key default uuid_generate_v4(),
  alumno_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null,
  titulo text not null,
  mensaje text not null,
  leida boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger: crear perfil al registrar usuario en auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, nombre, apellido, email, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', 'Usuario'),
    coalesce(new.raw_user_meta_data->>'apellido', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'rol', 'alumno')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger: incrementar cupos_ocupados al confirmar reserva
create or replace function public.handle_reserva_insert()
returns trigger language plpgsql as $$
begin
  if new.estado = 'confirmada' then
    update public.clases
    set cupos_ocupados = cupos_ocupados + 1
    where id = new.clase_id
      and cupos_ocupados < cupos_max;

    if not found then
      raise exception 'No hay cupos disponibles para esta clase';
    end if;
  end if;
  return new;
end;
$$;

create trigger on_reserva_insert
  after insert on public.reservas
  for each row execute function public.handle_reserva_insert();

-- Trigger: actualizar cupos al cambiar estado de reserva
create or replace function public.handle_reserva_update()
returns trigger language plpgsql as $$
begin
  -- Cancelación de reserva confirmada → decrementar
  if old.estado = 'confirmada' and new.estado = 'cancelada' then
    update public.clases
    set cupos_ocupados = greatest(0, cupos_ocupados - 1)
    where id = new.clase_id;
  end if;

  -- Confirmación de reserva en espera → incrementar
  if old.estado = 'lista_espera' and new.estado = 'confirmada' then
    update public.clases
    set cupos_ocupados = cupos_ocupados + 1
    where id = new.clase_id;
  end if;

  return new;
end;
$$;

create trigger on_reserva_update
  after update on public.reservas
  for each row execute function public.handle_reserva_update();

-- Trigger: incrementar clases_usadas al registrar asistencia
create or replace function public.handle_asistencia_insert()
returns trigger language plpgsql as $$
begin
  if new.presente = true then
    update public.membresias m
    set clases_usadas = clases_usadas + 1
    where m.alumno_id = new.alumno_id
      and m.estado = 'activa'
      and m.fecha_inicio <= (select fecha from public.clases where id = new.clase_id)
      and m.fecha_fin >= (select fecha from public.clases where id = new.clase_id);
  end if;
  return new;
end;
$$;

create trigger on_asistencia_insert
  after insert on public.asistencia
  for each row execute function public.handle_asistencia_insert();

-- Función: generar clases de la semana siguiente desde horarios
create or replace function public.generar_clases_semana(fecha_inicio date default current_date + 7)
returns void language plpgsql as $$
declare
  h public.horarios%rowtype;
  fecha_clase date;
  dia_offset integer;
begin
  for h in select * from public.horarios where activo = true loop
    -- Calcular la fecha del próximo día de la semana
    dia_offset := h.dia_semana - extract(dow from fecha_inicio)::integer;
    if dia_offset < 0 then dia_offset := dia_offset + 7; end if;
    fecha_clase := fecha_inicio + dia_offset;

    -- Insertar solo si no existe
    insert into public.clases (
      horario_id, disciplina_id, instructor_id,
      fecha, hora_inicio, hora_fin, sala, cupos_max, estado
    )
    select
      h.id, h.disciplina_id, h.instructor_id,
      fecha_clase, h.hora_inicio, h.hora_fin, h.sala, h.cupos_max, 'programada'
    where not exists (
      select 1 from public.clases c
      where c.horario_id = h.id and c.fecha = fecha_clase
    );
  end loop;
end;
$$;

-- Función: actualizar estado de membresías vencidas
create or replace function public.actualizar_membresias_vencidas()
returns void language plpgsql as $$
begin
  update public.membresias
  set estado = 'vencida'
  where estado = 'activa'
    and fecha_fin < current_date;
end;
$$;

-- ============================================================
-- RLS POLICIES
-- ============================================================

alter table public.profiles enable row level security;
alter table public.disciplinas enable row level security;
alter table public.planes enable row level security;
alter table public.membresias enable row level security;
alter table public.pagos enable row level security;
alter table public.horarios enable row level security;
alter table public.clases enable row level security;
alter table public.reservas enable row level security;
alter table public.asistencia enable row level security;
alter table public.notificaciones enable row level security;

-- Helper: verificar si el usuario es admin o instructor
create or replace function public.is_admin()
returns boolean language plpgsql security definer as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and rol in ('admin', 'instructor')
  );
end;
$$;

-- profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

create policy "profiles_insert_admin" on public.profiles
  for insert with check (public.is_admin());

-- disciplinas (todos pueden leer, solo admin modifica)
create policy "disciplinas_select_all" on public.disciplinas
  for select using (true);

create policy "disciplinas_manage_admin" on public.disciplinas
  for all using (public.is_admin());

-- planes (todos pueden leer, solo admin modifica)
create policy "planes_select_all" on public.planes
  for select using (true);

create policy "planes_manage_admin" on public.planes
  for all using (public.is_admin());

-- membresias
create policy "membresias_select" on public.membresias
  for select using (auth.uid() = alumno_id or public.is_admin());

create policy "membresias_manage_admin" on public.membresias
  for all using (public.is_admin());

-- pagos
create policy "pagos_select" on public.pagos
  for select using (auth.uid() = alumno_id or public.is_admin());

create policy "pagos_manage_admin" on public.pagos
  for all using (public.is_admin());

-- horarios (todos leen, solo admin modifica)
create policy "horarios_select_all" on public.horarios
  for select using (true);

create policy "horarios_manage_admin" on public.horarios
  for all using (public.is_admin());

-- clases (todos leen, solo admin modifica)
create policy "clases_select_all" on public.clases
  for select using (true);

create policy "clases_manage_admin" on public.clases
  for all using (public.is_admin());

-- reservas
create policy "reservas_select" on public.reservas
  for select using (auth.uid() = alumno_id or public.is_admin());

create policy "reservas_insert_alumno" on public.reservas
  for insert with check (auth.uid() = alumno_id);

create policy "reservas_update" on public.reservas
  for update using (auth.uid() = alumno_id or public.is_admin());

-- asistencia
create policy "asistencia_select" on public.asistencia
  for select using (auth.uid() = alumno_id or public.is_admin());

create policy "asistencia_manage_admin" on public.asistencia
  for all using (public.is_admin());

-- notificaciones
create policy "notificaciones_select" on public.notificaciones
  for select using (auth.uid() = alumno_id);

create policy "notificaciones_update_own" on public.notificaciones
  for update using (auth.uid() = alumno_id);

create policy "notificaciones_manage_admin" on public.notificaciones
  for all using (public.is_admin());

-- ============================================================
-- ÍNDICES
-- ============================================================
create index idx_membresias_alumno on public.membresias(alumno_id);
create index idx_membresias_estado on public.membresias(estado);
create index idx_pagos_alumno on public.pagos(alumno_id);
create index idx_pagos_estado on public.pagos(estado);
create index idx_clases_fecha on public.clases(fecha);
create index idx_reservas_alumno on public.reservas(alumno_id);
create index idx_reservas_clase on public.reservas(clase_id);
create index idx_asistencia_alumno on public.asistencia(alumno_id);
create index idx_notificaciones_alumno on public.notificaciones(alumno_id);
