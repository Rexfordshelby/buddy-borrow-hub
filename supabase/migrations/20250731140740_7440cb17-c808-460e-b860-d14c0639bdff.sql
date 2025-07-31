-- Create user_favorites table for storing user favorites
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID NULL,
  service_id UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_user_favorites_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_favorites_item_id FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_favorites_service_id FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  CONSTRAINT check_user_favorites_item_or_service CHECK (
    (item_id IS NOT NULL AND service_id IS NULL) OR 
    (item_id IS NULL AND service_id IS NOT NULL)
  )
);

-- Enable Row Level Security
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for user_favorites
CREATE POLICY "Users can view their own favorites" 
ON public.user_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
ON public.user_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.user_favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create unique constraint to prevent duplicate favorites
CREATE UNIQUE INDEX idx_user_favorites_user_item ON public.user_favorites(user_id, item_id) WHERE item_id IS NOT NULL;
CREATE UNIQUE INDEX idx_user_favorites_user_service ON public.user_favorites(user_id, service_id) WHERE service_id IS NOT NULL;