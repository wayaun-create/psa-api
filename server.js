const express = require('express');
const cors = require('cors');

const app = express();

const allowed = ['https://psa-viewer.vercel.app'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.get('/health', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('<title>Hello from Render!</title>');
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('API up on port ' + port);
});

//
// simple in-memory seed for now (replace with DB later)
const PARCELS = [
  { id: 'demo-1', parcelNumber: '001A-0001', county: 'Butts', status: 'research' },
  { id: 'demo-2', parcelNumber: '001A-0002', county: 'Butts', status: 'noticed' },
];

// attach tax sale info to demo parcels
PARCELS[0].taxSale = { name: 'Butts May 2025', saleDate: '2025-05-06' };
PARCELS[1].taxSale = { name: 'Butts May 2025', saleDate: '2025-05-06' };

// demo notices
const NOTICES = {
  'demo-1': [
    { id: 'n-1', noticeType: '30_day', preparedAt: '2025-03-15T12:00:00Z' },
    { id: 'n-2', noticeType: '20_day', preparedAt: '2025-04-10T12:00:00Z' }
  ],
  'demo-2': [
    { id: 'n-3', noticeType: '30_day', preparedAt: '2025-03-16T12:00:00Z' }
  ]
};

// demo mail
const MAIL = {
  'demo-1': [
    {
      mailPackage: { certifiedNumber: '9207 1901 4298 0468 3014 68', mailClass: 'certified', submittedAt: '2025-04-11T14:30:00Z' },
      trackingEvents: [
        { eventTime: '2025-04-13T09:10:00Z', statusCode: 'in_transit', location: 'Atlanta, GA' },
        { eventTime: '2025-04-15T11:30:00Z', statusCode: 'delivered', location: 'Jackson, GA' }
      ]
    }
  ],
  'demo-2': []
};
// Logging middleware
app.use((req, res, next) => {
  const t0 = Date.now();
  res.on('finish', () => console.log(`${req.method} ${req.url} ${res.statusCode} ${Date.now()-t0}ms`));
  next();
});

// GET /v1/parcels with pagination
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

// parcel detail
app.get('/v1/parcels/:id', (req, res) => {
  const parcel = PARCELS.find(p => p.id === req.params.id);
  if (!parcel) return res.status(404).json({ error: 'not_found' });
  res.json({
    ...parcel,
    notices: NOTICES[parcel.id] || [],
    mailItems: MAIL[parcel.id] || []
  });
});
