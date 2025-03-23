CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    _full_name TEXT;
    _now TIMESTAMPTZ;
    _default_price_id TEXT := 'price_1R4KH1EoOyqILXNqxnOSjJHZ';
BEGIN
    _now := now();
    _full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        'Usuario ' || substr(NEW.id::text, 1, 8)
    );

    -- Add detailed logging
    RAISE LOG 'handle_new_user: Starting transaction for user ID: %', NEW.id;

    -- Use transaction to ensure both inserts succeed or fail together
    BEGIN
        -- Insert user
        INSERT INTO public.users (
            id,
            email,
            full_name,
            has_seen_onboarding,
            level,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            LOWER(NEW.email),
            _full_name,
            false,
            'aprendiz',
            _now,
            _now
        );

        RAISE LOG 'handle_new_user: User inserted successfully';

        -- Create initial subscription
        INSERT INTO public.subscriptions (
            user_id,
            plan_type,
            stripe_price_id,
            status,
            current_period_end,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            'aprendiz',
            _default_price_id,
            'active',
            _now + INTERVAL '1 month',
            true,
            _now,
            _now
        );

        RAISE LOG 'handle_new_user: Subscription created successfully';
        
        RETURN NEW;
    EXCEPTION 
        WHEN unique_violation THEN
            RAISE LOG 'handle_new_user: Unique violation occurred';
            IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
                RETURN NEW;
            ELSE
                RAISE LOG 'handle_new_user: Unique violation details: %', SQLERRM;
                RETURN NULL;
            END IF;
        WHEN OTHERS THEN
            RAISE LOG 'handle_new_user: Error occurred - SQLSTATE: %, SQLERRM: %', SQLSTATE, SQLERRM;
            RETURN NULL;
    END;
END;
$$;