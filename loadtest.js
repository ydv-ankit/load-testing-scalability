// read heavy
import http from 'k6/http';
import { check, sleep } from 'k6';


export let options = {
stages: [
{ duration: '30s', target: 20 },
{ duration: '2m', target: 200 },
{ duration: '30s', target: 0 }
],
thresholds: {
http_req_duration: ['p(95)<500']
}
};


const BASE = __ENV.TARGET || 'http://localhost:3000';


export default function () {
const res = http.get(`${BASE}/`);
check(res, { 'status 200': (r) => r.status === 200 });
sleep(1);
}