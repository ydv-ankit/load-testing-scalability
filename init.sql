CREATE TABLE IF NOT EXISTS items (
id serial primary key,
content text,
created_at timestamptz default now()
);


-- seed with some rows
INSERT INTO items (content) SELECT 'seed-' || g FROM generate_series(1,100) g;