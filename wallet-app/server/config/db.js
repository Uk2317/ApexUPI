const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const isVercel = process.env.VERCEL === '1';
const DB_PATH = isVercel 
  ? '/tmp/wallet.db' 
  : path.join(__dirname, '..', 'wallet.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      upi_id TEXT UNIQUE NOT NULL,
      balance REAL DEFAULT 0.0,
      is_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payment_methods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('bank', 'credit_card', 'debit_card')),
      provider TEXT NOT NULL,
      account_holder TEXT NOT NULL,
      last_four TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER,
      amount REAL NOT NULL CHECK(amount > 0),
      type TEXT NOT NULL CHECK(type IN ('sent', 'received', 'added', 'withdrawn')),
      method TEXT CHECK(method IN ('upi', 'bank', 'credit_card', 'debit_card')),
      note TEXT DEFAULT '',
      status TEXT DEFAULT 'completed' CHECK(status IN ('completed', 'pending', 'failed')),
      reference_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_sender ON transactions(sender_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_receiver ON transactions(receiver_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
  `);

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('pass123', salt);

    const users = [
      { email: 'arjun@example.com', password: hash, first_name: 'Arjun', last_name: 'Mehta', phone: '+91 98765 43210', upi_id: 'arjunmehta@upi' },
      { email: 'priya@example.com', password: hash, first_name: 'Priya', last_name: 'Patel', phone: '+91 87654 32109', upi_id: 'priyapatel@upi' },
      { email: 'rahul@example.com', password: hash, first_name: 'Rahul', last_name: 'Sharma', phone: '+91 76543 21098', upi_id: 'rahulsharma@upi' },
      { email: 'sneha@example.com', password: hash, first_name: 'Sneha', last_name: 'Reddy', phone: '+91 65432 10987', upi_id: 'snehareddy@upi' },
      { email: 'amit@example.com', password: hash, first_name: 'Amit', last_name: 'Kumar', phone: '+91 54321 09876', upi_id: 'amitkumar@upi' },
      { email: 'meera@example.com', password: hash, first_name: 'Meera', last_name: 'Singh', phone: '+91 43210 98765', upi_id: 'meerasingh@upi' },
    ];

    const insertUser = db.prepare(
      'INSERT INTO users (email, password, first_name, last_name, phone, upi_id, balance) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    const userIds = [];
    for (const u of users) {
      const result = insertUser.run(u.email, u.password, u.first_name, u.last_name, u.phone, u.upi_id, 5000.0);
      userIds.push(result.lastInsertRowid);
    }

    const arjunId = userIds[0];
    const priyaId = userIds[1];
    const rahulId = userIds[2];
    const snehaId = userIds[3];
    const amitId = userIds[4];
    const meeraId = userIds[5];

    const insertPM = db.prepare(
      'INSERT INTO payment_methods (user_id, type, provider, account_holder, last_four, is_default) VALUES (?, ?, ?, ?, ?, ?)'
    );
    insertPM.run(arjunId, 'bank', 'SBI', 'Arjun Mehta', '4521', 1);
    insertPM.run(arjunId, 'credit_card', 'HDFC Bank', 'Arjun Mehta', '8834', 0);
    insertPM.run(arjunId, 'debit_card', 'ICICI Bank', 'Arjun Mehta', '6677', 0);

    const insertTxn = db.prepare(
      'INSERT INTO transactions (sender_id, receiver_id, amount, type, method, note, status, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    const txns = [
      { sender: rahulId, receiver: arjunId, amount: 5000, method: 'upi', note: 'Dinner split', ref: 'TXN001', date: '2026-07-30T10:30:00' },
      { sender: arjunId, receiver: priyaId, amount: 1200, method: 'upi', note: 'Movie tickets', ref: 'TXN002', date: '2026-07-29T14:15:00' },
      { sender: amitId, receiver: arjunId, amount: 25000, method: 'upi', note: 'Freelance payment', ref: 'TXN003', date: '2026-07-28T09:00:00' },
      { sender: arjunId, receiver: priyaId, amount: 850, method: 'upi', note: 'Food order', ref: 'TXN004', date: '2026-07-27T20:45:00' },
      { sender: arjunId, receiver: rahulId, amount: 3500, method: 'bank', note: 'Electricity bill', ref: 'TXN005', date: '2026-07-26T11:00:00' },
      { sender: snehaId, receiver: arjunId, amount: 750, method: 'upi', note: 'Cab share', ref: 'TXN006', date: '2026-07-25T16:30:00' },
      { sender: arjunId, receiver: amitId, amount: 15000, method: 'upi', note: 'Rent payment', ref: 'TXN007', date: '2026-07-24T13:20:00' },
      { sender: meeraId, receiver: arjunId, amount: 2000, method: 'upi', note: 'Birthday gift', ref: 'TXN008', date: '2026-07-23T08:15:00' },
    ];

    for (const t of txns) {
      insertTxn.run(t.sender, t.receiver, t.amount, 'sent', t.method, t.note, 'completed', t.ref, t.date);
    }

    insertTxn.run(arjunId, null, 10000, 'added', 'bank', 'Added via SBI', 'completed', 'ADD001', '2026-07-22T10:00:00');
    insertTxn.run(arjunId, null, 5000, 'added', 'credit_card', 'Added via HDFC', 'completed', 'ADD002', '2026-07-20T15:00:00');
  }

  return db;
}

module.exports = { getDb, initDb };
