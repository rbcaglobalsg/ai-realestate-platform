-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  price NUMERIC(15, 2),
  area NUMERIC(10, 2),
  type VARCHAR(50),
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample property data
INSERT INTO properties (title, address, lat, lng, price, area, type, description, image_url) VALUES
  ('Modern Apartment in Gangnam', '123 Gangnam-daero, Seocho-gu, Seoul', 37.4979, 127.0276, 850000000, 84.5, 'apartment', 'Luxury apartment with city view, near Gangnam Station. Fully renovated with modern amenities.', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),
  ('Cozy Studio in Hongdae', '45 Hongik University St, Mapo-gu, Seoul', 37.5502, 126.9219, 350000000, 28.7, 'studio', 'Compact studio in the heart of Hongdae. Perfect for young professionals. Walking distance to nightlife and subway.', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'),
  ('Spacious Family Home in Bundang', '789 Bundang-gu, Seongnam-si, Gyeonggi-do', 37.3596, 127.1052, 1200000000, 165.2, 'house', 'Beautiful family home with garden. 4 bedrooms, 3 bathrooms. Near top-rated schools and parks.', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'),
  ('Penthouse in Apgujeong', '56 Apgujeong-ro, Gangnam-gu, Seoul', 37.5272, 127.0275, 2500000000, 210.0, 'penthouse', 'Premium penthouse with panoramic view of the Han River. Private terrace and concierge service.', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'),
  ('Commercial Space in Myeongdong', '12 Myeongdong-gil, Jung-gu, Seoul', 37.5636, 126.9826, 5000000000, 320.5, 'commercial', 'Prime commercial space in Myeongdong shopping district. High foot traffic area. Ideal for retail or F&B.', 'https://images.unsplash.com/photo-1486406146926-c627a92c1e10?w=800');
