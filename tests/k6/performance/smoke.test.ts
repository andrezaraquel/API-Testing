import http, { RefinedResponse, ResponseType } from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { Options } from 'k6/options';

// Custom metrics to track error rate and response time beyond k6 defaults
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time_custom');

// Test configuration: 3 virtual users running for 1 minute
// Thresholds define pass/fail criteria — if any fails, k6 exits with code 1 (breaks CI)
export const options: Options = {
    vus: 3,           // 3 simultaneous virtual users
    duration: '1m',   // test runs for 1 minute
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must complete under 500ms
        http_req_failed: ['rate<0.01'],   // less than 1% of requests can fail
        error_rate: ['rate<0.01'],        // custom error rate must also stay below 1%
    },
};

// Base URL comes from environment variable — falls back to JSONPlaceholder for local runs
const BASE_URL: string = __ENV.BASE_URL || 'https://jsonplaceholder.typicode.com';

// TypeScript interface representing the shape of a post returned by the API
interface Post {
    id: number;
    title: string;
    body: string;
    userId: number;
}

// Default function is the test scenario — k6 runs this repeatedly for each virtual user
export default function (): void {

    // Scenario 1: list all posts
    const listRes: RefinedResponse<ResponseType> = http.get(`${BASE_URL}/posts`);

    // Validate the response against expected conditions
    check(listRes, {
        'GET /posts: status is 200': (r) => r.status === 200,
        'GET /posts: body is not empty': (r) => (r.body as string).length > 0,
        'GET /posts: response time under 500ms': (r) => r.timings.duration < 500,
    });

    // Feed custom metrics with data from this request
    errorRate.add(listRes.status !== 200);       // true = error occurred
    responseTime.add(listRes.timings.duration);  // records duration in ms

    sleep(1); // wait 1 second before next request — simulates real user think time

    // Scenario 2: fetch a single post by id
    const postRes: RefinedResponse<ResponseType> = http.get(`${BASE_URL}/posts/1`);

    // Cast to unknown first because k6 JSONValue type does not overlap with Post directly
    const post = postRes.json() as unknown as Post;

    check(postRes, {
        'GET /posts/1: status is 200': (r) => r.status === 200,
        'GET /posts/1: response contains id field': () => post.id === 1,
    });

    sleep(1); // wait 1 second before the next iteration
}