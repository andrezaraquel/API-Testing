import http, { RefinedResponse, ResponseType } from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { Options } from 'k6/options';

// SharedArray loads data once and shares it across all virtual users (VUs)
// This avoids duplicating the array in memory for each VU — more efficient at high concurrency
const postIds: number[] = new SharedArray('post_ids', function (): number[] {
    return Array.from({ length: 100 }, (_, i): number => i + 1);
});

// Load test configuration using stages to simulate a realistic traffic ramp-up and ramp-down
// Each stage gradually increases or decreases the number of concurrent virtual users
export const options: Options = {
    stages: [
        { duration: '30s', target: 10 }, // ramp-up: gradually reach 10 users over 30 seconds
        { duration: '2m', target: 50 }, // sustained load: hold 50 users for 2 minutes
        { duration: '30s', target: 100 }, // stress ramp-up: increase to 100 users
        { duration: '2m', target: 100 }, // peak load: hold 100 users for 2 minutes
        { duration: '30s', target: 0 }, // ramp-down: gradually bring users back to 0
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000', 'p(99)<2000'], // 95% of requests under 1s, 99% under 2s
        http_req_failed: ['rate<0.02'],                 // less than 2% of requests can fail
    },
};

// TypeScript interface representing the shape of a post returned by the API
interface Post {
    id: number;
    title: string;
    body: string;
    userId: number;
}

// Default function is the test scenario executed repeatedly by each virtual user
export default function (): void {

    // Scenario 1: fetch the full list of posts
    const listRes: RefinedResponse<ResponseType> = http.get(
        'https://jsonplaceholder.typicode.com/posts'
    );

    check(listRes, {
        'GET /posts: status is 200': (r) => r.status === 200,
    });

    // Random pause between 1 and 3 seconds — simulates real user think time between actions
    sleep(Math.random() * 2 + 1);

    // Pick a random post id from the shared array to simulate diverse user behavior
    const id: number = postIds[Math.floor(Math.random() * postIds.length)];

    // Scenario 2: fetch a single post by the randomly selected id
    const postRes: RefinedResponse<ResponseType> = http.get(
        `https://jsonplaceholder.typicode.com/posts/${id}`
    );

    // Cast to unknown first because k6 JSONValue type does not overlap with Post directly
    const post = postRes.json() as unknown as Post;

    check(postRes, {
        'GET /posts/:id: status is 200': (r) => r.status === 200,
        'GET /posts/:id: response contains id field': () => post.id === id,
    });

    // Random pause between 1 and 4 seconds before the next iteration
    sleep(Math.random() * 3 + 1);
}