const { faker } = require('@faker-js/faker'); // CommonJS require works with Jest + TS

// Define Product interface
interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
}

// Create a Faker product
const newProduct: Product = {
    id: faker.datatype.number({ min: 1, max: 10000 }),
    title: faker.commerce.productName(),
    price: parseFloat(faker.commerce.price()),
    description: faker.commerce.productDescription(),
    category: faker.commerce.department(),
    image: faker.image.imageUrl(),
};

export default newProduct;