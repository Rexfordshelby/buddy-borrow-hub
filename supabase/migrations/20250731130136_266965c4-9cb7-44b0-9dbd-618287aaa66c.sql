-- Insert realistic mock items with correct enum values
INSERT INTO items (title, description, category, condition, price_per_day, deposit_amount, location, images, owner_id) VALUES
-- Electronics
('MacBook Pro 16" M3 Pro', 'Latest MacBook Pro with M3 Pro chip, 32GB RAM, 1TB SSD. Perfect for video editing, development, and professional work. Comes with original charger and box.', 'electronics', 'like_new', 89.99, 1500.00, 'San Francisco, CA', 
 '{"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=400&fit=crop", "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=400&fit=crop"}', 
 (SELECT id FROM profiles LIMIT 1)),

('Sony A7R V Camera Kit', 'Professional mirrorless camera with 61MP sensor. Includes 24-70mm f/2.8 lens, 64GB memory card, extra batteries, and camera bag. Perfect for photography projects.', 'electronics', 'like_new', 125.00, 2500.00, 'Los Angeles, CA',
 '{"https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500&h=400&fit=crop", "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&h=400&fit=crop"}',
 (SELECT id FROM profiles LIMIT 1)),

('iPad Pro 12.9" with Apple Pencil', 'Latest iPad Pro with M2 chip, 256GB storage. Includes Apple Pencil 2nd gen, Magic Keyboard, and screen protector. Great for digital art and presentations.', 'electronics', 'like_new', 49.99, 800.00, 'New York, NY',
 '{"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=400&fit=crop", "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=500&h=400&fit=crop"}',
 (SELECT id FROM profiles LIMIT 1)),

-- Tools
('Professional Drill Set - DeWalt', 'Complete 20V MAX cordless drill set with impact driver, 2 batteries, charger, and 100+ piece accessory kit. Perfect for home improvement projects.', 'tools', 'good', 35.00, 200.00, 'Austin, TX',
 '{"https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&h=400&fit=crop", "https://images.unsplash.com/photo-1609205780303-27fec4e79cb2?w=500&h=400&fit=crop"}',
 (SELECT id FROM profiles LIMIT 1)),

('Table Saw - Bosch Professional', 'High-precision table saw with fence system. Ideal for woodworking projects, cabinet making, and precise cuts. Includes blade set and safety equipment.', 'tools', 'like_new', 75.00, 500.00, 'Portland, OR',
 '{"https://images.unsplash.com/photo-1581795669633-91ef7c9be611?w=500&h=400&fit=crop", "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=400&fit=crop"}',
 (SELECT id FROM profiles LIMIT 1)),

-- Sports Equipment
('Road Bike - Trek Domane SL6', 'Carbon fiber road bike, size 56cm. Shimano Ultegra groupset, comes with helmet, bike computer, and repair kit. Perfect for long rides and training.', 'sports', 'like_new', 45.00, 800.00, 'Denver, CO',
 '{"https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=400&fit=crop", "https://images.unsplash.com/photo-1558625157-02d474a3f8bf?w=500&h=400&fit=crop"}',
 (SELECT id FROM profiles LIMIT 1)),

('Surfboard - 9ft Longboard', 'Classic longboard perfect for beginners and experienced surfers. Includes leash, wax, and soft racks for car transport. Great for weekend beach trips.', 'sports', 'good', 25.00, 300.00, 'San Diego, CA',
 '{"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop", "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=500&h=400&fit=crop"}',
 (SELECT id FROM profiles LIMIT 1)),

('Kayak - Ocean Fishing Kayak', 'Stable fishing kayak with rod holders, tackle storage, and paddle. Perfect for ocean or lake fishing adventures. Includes life jacket and dry bag.', 'sports', 'like_new', 55.00, 600.00, 'Seattle, WA',
 '{"https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=500&h=400&fit=crop", "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500&h=400&fit=crop"}',
 (SELECT id FROM profiles LIMIT 1)),

-- Furniture
('Vintage Leather Sofa', 'Genuine leather Chesterfield sofa in rich brown. Perfect for photo shoots, events, or temporary living situations. Seats 3 comfortably.', 'furniture', 'good', 85.00, 500.00, 'Chicago, IL',
 '{"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=400&fit=crop", "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=400&fit=crop"}',
 (SELECT id FROM profiles LIMIT 1)),

('Standing Desk - Adjustable', 'Electric height-adjustable standing desk, 60"x30". Memory presets, cable management, and anti-collision feature. Great for home office setup.', 'furniture', 'like_new', 40.00, 400.00, 'Boston, MA',
 '{"https://images.unsplash.com/photo-1541558869434-2840d308329a?w=500&h=400&fit=crop", "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&h=400&fit=crop"}',
 (SELECT id FROM profiles LIMIT 1)),

-- Gaming
('Gaming PC - RTX 4080 Setup', 'High-end gaming PC with RTX 4080, AMD Ryzen 9, 32GB RAM, 2TB NVMe SSD. Perfect for streaming, gaming, and content creation. Includes RGB peripherals.', 'gaming', 'like_new', 95.00, 2000.00, 'Miami, FL',
 '{"https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=500&h=400&fit=crop", "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&h=400&fit=crop"}',
 (SELECT id FROM profiles LIMIT 1)),

('PlayStation 5 Console Bundle', 'PS5 console with 2 controllers, charging dock, and 5 popular games including Spider-Man 2, God of War, and FIFA 24. Perfect for gaming parties.', 'gaming', 'like_new', 65.00, 600.00, 'Las Vegas, NV',
 '{"https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&h=400&fit=crop", "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&h=400&fit=crop"}',
 (SELECT id FROM profiles LIMIT 1)),

-- Kitchen
('KitchenAid Stand Mixer Pro', 'Professional 6-quart stand mixer in red. Includes pasta attachment, dough hook, and mixing bowls. Perfect for baking enthusiasts and catering events.', 'kitchen', 'like_new', 30.00, 350.00, 'Nashville, TN',
 '{"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop", "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=400&fit=crop"}',
 (SELECT id FROM profiles LIMIT 1)),

('Espresso Machine - Breville Barista', 'Professional espresso machine with built-in grinder, steam wand, and precision temperature control. Includes coffee beans and cleaning kit.', 'kitchen', 'like_new', 25.00, 400.00, 'Portland, OR',
 '{"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=400&fit=crop", "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=400&fit=crop"}',
 (SELECT id FROM profiles LIMIT 1)),

-- Automotive
('Pressure Washer - Commercial Grade', '3000 PSI electric pressure washer with multiple nozzles and detergent tank. Perfect for cleaning cars, driveways, and outdoor furniture.', 'automotive', 'good', 45.00, 300.00, 'Phoenix, AZ',
 '{"https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=400&fit=crop", "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500&h=400&fit=crop"}',
 (SELECT id FROM profiles LIMIT 1));

-- Update profiles with realistic data
UPDATE profiles SET 
  full_name = CASE 
    WHEN id = (SELECT id FROM profiles ORDER BY created_at LIMIT 1) THEN 'Emily Johnson'
    ELSE full_name
  END,
  rating = 4.8,
  total_reviews = 15,
  location = 'San Francisco, CA',
  bio = 'Tech enthusiast and part-time photographer. I rent out my high-quality equipment to help fellow creators make amazing content!'
WHERE id = (SELECT id FROM profiles ORDER BY created_at LIMIT 1);