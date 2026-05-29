const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All property routes require authentication
router.use(authMiddleware);

// GET /api/properties - List all properties
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, title, address, lat, lng, price, area, type, image_url, created_at FROM properties ORDER BY created_at DESC'
    );
    res.json({ properties: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('Get properties error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/properties/:id - Get property detail
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'SELECT id, title, address, lat, lng, price, area, type, description, image_url, created_at FROM properties WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    res.json({ property: result.rows[0] });
  } catch (err) {
    console.error('Get property error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
