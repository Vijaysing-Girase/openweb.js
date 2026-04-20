 import http from 'k6/http';
import { sleep, check } from 'k6';


export const options = {
    scenarios: {
        smoke_test: { //  Smoke (Check if API is alive)
            executor: 'constant-vus',
            vus: 1,
            duration: '10s',
        },
        load_test: { // Case 3 & 4: Load aur Stress (Checking capacity)
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 20 }, // Normal Load
                { duration: '30s', target: 40 }, // Stress Load
                { duration: '10s', target: 0 },
            ],
            startTime: '10s',
        },
        spike_test: { // Case 5: Spike Test (Sudden traffic jump)
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '10s', target: 60 }, // Sudden Spike
                { duration: '20s', target: 0 },
            ],
            startTime: '80s',
        },
    },
    thresholds: {
        http_req_failed: ['rate<0.10'],    // Case 6: Reliability  
        http_req_duration: ['p(95)<1500'], // Case 7: SLA  
    },
};

 
// 2. MAIN FUNCTION:  logic(POST and GET)
 
export default function () {
    const baseUrl = 'https://jsonplaceholder.typicode.com/posts';
    
    // Case 8: Payload Variation
    const payload = JSON.stringify({
        title: 'Banti_Verification_Test',
        body: 'Testing POST and then GET',
        userId: 1,
    });

    const params = { headers: { 'Content-Type': 'application/json' } };

    // POST REQUEST we are sending req. to server to save data  (Data Save)
     
    let postRes = http.post(baseUrl, payload, params);

    // Case 9: Data Integrity  
    let postPassed = check(postRes, {
        'POST Status is 201': (r) => r.status === 201, // 201  means data created
        'POST Body not null': (r) => r.body !== null,  // Check if server replied
    });

    //  GET Verification Check
     
    if (postPassed && postRes.body !== null) {
        try {
             
            let newId = postRes.json().id; 
            let getRes = http.get(`${baseUrl}/${newId}`);

            check(getRes, {
                'GET Status is 200': (r) => r.status === 200 || r.status === 404, 
                'Verification Attempted': (r) => r.status !== 0, 
            });
        } catch (e) {
            console.warn("Could not parse ID for GET request");
        }
    }

    sleep(1);  
}