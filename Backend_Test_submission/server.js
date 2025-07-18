const express = require('express');
const log = require('./logs'); 
const cors = require("cors")

const {
  createShortUrl,
  getShortUrl,
  recordClick,
  getStats,
} = require('./shortner'); 

const app = express();
const PORT = 3000;


// Middleware to parse JSON in request bodies
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true  
}))

// Route to create a short URL
app.post('/shorturls', async (req, res) => {
  try {
    const { url, validity, shortcode } = req.body;
    const result = await createShortUrl({ url, validity, shortcode });
    res.status(201).json(result);
  } catch (err) {
    await log('backend', 'error', 'handler', err.msg || 'Error in /shorturls');
    res.status(err.code || 500).json({ error: err.msg || 'Internal Server Error' });
  }
});

// Route to visit a short URL and redirect
app.get('/shorturls/:code', async (req, res) => {
  const code = req.params.code;
  try {
    const url = await getShortUrl(code);

    // Log the click
    await recordClick(code, {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.redirect(url);
  } catch (err) {
    await log('backend', 'error', 'handler', err.msg || 'Error in /shorturls/:code');
    res.status(err.code || 500).json({ error: err.msg || 'Internal Server Error' });
  }
});

// Route to get stats for a given shortcode
app.get('/shorturls/:code/stats', async (req, res) => {
  const code = req.params.code;
  try {
    const stats = await getStats(code);
    res.json(stats);
  } catch (err) {
    await log('backend', 'error', 'handler', err.msg || 'Error in /shorturls/:code/stats');
    res.status(err.code || 500).json({ error: err.msg || 'Internal Server Error' });
  }
});

// Optional root route
app.get('/', (req, res) => {
  res.send('✅ URL Shortener service is running');
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server started at http://localhost:${PORT}`);
});
