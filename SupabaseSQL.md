-- Create tables
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users NOT NULL,
  
  -- Tonnage/weight
  tonnage DECIMAL(10, 2),
  
  -- Pickup information
  pickup_date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  pickup_street_address TEXT NOT NULL,
  pickup_city TEXT NOT NULL,
  pickup_state CHAR(2) NOT NULL,
  pickup_zip_code VARCHAR(10) NOT NULL,
  
  -- Dropoff information
  dropoff_date DATE NOT NULL,
  dropoff_time TIME NOT NULL,
  dropoff_street_address TEXT NOT NULL,
  dropoff_city TEXT NOT NULL,
  dropoff_state CHAR(2) NOT NULL,
  dropoff_zip_code VARCHAR(10) NOT NULL,
  
  -- Status or other fields as needed
  status TEXT DEFAULT 'pending'
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create final policies (only the ones that remain active)
-- Orders policies
CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = TRUE))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = TRUE));

CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = TRUE));

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = TRUE))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = TRUE));

-- User creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone_number)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone_number'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- Create indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_pickup_date ON orders(pickup_date);
CREATE INDEX idx_orders_dropoff_date ON orders(dropoff_date);

create or replace view order_with_profile as
select
  o.*,
  p.first_name,
  p.last_name,
  p.phone_number
from orders o
join profiles p on o.user_id = p.id;