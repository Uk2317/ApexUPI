const request = require('supertest');
const app = require('../app');
const { getDb } = require('../config/db');

describe('ApexUPI API Integration Tests', () => {
  let token;
  let userId;
  let testPaymentMethodId;
  let receiverToken;
  let receiverId;

  beforeAll(async () => {

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'arjun@example.com',
        password: 'pass123'
      });
    
    expect(res.statusCode).toBe(200);
    token = res.body.token;
    userId = res.body.user.id;

    const receiverRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'priya@example.com',
        password: 'pass123'
      });
    expect(receiverRes.statusCode).toBe(200);
    receiverToken = receiverRes.body.token;
    receiverId = receiverRes.body.user.id;

    const db = getDb();
    const pm = db.prepare('SELECT id FROM payment_methods WHERE user_id = ? LIMIT 1').get(userId);
    testPaymentMethodId = pm ? pm.id : null;
  });

  describe('GET /api/health', () => {
    it('should return 200 OK and health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });

  describe('Auth Routes', () => {
    it('should fail login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'arjun@example.com',
          password: 'wrongpassword'
        });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should retrieve current user details with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.user).toHaveProperty('email', 'arjun@example.com');
    });
  });

  describe('Wallet Routes & Payment Methods', () => {
    it('should get user balance', async () => {
      const res = await request(app)
        .get('/api/wallet/balance')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('balance');
    });

    it('should get payment methods for the authenticated user', async () => {
      const res = await request(app)
        .get('/api/wallet/payment-methods')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.payment_methods)).toBe(true);
      expect(res.body.payment_methods.length).toBeGreaterThan(0);
    });

    it('should fail to add money without payment_method_id (New Strict Rule)', async () => {
      const res = await request(app)
        .post('/api/wallet/add-money')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 1000,
          method: 'bank'

        });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Payment method is required.');
    });

    it('should fail to add money with invalid payment_method_id', async () => {
      const res = await request(app)
        .post('/api/wallet/add-money')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 1000,
          method: 'bank',
          payment_method_id: 999999
        });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid payment method.');
    });

    it('should successfully add money when correct payment method details are provided', async () => {
      expect(testPaymentMethodId).not.toBeNull();

      const res = await request(app)
        .post('/api/wallet/add-money')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 1000,
          method: 'bank',
          payment_method_id: testPaymentMethodId,
          note: 'Test Deposit'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('new_balance');
      expect(res.body).toHaveProperty('reference_id');
    });
  });

  describe('Peer to Peer Send & Relative Transaction Formatting', () => {
    it('should successfully transfer money from Arjun to Priya', async () => {

      const sendRes = await request(app)
        .post('/api/wallet/send')
        .set('Authorization', `Bearer ${token}`)
        .send({
          recipient_upi_id: 'priyapatel@upi',
          amount: 500,
          note: 'Split bill'
        });
      
      expect(sendRes.statusCode).toBe(200);
      const referenceId = sendRes.body.reference_id;
      expect(referenceId).toBeDefined();

      const senderTxnRes = await request(app)
        .get('/api/wallet/transactions')
        .set('Authorization', `Bearer ${token}`);
      
      expect(senderTxnRes.statusCode).toBe(200);
      const senderTxn = senderTxnRes.body.transactions.find(t => t.reference_id === referenceId);
      expect(senderTxn).toBeDefined();
      expect(senderTxn.type).toBe('sent');
      expect(senderTxn.amount).toBe(500);
      expect(senderTxn.counterparty).toHaveProperty('name', 'Priya Patel');

      const receiverTxnRes = await request(app)
        .get('/api/wallet/transactions')
        .set('Authorization', `Bearer ${receiverToken}`);
      
      expect(receiverTxnRes.statusCode).toBe(200);
      const receiverTxn = receiverTxnRes.body.transactions.find(t => t.reference_id === referenceId);
      expect(receiverTxn).toBeDefined();
      expect(receiverTxn.type).toBe('received');
      expect(receiverTxn.amount).toBe(500);
      expect(receiverTxn.counterparty).toHaveProperty('name', 'Arjun Mehta');
    });
  });
});
