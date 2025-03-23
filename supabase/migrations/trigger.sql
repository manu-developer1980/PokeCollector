-- Primero, asegurarse de que la función existe y está correctamente definida
create or replace function public.handle_new_user()
returns trigger as $$
declare
  full_name text;
  free_plan_price_id constant text := 'price_1R4KH1EoOyqILXNqxnOSjJHZ'; -- Definido como constante
begin
  -- Extraer el full_name de manera segura
  full_name := COALESCE(
    (new.raw_user_meta_data->>'full_name')::text,
    split_part(new.email, '@', 1)
  );

  -- Insertar en una transacción
  insert into public.users (
    id,
    email,
    full_name,
    created_at,
    updated_at
  ) values (
    new.id,
    new.email,
    full_name,
    new.created_at,
    new.created_at
  );

  -- Crear entrada en la tabla de suscripciones con plan gratuito
  insert into public.subscriptions (
    user_id,
    plan_type,
    status,
    stripe_price_id,  -- Asegurarse de que este campo siempre tenga un valor
    created_at,
    updated_at,
    current_period_end -- Añadir este campo si es requerido
  ) values (
    new.id,
    'aprendiz',
    'active',
    free_plan_price_id,  -- Usar la constante definida
    new.created_at,
    new.created_at,
    new.created_at + interval '100 years' -- Para plan gratuito, fecha lejana
  );

  return new;
exception when others then
  -- Log detallado del error
  raise warning 'Error en handle_new_user para usuario %: %', new.id, SQLERRM;
  return null; -- Cambiar a null para evitar crear usuarios parciales
end;
$$ language plpgsql security definer;

-- Asegurarse de que el trigger existe
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
