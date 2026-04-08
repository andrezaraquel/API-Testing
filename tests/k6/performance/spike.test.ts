import http, { RefinedResponse, ResponseType } from 'k6/http';
import { check, sleep } from 'k6';
import { Options } from 'k6/options';

// Spike test: validates system behavior under a sudden and extreme traffic surge
// The goal is NOT to check speed — it is to confirm the API stays alive and does not crash
export const options: Options = {
    stages: [
        { duration: '10s', target: 10 }, // baseline: establish normal load before the spike
        { duration: '1m', target: 10 }, // sustained baseline: confirm system is stable at low load
        { duration: '10s', target: 400 }, // SPIKE: jump to 40x normal load in 10 seconds
        { duration: '3m', target: 400 }, // peak: hold the spike to measure how long the system survives
        { duration: '10s', target: 10 }, // recovery start: drop back to normal load
        { duration: '2m', target: 10 }, // recovery hold: verify the system stabilizes after the spike
        { duration: '10s', target: 0 }, // ramp-down: gracefully bring all virtual users to zero
    ],
    thresholds: {
        // Thresholds are intentionally lenient — spike tests prioritize availability over speed
        http_req_duration: ['p(99)<5000'], // 99% of requests must complete within 5 seconds
        http_req_failed: ['rate<0.1'],   // up to 10% failure rate is acceptable under extreme load
    },
};

// Default function executed repeatedly by each virtual user throughout the test
export default function (): void {

    // Fetch the posts list — used as a representative endpoint to stress the API
    const res: RefinedResponse<ResponseType> = http.get(
        'https://jsonplaceholder.typicode.com/posts'
    );

    // The checks focus on availability, not performance
    // A slow response is acceptable — a 503 (service unavailable) or 5xx means the system collapsed
    check(res, {
        'API did not return 503 (service unavailable)': (r) => r.status !== 503,
        'API responded without server error (status < 500)': (r) => r.status < 500,
    });

    // Fixed 1 second pause between requests — keeps the load predictable during the spike
    sleep(1);
}