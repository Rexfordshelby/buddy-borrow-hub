-- Create a comprehensive order management system

-- Add missing columns to service_bookings for better order management
ALTER TABLE service_bookings 
ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS confirmation_code TEXT,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS provider_response_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
ADD COLUMN IF NOT EXISTS provider_rating INTEGER CHECK (provider_rating >= 1 AND provider_rating <= 5),
ADD COLUMN IF NOT EXISTS customer_review TEXT,
ADD COLUMN IF NOT EXISTS provider_review TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_bookings_order_number ON service_bookings(order_number);
CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON service_bookings(status);
CREATE INDEX IF NOT EXISTS idx_service_bookings_payment_status ON service_bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_service_bookings_booking_date ON service_bookings(booking_date);

-- Update the status options to be more comprehensive
COMMENT ON COLUMN service_bookings.status IS 'pending, confirmed, in_progress, completed, cancelled, rejected';
COMMENT ON COLUMN service_bookings.payment_status IS 'pending, paid, failed, refunded, partially_refunded';

-- Function to generate order numbers
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
$$ LANGUAGE plpgsql;

-- Function to generate confirmation codes
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS TEXT AS $$
BEGIN
    RETURN UPPER(
        SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8)
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number and confirmation code
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
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating codes
DROP TRIGGER IF EXISTS trigger_auto_generate_booking_codes ON service_bookings;
CREATE TRIGGER trigger_auto_generate_booking_codes
    BEFORE INSERT ON service_bookings
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_booking_codes();

-- Function to update service ratings when bookings are reviewed
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
$$ LANGUAGE plpgsql;

-- Create trigger for updating service ratings
DROP TRIGGER IF EXISTS trigger_update_service_rating ON service_bookings;
CREATE TRIGGER trigger_update_service_rating
    AFTER UPDATE ON service_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_service_rating_from_booking();

-- Enhanced notifications for better order tracking
INSERT INTO notifications (user_id, title, message, type, created_at)
SELECT 
    provider_id,
    'New Booking Request',
    'You have a new booking request for ' || (SELECT title FROM services WHERE id = service_bookings.service_id),
    'booking_request',
    NOW()
FROM service_bookings 
WHERE status = 'pending' 
AND created_at > NOW() - INTERVAL '1 hour'
ON CONFLICT DO NOTHING;

-- Create a view for comprehensive booking details
CREATE OR REPLACE VIEW booking_details AS
SELECT 
    sb.*,
    s.title as service_title,
    s.description as service_description,
    s.price as service_price,
    s.price_type as service_price_type,
    s.category as service_category,
    s.location as service_location,
    customer.full_name as customer_name,
    customer.email as customer_email,
    customer.phone as customer_phone,
    provider.full_name as provider_name,
    provider.email as provider_email,
    provider.phone as provider_phone
FROM service_bookings sb
LEFT JOIN services s ON sb.service_id = s.id
LEFT JOIN profiles customer ON sb.customer_id = customer.id
LEFT JOIN profiles provider ON sb.provider_id = provider.id;