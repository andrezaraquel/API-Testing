import { getRequest } from '../../helpers/request';

describe('Get All Products', () => {

    it('should return an array of products', async () => {
        const products = await getRequest('/products');
        expect(Array.isArray(products)).toBe(true);
    });

});