
-- Create services table for storing service listings
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  price_type TEXT NOT NULL DEFAULT 'per_hour', -- 'per_hour', 'per_service', 'per_day', 'fixed'
  location TEXT,
  availability TEXT,
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create service_requests table for service bookings
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) NOT NULL,
  customer_id UUID REFERENCES auth.users NOT NULL,
  provider_id UUID REFERENCES auth.users NOT NULL,
  message TEXT,
  requested_date DATE,
  requested_time TIME,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'online', -- 'online', 'cash_on_delivery'
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'completed', 'cancelled'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'cash_pending'
  payment_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create wallet_transactions table for tracking all transactions
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL, -- 'payment_received', 'payment_sent', 'service_payment', 'withdrawal', 'deposit'
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  related_request_id UUID, -- can reference borrow_requests or service_requests
  related_service_id UUID REFERENCES public.services(id),
  from_user_id UUID REFERENCES auth.users,
  to_user_id UUID REFERENCES auth.users,
  status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_wallets table for tracking balances
CREATE TABLE public.user_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  available_balance NUMERIC DEFAULT 0,
  pending_balance NUMERIC DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Providers can view their services" ON public.services
  FOR SELECT USING (auth.uid() = provider_id);

CREATE POLICY "Providers can create services" ON public.services
  FOR INSERT WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update their services" ON public.services
  FOR UPDATE USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete their services" ON public.services
  FOR DELETE USING (auth.uid() = provider_id);

-- Add RLS policies for service_requests
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their service requests" ON public.service_requests
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = provider_id);

CREATE POLICY "Customers can create service requests" ON public.service_requests
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Providers and customers can update requests" ON public.service_requests
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = provider_id);

-- Add RLS policies for wallet_transactions
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions" ON public.wallet_transactions
  FOR INSERT WITH CHECK (true);

-- Add RLS policies for user_wallets
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their wallet" ON public.user_wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their wallet" ON public.user_wallets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their wallet" ON public.user_wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to initialize wallet for new users
CREATE OR REPLACE FUNCTION public.initialize_user_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to initialize wallet when user profile is created
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_wallet();
