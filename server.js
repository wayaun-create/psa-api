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
