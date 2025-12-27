-- SQLite 3 Schema for Agency AI White-Label
-- Optimized for Cloudflare D1

DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS houses;
DROP TABLE IF EXISTS tenants;

CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS houses (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT, -- Villa, Condo, Penthouse, Estate
    price REAL,
    image_url TEXT,
    guests INTEGER,
    beds INTEGER,
    baths INTEGER,
    sqft REAL,
    lat REAL,
    lng REAL,
    status TEXT DEFAULT 'available', -- available, booked, maintenance
    ai_insight TEXT, -- AI-generated market analysis
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT NOT NULL,
    house_id TEXT,
    task_type TEXT NOT NULL, -- viewing, maintenance, ROI_analysis
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (house_id) REFERENCES houses(id)
);

CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    interest TEXT, -- Deprecated in favor of type
    type TEXT, -- Villa, Condo, etc.
    budget REAL,
    status TEXT DEFAULT 'new', -- new, contacted, qualified, closed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Indices for high-speed multi-tenant filtering
CREATE INDEX IF NOT EXISTS idx_houses_tenant ON houses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_tenant ON tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_tenant ON leads(tenant_id);

-- Vector storage for Intelligent Search (Semantic AI)
-- Optimized for SQLite/D1 without native vector type
CREATE TABLE IF NOT EXISTS property_embeddings (
    property_id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    embedding TEXT NOT NULL, -- JSON array of floats
    last_indexed DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES houses(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
CREATE INDEX IF NOT EXISTS idx_embeddings_tenant ON property_embeddings(tenant_id);
