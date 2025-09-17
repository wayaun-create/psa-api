const express = require('express');
const cors = require('cors');

const app = express();

// CORS whitelist
const allowed = ['https://psa-viewer.vercel.app'];
app.use(cors({
  origin: (origin, cb) => (!origin || allowed.includes(origin))
    ? cb(null, true)
    : cb(new Error('Not allowed by CORS')),
  methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// Logging middleware
app.use((req, res, next) => {
  const t0 = Date.now();
  res.on('finish', () => console.log(req.method + ' ' + req.url + ' ' + res.statusCode + ' ' + (Date.now()-t0) + 'ms'));
  next();
});

// In-memory seed for now (replace with DB later)
const PARCELS = [
  { id: 'demo-1', parcelNumber: '001A-0001', county: 'Butts', status: 'research' },
  { id: 'demo-2', parcelNumber: '001A-0002', county: 'Butts', status: 'noticed' }
];

// Health route
app.get('/health', (_, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// Parcels route
app.get('/v1/parcels', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const cursor = req.query.cursor || null;

  let start = 0;
  if (cursor) {
    const idx = PARCELS.findIndex(p => p.id === cursor);
    start = idx >= 0 ? idx + 1 : 0;
  }
  const slice = PARCELS.slice(start, start + limit);
  const nextCursor = (start + limit) < PARCELS.length ? PARCELS[start + limit - 1].id : null;
  res.json({ items: slice, nextCursor });
});

// Root route
app.get('/', (_, res) => {
  res.send('<title>Hello from Render!</title>');
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('API up on port ' + port);
});
