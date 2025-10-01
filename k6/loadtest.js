import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '1m', target: 50 },   // ramp-up to 50 VUs
        { duration: '2m', target: 500 },  // stay at 200 VUs
        { duration: '1m', target: 0 },    // ramp-down
    ],
};

const BASE = __ENV.TARGET || 'http://localhost:3000';

export default function () {
    // 1️⃣ Read request
    const res = http.get(`${BASE}/`);
    check(res, {
        'GET / status 200': (r) => r.status === 200
    });

    // 2️⃣ Write request
    const payload = JSON.stringify({ content: "test" });
    const params = { headers: { "Content-Type": "application/json" } };
    const writeRes = http.post(`${BASE}/write`, payload, params);
    check(writeRes, {
        'POST /write status 200': (r) => r.status === 200
    });

    // 3️⃣ Wait 1 second between iterations
    sleep(1);
}
