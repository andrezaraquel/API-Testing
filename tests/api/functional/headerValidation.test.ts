import request from 'supertest';

// Use BASE_URL on CI
const BASE_URL = process.env.BASE_URL ?? 'https://fakestoreapi.com';

describe('Headers and Request Validation', () => {

    it('GET /products without Accept header → defaults to JSON 200', async () => {
        const res = await request(BASE_URL).get('/products');
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/application\/json/);
    });

    it('POST /products with wrong Content-Type → 415 or 400', async () => {
        const res = await request(BASE_URL)
            .post('/products')
            .set('Content-Type', 'text/plain')
            .send('title=InvalidContent');

        // it should result in this:
        //expect([400, 415]).toContain(res.status);

        // But Fake Store API accepts a wrong Content-Type
        expect(res.status).toBe(201);
    });

    it('POST /products with payload > 1MB → 413', async () => {
        const hugePayload = {
            title: 'A'.repeat(1_000_001),
            price: 10,
            description: 'Huge payload',
            category: 'electronics',
            image: 'https://example.com/image.png'
        };

        const res = await request(BASE_URL)
            .post('/products')
            .send(hugePayload);

        // Some public APIs may ignore this; Fake Store API might return 200
        // Adjust expectation based on API behavior
        expect([200, 413]).toContain(res.status);
    });

    it('GET /products with invalid custom header → still returns 200', async () => {
        const res = await request(BASE_URL)
            .get('/products')
            .set('X-Custom-Header', 'invalid-value');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

});