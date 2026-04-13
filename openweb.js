 import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 5,         // 5 Users
  duration: '30s', // 30 Sec test
};

export default function () {
  //open the Website
  let res = http.get('https://test.k6.io');

  // Result check
  check(res, {
    'OK': (r) => r.status === 200,      // Status check
    'Fast': (r) => r.timings.duration < 200, // Speed check
  });

  // 1 sec gap
  sleep(1);
}