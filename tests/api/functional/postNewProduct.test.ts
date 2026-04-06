import { postRequest } from '../../helpers/request';
import newProduct from '../../data/product.faker';

describe('Create Product using Faker', () => {
    it('should create a product successfully', async () => {
        const createdProduct = await postRequest('/products', newProduct);

        console.log(`Product created: ${JSON.stringify(createdProduct)}`);

        // Basic validations
        expect(createdProduct.title).toEqual(newProduct.title);
        expect(createdProduct.price).toEqual(newProduct.price);
        expect(createdProduct.description).toEqual(newProduct.description);
        expect(createdProduct.category).toEqual(newProduct.category);
        expect(createdProduct.image).toEqual(newProduct.image);
    });
});