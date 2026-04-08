// k6 does not supports @faker-js/faker — data generated with Math.random()

export interface ProductPayload {
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
}

const titles = [
    'Fjallraven Backpack',
    'Mens Casual T-Shirt',
    'Mens Cotton Jacket',
    'Womens Dress',
    'Wireless Headphones',
];

const categories = [
    "men's clothing",
    "women's clothing",
    'electronics',
    'jewelery',
];

function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice(): number {
    return parseFloat((Math.random() * 499 + 1).toFixed(2));
}

export function generateProduct(): ProductPayload {
    return {
        title: randomItem(titles),
        price: randomPrice(),
        description: 'Product description for performance test',
        category: randomItem(categories),
        image: 'https://fakestoreapi.com/img/81fAn.jpg',
    };
}