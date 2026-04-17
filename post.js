 import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Load Test ki settings (Options Add Kar di hain)
export const options = {
  vus: 10,           // 10 users  
  duration: '20s',    // Test 20 second  
  thresholds: {
    http_req_duration: ['p(95)<1000'],  
  },
};

export default function () {
  const url = 'https://httpbin.org/post'; 

   
  const payload = JSON.stringify({
    name: 'Golu Crocodile',
    job: 'Tester',
  });

   
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

   
  const response = http.post(url, payload, params);

   
  check(response, {
    'is status 200': (r) => r.status === 200,
    'data match': (r) => r.json().json.name === 'Golu Crocodile',
  });

  
  sleep(1);
}