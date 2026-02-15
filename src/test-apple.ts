
import { verifyIdToken } from 'apple-signin-auth';
import dotenv from 'dotenv';

dotenv.config();

const token = "eyJraWQiOiJZUXJxZE1ENGJxIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoiaG9zdC5leHAuRXhwb25lbnQiLCJleHAiOjE3NzEyODA3OTMsImlhdCI6MTc3MTE5NDM5Mywic3ViIjoiMDAxODI4LmFjMTQzYTkwYjA5MjQzMmZhNDJhM2NiZjhjZjZlOTU3LjIwNTAiLCJjX2hhc2giOiI0clotYXFQOVhDRXlZNHhIbWFvSHZnIiwiZW1haWwiOiJyYWp2YWxlY2hhMjRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF1dGhfdGltZSI6MTc3MTE5NDM5Mywibm9uY2Vfc3VwcG9ydGVkIjp0cnVlfQ.GiEnDfaJw9yr_wWnhyZIkNt8JB9XJxBBIM9VD_4w4WCyimcL9kiQgiy-v-XDPIG1yU3fHHubwPZHv4ZZl_EXw6AdcQmGG-s72wpqoBSCCiLJoG_mJIJdEe5n0Ut3_z0z7d3C7htduG72fVu5MnyZKVBBIXgZvcAX77V9iOCfA4QzwZ5jsXlgBQg6CDfkgVYNj7x4ab1Oy2psd4oVT5ndEWcZXkBUA_4AKi4Lxz9rrowgu6ISoPPzNl3ypH_KMZ6JmXqGgSeuNhhF1Wr-_Vkp-spoQrTEgvMGyW1An-DyqwpJ7Nf6gZFWzOSG5Em88BiHzwwozcinYdqb54N25D_W6g";

async function testToken() {
    try {
        const audience = [
            'host.exp.Exponent',
            process.env.APPLE_CLIENT_ID || 'com.rebookz.app'
        ];
        console.log('Testing with audiences:', audience);

        const payload = await verifyIdToken(token, {
            audience,
            ignoreExpiration: false,
        });
        console.log('SUCCESS! Token is valid.');
        console.log('Payload:', JSON.stringify(payload, null, 2));
    } catch (error: any) {
        console.error('FAILED! Token verification error:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

testToken();
