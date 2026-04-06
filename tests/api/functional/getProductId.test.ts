import { getRequest } from '../../helpers/request';

// Define Product interface for type safety
interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating?: {
        rate: number;
        count: number;
    };
}

describe('Get Product by ID', () => {

    // Variable to store a randomly selected product
    let randomProduct: Product;

    beforeAll(async () => {
        // Fetch all products
        const allProducts = await getRequest('/products') as Product[];
        expect(allProducts.length).toBeGreaterThan(0);

        // Select a random product
        const randomIndex = Math.floor(Math.random() * allProducts.length);
        randomProduct = allProducts[randomIndex];

        console.log(`Randomly selected product: ${JSON.stringify(randomProduct)}`);
    });

    it('should return the correct product by ID', async () => {
        // Get the product ID
        const productId = randomProduct.id;

        // Fetch the product by ID
        const product = await getRequest(`/products/${productId}`) as Product;

        console.log(`Product retrieved by ID: ${JSON.stringify(product)}`);

        // Validate that all fields match
        expect(product.id).toEqual(randomProduct.id);
        expect(product.title).toEqual(randomProduct.title);
        expect(product.price).toEqual(randomProduct.price);
        expect(product.description).toEqual(randomProduct.description);
        expect(product.category).toEqual(randomProduct.category);
        expect(product.image).toEqual(randomProduct.image);
    });
});