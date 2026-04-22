import http from 'k6/http';
import { sleep, check } from 'k6';

 
let smokeFailed = false;

export const options = {
    scenarios: {
        smoke_test: { 
            executor: 'constant-vus',
            vus: 1,
            duration: '10s',
            tags: { type: 'smoke' },
        },
        load_test: { 
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '20s', target: 5 },
                { duration: '10s', target: 0 },
            ],
            startTime: '12s',  
            tags: { type: 'load' },
        },
        spike_test: { 
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '10s', target: 10 },
                { duration: '10s', target: 0 },
            ],
            startTime: '45s', 
            tags: { type: 'spike' },
        },
    },
    thresholds: {
         
        'http_req_failed': ['rate < 0.01'],  
    },
};

export default function () {
    const type = __ENV.type || 'unknown'; // Scenario ka tag access karne ke liye
    
     
    if (Math.random() < 1) {  
         
        let res = http.get('https://jsonplaceholder.typicode.com/invalid-endpoint-for-fail');
        
        let checkSmoke = check(res, {
            'Smoke: API is Alive': (r) => r.status === 200, 
        });

        if (!checkSmoke) {
            smokeFailed = true; 
        }
    }

     
    let targetUrl = smokeFailed 
        ? 'https://this-url-does-not-exist-fail.com' 
        : 'https://jsonplaceholder.typicode.com/posts';

    let res = http.get(targetUrl);

    check(res, {
        'Dependent Test Status 200': (r) => r.status === 200,
    });

    sleep(1);
}