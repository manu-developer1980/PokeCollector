-- Eliminar la política anterior si existe
drop policy if exists "Enable insert for authentication only" on public.users;

-- Crear nueva política que permite inserciones durante el registro
create policy "Enable insert for registration"
    on public.users
    for insert
    with check (auth.uid() = id or auth.role() = 'anon');

-- Mantener las otras políticas
create policy "Users can view own profile"
    on public.users
    for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on public.users
    for update
    using (auth.uid() = id);

-- Trigger para actualizar updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
  before update on public.users
  for each row
  execute function public.handle_updated_at();
