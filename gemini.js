import http from 'k6/http';
import { check, sleep } from 'k6';

 
export const options = {
  vus: 10,           // 10 Virtual Users 
  duration: '30s',   // Test 30 second  
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% requests 500ms (0.5s)  
  },
};

export default function () {
  //  
  const response = http.get('https://test-api.k6.io/public/crocodiles/');

  //  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'transaction time OK': (r) => r.timings.duration < 500,
  });

  // 4.  
  sleep(1);
}