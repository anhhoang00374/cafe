import http from 'http';

// Simple HTTP client to test the endpoint
const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/profits',
    method: 'GET',
    headers: {
        'Authorization': 'Bearer test-token'
    }
};

const req = http.request(options, (res) => {
    let data = '';

    console.log(`Status: ${res.statusCode}`);

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response:', data);
        process.exit(0);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
    process.exit(1);
});

req.end();

