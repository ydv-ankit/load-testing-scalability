const express = require('express');
const { Pool } = require('pg');
const client = require('prom-client');


const app = express();
app.use(express.json());


// Prometheus default metrics
client.collectDefaultMetrics();


// Create a histogram for request durations
const httpHistogram = new client.Histogram({
name: 'http_request_duration_ms',
help: 'Duration of HTTP requests in ms',
labelNames: ['method', 'route', 'code'],
buckets: [50, 100, 200, 300, 500, 1000]
});


// DB pool
const pool = new Pool({
host: process.env.PGHOST || 'db',
user: process.env.PGUSER || 'postgres',
password: process.env.PGPASSWORD || 'example',
database: process.env.PGDATABASE || 'postgres',
port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
max: process.env.PGPOOLSIZE ? Number(process.env.PGPOOLSIZE) : 10
});


// simple middleware to time requests
app.use((req, res, next) => {
const end = httpHistogram.startTimer();
res.on('finish', () => {
end({ method: req.method, route: req.route ? req.route.path : req.path, code: res.statusCode });
});
next();
});


app.get('/', async (req, res) => {
try {
const r = await pool.query('SELECT count(*) FROM items');
res.json({ count: Number(r.rows[0].count) });
} catch (err) {
console.error(err);
res.status(500).json({ error: 'db error' });
}
});


app.post('/write', async (req, res) => {
try {
const txt = req.body.text || 'hello';
await pool.query('INSERT INTO items (content) VALUES ($1)', [txt]);
res.json({ ok: true });
} catch (err) {
console.error(err);
res.status(500).json({ error: 'db error' });
}
});


// CPU-bound endpoint to simulate heavy work
function fib(n) { return n < 2 ? n : fib(n-1) + fib(n-2); }
app.get('/cpu', (req, res) => {
const n = Number(req.query.n) || 35;
const v = fib(n);
res.json({ fib: v });
});


// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
try {
res.set('Content-Type', client.register.contentType);
res.end(await client.register.metrics());
} catch (err) {
res.status(500).end(err);
}
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`app listening on ${port}`));