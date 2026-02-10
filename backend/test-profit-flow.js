import http from 'http';
import querystring from 'querystring';

// Test login endpoint first
const loginData = querystring.stringify({
    email: 'admin@cafe.com',
    password: 'password'
});

const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(loginData)
    }
};

console.log('Testing login endpoint...');

const loginReq = http.request(loginOptions, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log(`Login Status: ${res.statusCode}`);
        console.log('Login Response:', data);

        if (res.statusCode === 200) {
            try {
                const json = JSON.parse(data);
                const token = json.token;
                console.log('\nToken obtained:', token.substring(0, 30) + '...');

                // Now test profits endpoint with valid token
                testProfitsEndpoint(token);
            } catch (e) {
                console.error('Failed to parse login response:', e.message);
                process.exit(1);
            }
        } else {
            console.error('Login failed');
            process.exit(1);
        }
    });
});

loginReq.on('error', (e) => {
    console.error(`Login error: ${e.message}`);
    process.exit(1);
});

loginReq.write(loginData);
loginReq.end();

function testProfitsEndpoint(token) {
    console.log('\n--- Testing profits endpoint ---');
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/profits',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
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
        console.error(`Problem: ${e.message}`);
        process.exit(1);
    });

    req.end();
}

