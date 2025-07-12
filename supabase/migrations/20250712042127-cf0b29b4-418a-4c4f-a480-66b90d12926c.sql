
-- Add status tracking for borrow requests with more detailed states
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'negotiating';
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'payment_pending';
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'paid';

-- Add negotiation fields to borrow_requests table
ALTER TABLE public.borrow_requests 
ADD COLUMN IF NOT EXISTS original_price_per_day DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS negotiated_price_per_day DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS negotiation_message TEXT,
ADD COLUMN IF NOT EXISTS payment_session_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Create a negotiations table for tracking price negotiations
CREATE TABLE IF NOT EXISTS public.negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.borrow_requests(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  proposed_price_per_day DECIMAL(10,2) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for negotiations
ALTER TABLE public.negotiations ENABLE ROW LEVEL SECURITY;

-- RLS policies for negotiations
CREATE POLICY "Users can view negotiations for their requests" ON public.negotiations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.borrow_requests 
      WHERE id = request_id AND (borrower_id = auth.uid() OR lender_id = auth.uid())
    )
  );

CREATE POLICY "Users can create negotiations" ON public.negotiations
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.borrow_requests 
      WHERE id = request_id AND (borrower_id = auth.uid() OR lender_id = auth.uid())
    )
  );

-- Update messages table to support request-level chat
-- (This table already exists and works for chat)

-- Create notifications table for order updates
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  request_id UUID REFERENCES public.borrow_requests(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- request_received, request_approved, price_negotiated, payment_received, etc.
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);
