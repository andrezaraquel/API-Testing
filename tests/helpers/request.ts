import request from 'supertest';

// Use BASE_URL on CI
const baseURL = process.env.BASE_URL ?? 'https://fakestoreapi.com';

export async function getRequest(path: string): Promise<any> {
    try {
        const response = await request(baseURL)
            .get(path)
            .set('Accept', 'application/json')
            .expect(200);
        return response.body;
    } catch (error) {
        console.error(`Error making GET request: ${path}`, error);
        throw error;
    }
}

export async function postRequest(path: string, body: object): Promise<any> {
    try {
        const response = await request(baseURL)
            .post(path)
            .send(body)
            .set('Accept', 'application/json')
            .expect(201);
        return response.body;
    } catch (error) {
        console.error(`Error making POST request: ${path}`, error);
        throw error;
    }
}