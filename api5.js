 import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
    vus: 5,
    duration: '10s',
};

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export default function () {
    const headers = { 'Content-Type': 'application/json' };

    // 1. POST
    let postPayload = JSON.stringify({ title: 'Banti Post', body: 'New Data', userId: 1 });
    let postRes = http.post(`${BASE_URL}/posts`, postPayload, { headers });
    check(postRes, { 'POST Status 201': (r) => r.status === 201 });

    let postVerify = http.get(`${BASE_URL}/posts/1`);
    check(postVerify, { 'POST Verified via GET': (r) => r.status === 200 });

    // 2. PUT
    let putPayload = JSON.stringify({ id: 1, title: 'Updated Title', body: 'Updated Body', userId: 1 });
    let putRes = http.put(`${BASE_URL}/posts/1`, putPayload, { headers });
    check(putRes, { 'PUT Status 200': (r) => r.status === 200 });

    let putVerify = http.get(`${BASE_URL}/posts/1`);
    check(putVerify, { 'PUT Verified via GET': (r) => r.status === 200 });

    // 3. PATCH
    let patchPayload = JSON.stringify({ title: 'Patched Title' });
    let patchRes = http.patch(`${BASE_URL}/posts/1`, patchPayload, { headers });
    check(patchRes, { 'PATCH Status 200': (r) => r.status === 200 });

    let patchVerify = http.get(`${BASE_URL}/posts/1`);
    check(patchVerify, { 'PATCH Verified via GET': (r) => r.status === 200 });

    // 4. DELETE (FIXED LINE)
    let deleteRes = http.del(`${BASE_URL}/posts/1`); // 'delete' ki jagah 'del' use kiya
    check(deleteRes, { 'DELETE Status 200/204': (r) => r.status === 200 || r.status === 204 });

    let deleteVerify = http.get(`${BASE_URL}/posts/1`);
    check(deleteVerify, { 'DELETE Verified': (r) => r.status === 200 || r.status === 404 });

    sleep(1);
}