import { Verifier } from '@pact-foundation/pact';
import path from 'path';
import http from 'http';
import express from 'express';
import axios from 'axios';

// Use BASE_URL on CI
const FAKE_STORE_URL = process.env.BASE_URL ?? 'https://fakestoreapi.com';

const app = express();
app.use(express.json());

app.get('/products', async (req, res) => {
    const { data } = await axios.get(`${FAKE_STORE_URL}/products`);
    res.json(data);
});

app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    const { data, status } = await axios.get(`${FAKE_STORE_URL}/products/${id}`)
        .catch((err) => err.response);

    if (status === 404 || !data) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    res.json(data);
});

describe('Provider: api-produtos honra os contratos', () => {
    let server: http.Server;
    let port: number;

    beforeAll((done) => {
        server = app.listen(0, () => {
            port = (server.address() as any).port;
            done();
        });
    });

    afterAll(() => new Promise((resolve) => server.close(resolve)));

    it('verifica todos os contratos', async () => {
        await new Verifier({
            provider: 'api-produtos',
            providerBaseUrl: `http://localhost:${port}`,
            pactUrls: [
                path.resolve(__dirname, '../../pacts/frontend-react-api-produtos.json')
            ],
            providerVersion: '1.0.0',
            stateHandlers: {
                'existem produtos cadastrados': async () => {
                    // fakestoreapi sempre retorna produtos — nenhuma preparação necessária
                },
                'produto com id 1 existe': async () => {
                    // id 1 sempre existe na fakestoreapi — nenhuma preparação necessária
                },
                'produto com id 999 não existe': async () => {
                    // id 999 não existe na fakestoreapi — a API retorna 404 naturalmente
                }
            },
            publishVerificationResult: false
        }).verifyProvider();
    });

});