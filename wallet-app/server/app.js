const express = require('express');
const cors = require('cors');
const { initDb } = require('./config/db');
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

initDb();

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ApexUPI API is running', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 ApexUPI API running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
