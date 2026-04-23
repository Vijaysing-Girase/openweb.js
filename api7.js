import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
    vus: 1, 
    iterations: 3, 
};

const BASE_URL = 'https://restful-booker.herokuapp.com';
 
const BROWSER_URL = 'https://banti-live-report.free.beeceptor.com'; 

export default function () {
    let headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    let VU_ID = __VU;
    let ITER_ID = __ITER;
 
    function sendToBrowser(step, details) {
        http.post(`${BROWSER_URL}/log`, JSON.stringify({
            step: step,
            user: `User-${VU_ID}`,
            iteration: ITER_ID,
            data: details,
            timestamp: new Date().toLocaleTimeString()
        }));
    }

    // --- 1. POST (CREATE) ---
    let postPayload = {
        firstname: `Banti-${VU_ID}-${ITER_ID}`,
        lastname: "Browser-Test",
        totalprice: 150,
        depositpaid: true,
        bookingdates: { checkin: "2026-05-01", checkout: "2026-05-05" },
        additionalneeds: "Dinner"
    };

    let postRes = http.post(`${BASE_URL}/booking`, JSON.stringify(postPayload), { headers });
    let bId = postRes.status === 200 ? postRes.json().bookingid : null;

    console.log(`🚀 Created ID: ${bId}`);
    sendToBrowser("CREATE_POST", { id: bId, payload: postPayload });
    check(postRes, { 'POST Success': (r) => r.status === 200 });

    if (bId) {
        // --- 2. GET (VERIFY) ---
        let getRes = http.get(`${BASE_URL}/booking/${bId}`, { headers });
        sendToBrowser("VERIFY_GET", { response: getRes.json() });
        check(getRes, { 'GET Verified': (r) => r.status === 200 });

        // --- 3. AUTH & PUT (UPDATE) ---
        let authRes = http.post(`${BASE_URL}/auth`, JSON.stringify({ username: "admin", password: "password123" }), { headers });
        let token = authRes.json().token;

        let putPayload = { ...postPayload, firstname: `Banti-Updated-${ITER_ID}` };
        let putRes = http.put(`${BASE_URL}/booking/${bId}`, JSON.stringify(putPayload), { 
            headers: { ...headers, 'Cookie': `token=${token}` } 
        });
 
        console.log(`🔄 Updated ID: ${bId}`);
        sendToBrowser("UPDATE_PUT", { id: bId, updated_to: putPayload.firstname });
        check(putRes, { 'PUT Success': (r) => r.status === 200 });

        // --- 4. DELETE ---
        let delRes = http.del(`${BASE_URL}/booking/${bId}`, null, { headers: { 'Cookie': `token=${token}` } });
        console.log(`🗑️ Deleted ID: ${bId}`);
        sendToBrowser("DELETE", { id: bId, status: "Removed" });
        check(delRes, { 'DELETE Success': (r) => r.status === 201 });
    }

    sleep(2);
}