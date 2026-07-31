const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/db');
const { generateToken, authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ==================== REGISTER ====================
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Email, password, first name, and last name are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const db = getDb();

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const upiId = `${first_name.toLowerCase()}${last_name.toLowerCase()}${Math.floor(100 + Math.random() * 900)}@upi`;

    const result = db.prepare(
      'INSERT INTO users (email, password, first_name, last_name, phone, upi_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(email, hashedPassword, first_name, last_name, phone || null, upiId);

    const token = generateToken({
      id: result.lastInsertRowid,
      email,
      first_name,
      last_name,
      upi_id: upiId,
    });

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: result.lastInsertRowid,
        email,
        first_name,
        last_name,
        phone: phone || null,
        upi_id: upiId,
        balance: 0,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ==================== LOGIN ====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = getDb();

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      upi_id: user.upi_id,
    });

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        upi_id: user.upi_id,
        balance: user.balance,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ==================== GET CURRENT USER ====================
router.get('/me', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare(
      'SELECT id, email, first_name, last_name, phone, upi_id, balance, is_verified, created_at FROM users WHERE id = ?'
    ).get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
