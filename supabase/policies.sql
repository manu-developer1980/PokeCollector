-- Política para permitir insertar nuevos usuarios durante el registro
create policy "Enable insert for authentication only"
    on public.users
    for insert
    with check (auth.role() = 'authenticated');

-- Política para que los usuarios puedan ver su propio perfil
create policy "Users can view own profile"
    on public.users
    for select
    using (auth.uid() = id);

-- Política para que los usuarios puedan actualizar su propio perfil
create policy "Users can update own profile"
    on public.users
    for update
    using (auth.uid() = id);