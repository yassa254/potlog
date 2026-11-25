/**
 * Automated Test Suite for AirPulse Hotspot Backend & APIs
 */
const http = require('http');

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: res.headers['content-type']?.includes('application/json') ? JSON.parse(body) : body
          });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting AirPulse Backend API Verification ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health
    const health = await request('GET', '/api/health');
    assert(health.statusCode === 200 && health.body.status === 'online', '1. /api/health returns 200 online');

    // 2. Test Router Function on backend
    const routerTest = await request('POST', '/api/router/test', { host: '192.168.88.1', port: 8728 });
    assert(routerTest.statusCode === 200 && routerTest.body.host === '192.168.88.1' && typeof routerTest.body.latencyMs === 'number', '2. POST /api/router/test returns diagnostic object with latency');

    // 3. Payment config GET
    const configGet = await request('GET', '/api/payments/config');
    assert(configGet.statusCode === 200 && configGet.body.provider === 'mpesa_daraja', '3. GET /api/payments/config returns payment configuration');

    // 4. Payment config POST
    const configPost = await request('POST', '/api/payments/config', {
      daraja: { businessShortCode: '174379', environment: 'sandbox' },
      settlement: { bankName: 'Equity Bank Kenya', accountNumber: '0180293847291' }
    });
    assert(configPost.statusCode === 200 && configPost.body.success === true, '4. POST /api/payments/config updates live settings');

    // 5. Test config endpoint
    const testConfig = await request('POST', '/api/payments/test-config');
    assert(testConfig.statusCode === 200 && testConfig.body.readyToProcess === true, '5. POST /api/payments/test-config validates gateway readiness');

    // 6. Real-Time Payment from user input on portal
    const paymentInit = await request('POST', '/api/payments/initiate', {
      phone: '0712345678',
      planId: 'plan-3h',
      mac: 'BC:D0:74:12:34:56',
      ip: '192.168.88.55',
      gatewayHost: '192.168.88.1'
    });
    assert(
      paymentInit.statusCode === 200 &&
      paymentInit.body.success === true &&
      paymentInit.body.status === 'COMPLETED' &&
      paymentInit.body.deviceConnected === true &&
      Boolean(paymentInit.body.paymentRef) &&
      Boolean(paymentInit.body.voucherPin),
      '6. POST /api/payments/initiate completes payment, issues voucher PIN & authorizes device'
    );

    // 7. Real-Time Device Connect
    const deviceConnect = await request('POST', '/api/devices/connect', {
      mac: '12:34:56:78:9A:BC',
      ip: '192.168.88.99',
      durationSeconds: 10800,
      planTitle: '3 Hours Pass',
      voucherPin: 'AP-TEST1'
    });
    assert(deviceConnect.statusCode === 200 && deviceConnect.body.authorized === true, '7. POST /api/devices/connect authorizes device lease on router');

    // 8. Active devices
    const activeDevices = await request('GET', '/api/devices/active');
    assert(activeDevices.statusCode === 200 && Array.isArray(activeDevices.body.devices) && activeDevices.body.count >= 2, '8. GET /api/devices/active returns connected devices');

    // 9. Payment records ledger
    const records = await request('GET', '/api/payments/records');
    assert(records.statusCode === 200 && Array.isArray(records.body.records) && records.body.count >= 1, '9. GET /api/payments/records returns ledger records');

    // 10. CORS headers check
    assert(
      health.headers['access-control-allow-origin'] === '*' &&
      health.headers['access-control-allow-methods']?.includes('POST'),
      '10. CORS headers present to allow requests to/from the router'
    );

    // 11. Static files serving
    const indexHtml = await request('GET', '/');
    assert(indexHtml.statusCode === 200 && indexHtml.body.includes('AIRPULSE v2.0'), '11. GET / serves index.html with new branding');

    console.log(`\nResults: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

// Start server in-process if not already running, then run tests
const server = require('./server.js');
setTimeout(runTests, 600);
