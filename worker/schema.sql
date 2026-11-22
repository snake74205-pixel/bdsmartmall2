CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  sub_category TEXT DEFAULT '',
  buying_price REAL DEFAULT 0,
  regular_price REAL DEFAULT 0,
  selling_price REAL NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT DEFAULT '',
  vendor_id TEXT DEFAULT 'bdsmartmall-official',
  source_type TEXT DEFAULT 'manual',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  zone TEXT DEFAULT 'inside_dhaka',
  payment_method TEXT DEFAULT 'open_box_cod',
  advance_paid REAL DEFAULT 0,
  subtotal REAL DEFAULT 0,
  delivery_fee REAL DEFAULT 70,
  total_amount REAL DEFAULT 0,
  cost_of_goods REAL DEFAULT 0,
  courier_fee REAL DEFAULT 0,
  fraud_score INTEGER DEFAULT 85,
  status TEXT DEFAULT 'pending',
  items_json TEXT DEFAULT '[]',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'marketing',
  amount REAL NOT NULL,
  note TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reels (
  id TEXT PRIMARY KEY,
  platform TEXT DEFAULT 'youtube',
  video_url TEXT NOT NULL,
  title TEXT NOT NULL,
  product_id TEXT,
  product_title TEXT,
  product_price REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS page_layouts (
  id TEXT PRIMARY KEY,
  sections_json TEXT NOT NULL,
  custom_html TEXT DEFAULT '',
  custom_css TEXT DEFAULT '',
  custom_js TEXT DEFAULT '',
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  registration_fee REAL DEFAULT 0,
  joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
  commission_rate REAL DEFAULT 0.05
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor TEXT DEFAULT 'admin',
  action TEXT NOT NULL,
  detail TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
