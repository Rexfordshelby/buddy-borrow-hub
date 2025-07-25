-- Add payment_session_id column to service_bookings table
ALTER TABLE public.service_bookings 
ADD COLUMN payment_session_id TEXT;