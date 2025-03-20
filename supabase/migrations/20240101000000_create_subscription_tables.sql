-- Tabla para almacenar la información del cliente de Stripe
create table customers (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    stripe_customer_id text unique not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla para almacenar las suscripciones
create table subscriptions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade not null,
    stripe_subscription_id text unique not null,
    stripe_customer_id text not null,
    stripe_price_id text not null,
    status text not null,
    current_period_end timestamp with time zone not null,
    cancel_at_period_end boolean not null default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Políticas RLS para customers
alter table customers enable row level security;

create policy "Users can view their own customer data."
    on customers for select
    using (auth.uid() = user_id);

-- Políticas RLS para subscriptions
alter table subscriptions enable row level security;

create policy "Users can view their own subscription data."
    on subscriptions for select
    using (auth.uid() = user_id);

-- Triggers para updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_customers_updated_at
    before update on customers
    for each row
    execute function update_updated_at_column();

create trigger update_subscriptions_updated_at
    before update on subscriptions
    for each row
    execute function update_updated_at_column();
