-- create table if it doesn't exist
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  content TEXT,
  created_at timestamptz DEFAULT now()
);

-- insert 1 million rows
INSERT INTO items (content)
SELECT 'row-' || g
FROM generate_series(1,1000000) g;
