create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.users enable row level security;

-- Crear política para que los usuarios puedan ver su propio perfil
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

-- Crear política para que los usuarios puedan actualizar su propio perfil
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Trigger para manejar created_at y updated_at
create trigger handle_updated_at before update on public.users
  for each row execute procedure moddatetime (updated_at);

-- Trigger para crear perfil de usuario automáticamente
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();