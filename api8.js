 import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    scenarios: {
        smoke_test: { 
            executor: 'constant-vus', 
            vus: 1, 
            duration: '5s',
            tags: { type: 'smoke' },  
        },
        load_test: { 
            executor: 'constant-vus', 
            vus: 5, 
            duration: '10s', 
            startTime: '10s',  
            tags: { type: 'load' },
        },
        stress_test: { 
            executor: 'constant-vus', 
            vus: 10, 
            duration: '10s', 
            startTime: '25s', 
            tags: { type: 'stress' },
        },
    },
    thresholds: {
         
        'http_req_failed{type:smoke}': [{
            threshold: 'rate < 0.01', 
            abortOnFail: true, 
        }],
        
         
        'http_req_failed{type:load}': [{
            threshold: 'rate < 0.01', 
            abortOnFail: true, 
        }],
    },
};

export default function () {
    // Sahi URL
    http.get('https://jsonplaceholder.typicode.com/posts/1');

    sleep(1);
}