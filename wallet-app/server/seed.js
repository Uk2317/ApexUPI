const bcrypt = require('bcryptjs');
const { initDb, getDb } = require('./config/db');

async function seed() {
  const db = initDb();

  db.pragma('foreign_keys = OFF');
  db.exec('DELETE FROM transactions; DELETE FROM payment_methods; DELETE FROM users;');

  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users', 'payment_methods', 'transactions');");
  db.pragma('foreign_keys = ON');

  const salt = await bcrypt.genSalt(10);

  const users = [
    { email: 'arjun@example.com', password: await bcrypt.hash('pass123', salt), first_name: 'Arjun', last_name: 'Mehta', phone: '+91 98765 43210', upi_id: 'arjunmehta@upi' },
    { email: 'priya@example.com', password: await bcrypt.hash('pass123', salt), first_name: 'Priya', last_name: 'Patel', phone: '+91 87654 32109', upi_id: 'priyapatel@upi' },
    { email: 'rahul@example.com', password: await bcrypt.hash('pass123', salt), first_name: 'Rahul', last_name: 'Sharma', phone: '+91 76543 21098', upi_id: 'rahulsharma@upi' },
    { email: 'sneha@example.com', password: await bcrypt.hash('pass123', salt), first_name: 'Sneha', last_name: 'Reddy', phone: '+91 65432 10987', upi_id: 'snehareddy@upi' },
    { email: 'amit@example.com', password: await bcrypt.hash('pass123', salt), first_name: 'Amit', last_name: 'Kumar', phone: '+91 54321 09876', upi_id: 'amitkumar@upi' },
    { email: 'meera@example.com', password: await bcrypt.hash('pass123', salt), first_name: 'Meera', last_name: 'Singh', phone: '+91 43210 98765', upi_id: 'meerasingh@upi' },
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

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('Test accounts (password: pass123):');
  console.log('  arjun@example.com  - Arjun Mehta (arjunmehta@upi)');
  console.log('  priya@example.com  - Priya Patel (priyapatel@upi)');
  console.log('  rahul@example.com  - Rahul Sharma (rahulsharma@upi)');
  console.log('  sneha@example.com  - Sneha Reddy (snehareddy@upi)');
  console.log('  amit@example.com   - Amit Kumar (amitkumar@upi)');
  console.log('  meera@example.com  - Meera Singh (meerasingh@upi)');
}

seed().catch(console.error);
