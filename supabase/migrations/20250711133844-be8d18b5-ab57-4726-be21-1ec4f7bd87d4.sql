
-- Create enum for item categories
CREATE TYPE item_category AS ENUM (
  'electronics',
  'tools',
  'sports',
  'books',
  'furniture',
  'kitchen',
  'automotive',
  'clothing',
  'gaming',
  'other'
);

-- Create enum for item condition
CREATE TYPE item_condition AS ENUM ('new', 'like_new', 'good', 'fair');

-- Create enum for request status
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected', 'active', 'completed', 'cancelled');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create items table for listings
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category item_category NOT NULL,
  condition item_condition NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  location TEXT,
  availability BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create borrow requests table
CREATE TABLE public.borrow_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  borrower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status request_status DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.borrow_requests(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table for chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.borrow_requests(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for items
CREATE POLICY "Anyone can view available items" ON public.items FOR SELECT USING (availability = true);
CREATE POLICY "Owners can view their items" ON public.items FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create items" ON public.items FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their items" ON public.items FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete their items" ON public.items FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for borrow requests
CREATE POLICY "Users can view their requests" ON public.borrow_requests FOR SELECT USING (auth.uid() = borrower_id OR auth.uid() = lender_id);
CREATE POLICY "Users can create requests" ON public.borrow_requests FOR INSERT WITH CHECK (auth.uid() = borrower_id);
CREATE POLICY "Lenders can update requests" ON public.borrow_requests FOR UPDATE USING (auth.uid() = lender_id OR auth.uid() = borrower_id);

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their requests" ON public.messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.borrow_requests 
      WHERE id = request_id AND (borrower_id = auth.uid() OR lender_id = auth.uid())
    )
  );
CREATE POLICY "Users can send messages" ON public.messages 
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND 
    EXISTS (
      SELECT 1 FROM public.borrow_requests 
      WHERE id = request_id AND (borrower_id = auth.uid() OR lender_id = auth.uid())
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update item ratings
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to update ratings when new review is added
CREATE TRIGGER update_rating_on_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_user_rating();
