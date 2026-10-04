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
