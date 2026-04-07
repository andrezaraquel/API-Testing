import { PactV4, MatchersV3 } from '@pact-foundation/pact';
import request from 'supertest';
import path from 'path';

const { like, eachLike, regex } = MatchersV3;

const provider = new PactV4({
    consumer: 'frontend-react',
    provider: 'api-produtos',
    port: 1235,
    spec: 4,
    dir: path.resolve(__dirname, '../../pacts'),
    logLevel: 'warn'
});

describe('Contrato: frontend-react → api-produtos', () => {

    it('GET /products — retorna lista de produtos → 200', () => {
        return provider
            .addInteraction()
            .given('existem produtos cadastrados')
            .uponReceiving('uma requisição para listar todos os produtos')
            .withRequest('GET', '/products')
            .willRespondWith(200, (builder) => {
                builder
                    .jsonBody(eachLike({
                        title: like('Fjallraven - Foldsack No. 1 Backpack'),
                        price: like(109.95),
                        description: like('Your perfect pack for everyday use'),
                        category: like("men's clothing"),
                        image: regex('https?://.+', 'https://fakestoreapi.com/img/81fAn.jpg'),
                        rating: {
                            rate: like(3.9),
                            count: like(120)
                        }
                    }));
            })
            .executeTest(async (mockServer) => {
                const res = await request(mockServer.url).get('/products');

                expect(res.status).toBe(200);
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                expect(res.body[0].id).toBeDefined();
                expect(res.body[0].title).toBeDefined();
                expect(res.body[0].price).toBeDefined();
            });
    });

    it('GET /products/:id — retorna produto existente → 200', () => {
        return provider
            .addInteraction()
            .given('produto com id 1 existe')
            .uponReceiving('uma requisição para buscar produto por id')
            .withRequest('GET', '/products/1')
            .willRespondWith(200, (builder) => {
                builder
                    .jsonBody({
                        title: like('Fjallraven - Foldsack No. 1 Backpack'),
                        price: like(109.95),
                        description: like('Your perfect pack for everyday use'),
                        category: like("men's clothing"),
                        image: regex('https?://.+', 'https://fakestoreapi.com/img/81fAn.jpg'),
                        rating: {
                            rate: like(3.9),
                            count: like(120)
                        }
                    });
            })
            .executeTest(async (mockServer) => {
                const res = await request(mockServer.url).get('/products/1');

                expect(res.status).toBe(200);
                expect(res.body.id).toBeDefined();
                expect(res.body.title).toBeDefined();
                expect(res.body.price).toBeDefined();
                expect(res.body.description).toBeDefined();
                expect(res.body.category).toBeDefined();
                expect(res.body.image).toBeDefined();
                expect(res.body.rating).toBeDefined();
            });
    });

    it('GET /products/999 — produto inexistente → 404', () => {
        return provider
            .addInteraction()
            .given('produto com id 999 não existe')
            .uponReceiving('uma requisição para produto inexistente')
            .withRequest('GET', '/products/999')
            .willRespondWith(404, (builder) => {
                builder.jsonBody({ erro: like('Produto não encontrado') });
            })
            .executeTest(async (mockServer) => {
                const res = await request(mockServer.url).get('/products/999');

                expect(res.status).toBe(404);
                expect(res.body.erro).toBeDefined();
            });
    });

});