-- Supabase Schema for Heirloom Kids Co.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Products Table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  sub_category TEXT,
  brand_tags TEXT[],
  base_price NUMERIC(10, 2) NOT NULL,
  sale_price NUMERIC(10, 2),
  tax_class TEXT,
  fabric_care TEXT,
  seo_title TEXT,
  seo_description TEXT,
  slug TEXT UNIQUE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false
);

-- 2. Product Variants Table
CREATE TABLE product_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  price_override NUMERIC(10, 2),
  stock_count INTEGER DEFAULT 0 NOT NULL,
  low_stock_threshold INTEGER DEFAULT 5 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Product Images Table
CREATE TABLE product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS) for Products (Admin only can write, anyone can read)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Allow public read access to published products" ON products
  FOR SELECT USING (status = 'published');

CREATE POLICY "Allow authenticated read access to all products" ON products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated full access to products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to variants" ON product_variants
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access to variants" ON product_variants
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to images" ON product_images
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access to images" ON product_images
  FOR ALL USING (auth.role() = 'authenticated');
