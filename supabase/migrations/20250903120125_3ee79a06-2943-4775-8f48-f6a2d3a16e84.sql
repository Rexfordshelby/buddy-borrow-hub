-- Performance optimization indexes for high-scale usage (10k+ users)

-- 1. Critical indexes for main queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_items_owner_availability ON public.items(owner_id, availability) WHERE availability = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_items_category_price ON public.items(category, price_per_day) WHERE availability = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_items_location ON public.items USING gin(to_tsvector('english', location)) WHERE availability = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_items_created_at ON public.items(created_at DESC) WHERE availability = true;

-- Services indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_provider_active ON public.services(provider_id, is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_category_price ON public.services(category, price) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_rating ON public.services(rating DESC) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_created_at ON public.services(created_at DESC) WHERE is_active = true;

-- Booking performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_bookings_provider_status ON public.service_bookings(provider_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_bookings_customer_status ON public.service_bookings(customer_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_bookings_date_service ON public.service_bookings(booking_date, service_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_bookings_created_at ON public.service_bookings(created_at DESC);

-- Borrow requests indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_borrow_requests_borrower_status ON public.borrow_requests(borrower_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_borrow_requests_lender_status ON public.borrow_requests(lender_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_borrow_requests_item_dates ON public.borrow_requests(item_id, start_date, end_date);

-- Notifications performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Reviews and ratings
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_reviewer ON public.reviews(reviewer_id);

-- Chat system indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_room_created ON public.chat_messages(room_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_rooms_participants ON public.chat_rooms(participant_1, participant_2);

-- Wallet transactions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallet_transactions_user_type ON public.wallet_transactions(user_id, type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);

-- User favorites
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_favorites_user_item ON public.user_favorites(user_id, item_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_favorites_user_service ON public.user_favorites(user_id, service_id);

-- Full-text search indexes for better search performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_items_search ON public.items USING gin(
  to_tsvector('english', title || ' ' || coalesce(description, '') || ' ' || coalesce(location, ''))
) WHERE availability = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_search ON public.services USING gin(
  to_tsvector('english', title || ' ' || coalesce(description, '') || ' ' || coalesce(location, ''))
) WHERE is_active = true;