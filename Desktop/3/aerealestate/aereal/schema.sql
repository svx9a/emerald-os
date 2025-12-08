CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  price INTEGER NOT NULL,
  bedrooms INTEGER,
  bathrooms REAL,
  sqft INTEGER,
  status TEXT DEFAULT 'Active',
  type TEXT,
  description TEXT,
  image_key TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT,
  phone TEXT,
  listing_id TEXT,
  message TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Sample luxury listings
INSERT OR IGNORE INTO listings (id, address, price, bedrooms, bathrooms, sqft, status, type, description) VALUES
('L-1001', '124 Ocean Drive, Miami Beach', 12500000, 6, 7.5, 8500, 'Active', 'Oceanfront Estate', 'Ultra-luxury waterfront masterpiece with private dock'),
('L-1002', '45 Central Park West, NYC', 18900000, 5, 6, 6200, 'Coming Soon', 'Penthouse', 'Full-floor residence with panoramic park views');
