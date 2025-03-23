-- Check if you have a trigger like this
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- The function might be failing. Update it to include error handling:
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, created_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.created_at
  );
  return new;
exception when others then
  -- Log the error
  raise log 'Error in handle_new_user: %', SQLERRM;
  return new;
end;
$$ language plpgsql security definer;