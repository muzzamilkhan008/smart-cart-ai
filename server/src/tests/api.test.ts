import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import { db } from '../database/db';
import { seedDatabase } from '../database/seed';

describe('SmartCart AI API Integration Tests', () => {
  beforeAll(() => {
    seedDatabase();
  });

  it('GET /api/health returns status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('SmartCart AI API');
  });

  it('GET /api/products returns products list with pagination', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeGreaterThan(0);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /api/categories returns categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(8);
  });

  it('POST /api/auth/login authenticates user and returns token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'user@smartcart.com',
      password: 'user123'
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('user@smartcart.com');
  });

  it('POST /api/recommendations analyzes NLP query and returns products', async () => {
    const res = await request(app).post('/api/recommendations').send({
      query: 'I need gaming accessories under Rs. 10,000'
    });
    expect(res.status).toBe(200);
    expect(res.body.explanation).toBeDefined();
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  it('POST /api/recommendations handles budget laptop query', async () => {
    const res = await request(app).post('/api/recommendations').send({
      query: 'I need a laptop for programming under Rs. 150,000'
    });
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  it('POST /api/auth/register registers fresh user, rejects duplicate, and allows login', async () => {
    const freshEmail = `test_user_${Date.now()}@example.com`;

    // 1. Register fresh user
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Fresh Customer',
      email: freshEmail,
      password: 'password123',
      phone: '+91 9999999999'
    });
    expect(regRes.status).toBe(201);
    expect(regRes.body.token).toBeDefined();
    expect(regRes.body.user.email).toBe(freshEmail);
    const token = regRes.body.token;

    // 2. Duplicate registration attempt must fail with 400
    const dupRes = await request(app).post('/api/auth/register').send({
      name: 'Fresh Customer',
      email: freshEmail,
      password: 'password123'
    });
    expect(dupRes.status).toBe(400);
    expect(dupRes.body.error).toMatch(/already exists/i);

    // 3. Login with fresh user credentials
    const loginRes = await request(app).post('/api/auth/login').send({
      email: freshEmail,
      password: 'password123'
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();

    // 4. Fetch profile with token
    const profileRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.user.email).toBe(freshEmail);

    // 5. Add product to cart with fresh user
    const addCartRes = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: 2, quantity: 1 });
    expect(addCartRes.status).toBe(200);

    // 6. Get cart
    const getCartRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);
    expect(getCartRes.status).toBe(200);
    expect(getCartRes.body.items.length).toBe(1);

    // 7. Place order with fresh user
    const placeOrderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        shippingAddress: {
          full_name: 'Fresh Customer',
          phone: '+91 9999999999',
          street: '456 Innovation Way',
          city: 'Mumbai',
          state: 'Maharashtra',
          postal_code: '400001',
          country: 'India'
        },
        paymentMethod: 'COD'
      });
    expect(placeOrderRes.status).toBe(201);
    expect(placeOrderRes.body.order).toBeDefined();
  });

  it('End-to-End: login, add product to cart, place order, and verify in order history', async () => {
    // 1. Login
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'user@smartcart.com',
      password: 'user123'
    });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;

    // 2. Add product 1 to cart
    const addCartRes = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: 1, quantity: 1 });
    expect(addCartRes.status).toBe(200);

    // 3. Get cart and check non-zero total
    const getCartRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);
    expect(getCartRes.status).toBe(200);
    expect(getCartRes.body.items.length).toBeGreaterThan(0);
    expect(getCartRes.body.summary.total).toBeGreaterThan(0);

    // 4. Place Order
    const placeOrderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        shippingAddress: {
          full_name: 'Test Customer',
          phone: '+91 9876543210',
          street: '123 Test Street',
          city: 'Bengaluru',
          state: 'Karnataka',
          postal_code: '560001',
          country: 'India'
        },
        paymentMethod: 'COD'
      });

    expect(placeOrderRes.status).toBe(201);
    expect(placeOrderRes.body.order).toBeDefined();
    expect(placeOrderRes.body.order.id).toBeDefined();
    expect(placeOrderRes.body.order.total_amount).toBeGreaterThan(0);

    // 5. Verify Order in Order History
    const getOrdersRes = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);
    expect(getOrdersRes.status).toBe(200);
    expect(Array.isArray(getOrdersRes.body)).toBe(true);
    expect(getOrdersRes.body.length).toBeGreaterThan(0);
  });
});
