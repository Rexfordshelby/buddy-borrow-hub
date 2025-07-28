-- Fix security issues from the previous migration

-- Remove the security definer view and replace with proper RLS
DROP VIEW IF EXISTS booking_details;

-- Fix function search paths for security
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_order_number TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        new_order_number := 'ORD-' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 100000)::TEXT, 5, '0');
        
        -- Check if this order number already exists
        IF NOT EXISTS (SELECT 1 FROM service_bookings WHERE order_number = new_order_number) THEN
            RETURN new_order_number;
        END IF;
        
        -- If it exists, try again with a slight variation
        counter := counter + 1;
        new_order_number := new_order_number || '-' || counter;
        
        -- Safety check to avoid infinite loop
        IF counter > 100 THEN
            new_order_number := 'ORD-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || (RANDOM() * 1000)::INTEGER;
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp;

-- Fix generate_confirmation_code function
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS TEXT AS $$
BEGIN
    RETURN UPPER(
        SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8)
    );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp;

-- Fix auto_generate_booking_codes function
CREATE OR REPLACE FUNCTION auto_generate_booking_codes()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    
    IF NEW.confirmation_code IS NULL THEN
        NEW.confirmation_code := generate_confirmation_code();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp;

-- Fix update_service_rating_from_booking function
CREATE OR REPLACE FUNCTION update_service_rating_from_booking()
RETURNS TRIGGER AS $$
BEGIN
    -- Update service rating when customer provides rating
    IF NEW.customer_rating IS NOT NULL AND (OLD.customer_rating IS NULL OR OLD.customer_rating != NEW.customer_rating) THEN
        UPDATE services 
        SET 
            rating = (
                SELECT COALESCE(AVG(customer_rating::DECIMAL), 0) 
                FROM service_bookings 
                WHERE service_id = NEW.service_id 
                AND customer_rating IS NOT NULL
                AND status = 'completed'
            ),
            total_reviews = (
                SELECT COUNT(*) 
                FROM service_bookings 
                WHERE service_id = NEW.service_id 
                AND customer_rating IS NOT NULL
                AND status = 'completed'
            )
        WHERE id = NEW.service_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp;

-- Fix other existing functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.initialize_user_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    rating = (
      SELECT COALESCE(AVG(rating::DECIMAL), 0) 
      FROM public.reviews 
      WHERE reviewee_id = NEW.reviewee_id
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE reviewee_id = NEW.reviewee_id
    )
  WHERE id = NEW.reviewee_id;
  
  RETURN NEW;
END;
$$;