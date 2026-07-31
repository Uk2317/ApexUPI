const express = require('express');
const { getDb } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/balance', (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT balance, upi_id FROM users WHERE id = ?').get(req.user.id);
    res.json({ balance: user.balance, upi_id: user.upi_id });
  } catch (err) {
    console.error('Balance error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/add-money', (req, res) => {
  try {
    const { amount, method, payment_method_id, note } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid amount.' });
    }
    if (amount > 100000) {
      return res.status(400).json({ error: 'Maximum ₹1,00,000 per transaction.' });
    }
    if (!method || !['bank', 'credit_card', 'debit_card'].includes(method)) {
      return res.status(400).json({ error: 'Please select a valid payment method.' });
    }

    const db = getDb();

    if (!payment_method_id) {
      return res.status(400).json({ error: 'Payment method is required.' });
    }

    const pm = db.prepare('SELECT * FROM payment_methods WHERE id = ? AND user_id = ?').get(payment_method_id, req.user.id);
    if (!pm) {
      return res.status(400).json({ error: 'Invalid payment method.' });
    }
    if (pm.type !== method) {
      return res.status(400).json({ error: 'Payment method type does not match transaction method.' });
    }

    const referenceId = `ADD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    db.prepare('UPDATE users SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(amount, req.user.id);

    db.prepare(
      'INSERT INTO transactions (sender_id, amount, type, method, note, status, reference_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, amount, 'added', method, note || 'Added money to wallet', 'completed', referenceId);

    const updatedUser = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.user.id);

    res.json({
      message: `₹${amount.toLocaleString('en-IN')} added successfully!`,
      new_balance: updatedUser.balance,
      reference_id: referenceId,
    });
  } catch (err) {
    console.error('Add money error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

router.post('/send', (req, res) => {
  try {
    const { recipient_upi_id, amount, note } = req.body;

    if (!recipient_upi_id) {
      return res.status(400).json({ error: 'Please enter a recipient UPI ID.' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid amount.' });
    }
    if (amount > 50000) {
      return res.status(400).json({ error: 'Maximum ₹50,000 per transfer.' });
    }

    const db = getDb();

    const sender = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (sender.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance. Please add money first.' });
    }

    const recipient = db.prepare('SELECT * FROM users WHERE upi_id = ?').get(recipient_upi_id);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found. Check the UPI ID and try again.' });
    }
    if (recipient.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot send money to yourself.' });
    }

    const referenceId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const transfer = db.transaction(() => {

      db.prepare('UPDATE users SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(amount, sender.id);

      db.prepare('UPDATE users SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(amount, recipient.id);

      db.prepare(
        'INSERT INTO transactions (sender_id, receiver_id, amount, type, method, note, status, reference_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(sender.id, recipient.id, amount, 'sent', 'upi', note || '', 'completed', referenceId);
    });

    transfer();

    const updatedSender = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.user.id);

    res.json({
      message: `₹${amount.toLocaleString('en-IN')} sent to ${recipient.first_name} ${recipient.last_name}!`,
      recipient: {
        name: `${recipient.first_name} ${recipient.last_name}`,
        upi_id: recipient.upi_id,
      },
      new_balance: updatedSender.balance,
      reference_id: referenceId,
    });
  } catch (err) {
    console.error('Send money error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

router.get('/transactions', (req, res) => {
  try {
    const { type, limit = 50, offset = 0 } = req.query;
    const db = getDb();

    let query = `
      SELECT t.*, 
        u1.first_name AS sender_first, u1.last_name AS sender_last, u1.upi_id AS sender_upi,
        u2.first_name AS receiver_first, u2.last_name AS receiver_last, u2.upi_id AS receiver_upi
      FROM transactions t
      LEFT JOIN users u1 ON t.sender_id = u1.id
      LEFT JOIN users u2 ON t.receiver_id = u2.id
      WHERE (t.sender_id = ? OR t.receiver_id = ?)
    `;

    const params = [req.user.id, req.user.id];

    if (type) {
      if (type === 'added') {
        query += " AND t.type = 'added'";
      } else if (type === 'sent') {
        query += " AND t.type = 'sent' AND t.sender_id = ?";
        params.push(req.user.id);
      } else if (type === 'received') {
        query += " AND t.type = 'sent' AND t.receiver_id = ?";
        params.push(req.user.id);
      }
    }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const transactions = db.prepare(query).all(...params);

    const formatted = transactions.map((t) => {
      let relativeType = t.type;
      if (t.type === 'sent') {
        if (t.sender_id === req.user.id) {
          relativeType = 'sent';
        } else if (t.receiver_id === req.user.id) {
          relativeType = 'received';
        }
      }

      const defaultNote = relativeType === 'sent'
        ? `Sent to ${t.receiver_first} ${t.receiver_last}`
        : relativeType === 'received'
        ? `Received from ${t.sender_first} ${t.sender_last}`
        : 'Added money to wallet';

      return {
        id: t.id,
        type: relativeType,
        amount: t.amount,
        method: t.method,
        note: t.note || defaultNote,
        status: t.status,
        reference_id: t.reference_id,
        created_at: t.created_at,
        counterparty: relativeType === 'sent'
          ? { name: `${t.receiver_first} ${t.receiver_last}`, upi_id: t.receiver_upi }
          : relativeType === 'received'
          ? { name: `${t.sender_first} ${t.sender_last}`, upi_id: t.sender_upi }
          : null,
      };
    });

    res.json({ transactions: formatted });
  } catch (err) {
    console.error('Transactions error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/payment-methods', (req, res) => {
  try {
    const db = getDb();
    const methods = db.prepare('SELECT * FROM payment_methods WHERE user_id = ? ORDER BY is_default DESC').all(req.user.id);
    res.json({ payment_methods: methods });
  } catch (err) {
    console.error('Payment methods error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/payment-methods', (req, res) => {
  try {
    const { type, provider, account_holder, last_four } = req.body;

    if (!type || !provider || !account_holder || !last_four) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (!['bank', 'credit_card', 'debit_card'].includes(type)) {
      return res.status(400).json({ error: 'Invalid payment method type.' });
    }

    const db = getDb();
    const result = db.prepare(
      'INSERT INTO payment_methods (user_id, type, provider, account_holder, last_four, is_default) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, type, provider, account_holder, last_four, 0);

    res.status(201).json({
      message: 'Payment method added successfully!',
      payment_method: { id: result.lastInsertRowid, type, provider, account_holder, last_four },
    });
  } catch (err) {
    console.error('Add payment method error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.delete('/payment-methods/:id', (req, res) => {
  try {
    const db = getDb();
    const result = db.prepare('DELETE FROM payment_methods WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Payment method not found.' });
    }
    res.json({ message: 'Payment method removed.' });
  } catch (err) {
    console.error('Delete payment method error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/search-users', (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ users: [] });
    }

    const db = getDb();
    const users = db.prepare(
      "SELECT id, first_name, last_name, upi_id FROM users WHERE (upi_id LIKE ? OR first_name LIKE ? OR last_name LIKE ?) AND id != ? LIMIT 10"
    ).all(`%${q}%`, `%${q}%`, `%${q}%`, req.user.id);

    res.json({ users });
  } catch (err) {
    console.error('Search users error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
