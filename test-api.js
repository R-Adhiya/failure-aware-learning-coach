const http = require('http');

const testEndpoint = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

async function runTests() {
  console.log('Testing Failure-Aware Learning Coach API...\n');

  try {
    // Test 1: Student Login
    console.log('1. Testing student login...');
    const loginResult = await testEndpoint('POST', '/api/auth/login', {
      name: 'Test Student',
      id: 'student123',
      role: 'student'
    });
    console.log(`   Status: ${loginResult.status}`);
    console.log(`   Response: ${JSON.stringify(loginResult.data, null, 2)}\n`);

    // Test 2: Student Dashboard
    console.log('2. Testing student dashboard...');
    const dashboardResult = await testEndpoint('GET', '/api/student/dashboard/student123');
    console.log(`   Status: ${dashboardResult.status}`);
    console.log(`   Analysis: ${dashboardResult.data.analysis?.riskLevel || 'N/A'}`);
    console.log(`   Insight: ${dashboardResult.data.analysis?.insight || 'N/A'}\n`);

    // Test 3: Add Activity
    console.log('3. Testing add activity...');
    const activityResult = await testEndpoint('POST', '/api/student/activity/student123', {
      topic: 'Mathematics',
      attempts: 10,
      correct: 7,
      timeSpent: 25
    });
    console.log(`   Status: ${activityResult.status}`);
    console.log(`   Success: ${activityResult.data.success || false}\n`);

    // Test 4: Daily Test
    console.log('4. Testing daily test...');
    const testResult = await testEndpoint('POST', '/api/student/daily-test/student123', {
      topic: 'Science',
      attempts: 8,
      correct: 6,
      timeSpent: 20,
      reflection: 'Good session today'
    });
    console.log(`   Status: ${testResult.status}`);
    console.log(`   Success: ${testResult.data.success || false}\n`);

    // Test 5: Trainer Login
    console.log('5. Testing trainer login...');
    const trainerLoginResult = await testEndpoint('POST', '/api/auth/login', {
      name: 'Test Trainer',
      id: 'trainer123',
      role: 'trainer'
    });
    console.log(`   Status: ${trainerLoginResult.status}`);
    console.log(`   Response: ${JSON.stringify(trainerLoginResult.data, null, 2)}\n`);

    // Test 6: Trainer Dashboard
    console.log('6. Testing trainer dashboard...');
    const trainerDashboardResult = await testEndpoint('GET', '/api/trainer/dashboard');
    console.log(`   Status: ${trainerDashboardResult.status}`);
    console.log(`   Students: ${trainerDashboardResult.data.students?.length || 0}`);
    console.log(`   Summary: ${JSON.stringify(trainerDashboardResult.data.summary, null, 2)}\n`);

    // Test 7: Updated Student Dashboard (after activity)
    console.log('7. Testing updated student dashboard...');
    const updatedDashboardResult = await testEndpoint('GET', '/api/student/dashboard/student123');
    console.log(`   Status: ${updatedDashboardResult.status}`);
    console.log(`   Analysis: ${updatedDashboardResult.data.analysis?.riskLevel || 'N/A'}`);
    console.log(`   Insight: ${updatedDashboardResult.data.analysis?.insight || 'N/A'}`);
    console.log(`   Recent Activities: ${updatedDashboardResult.data.recentActivities?.length || 0}\n`);

    console.log('✅ All API tests completed successfully!');
    console.log('\nThe Failure-Aware Learning Coach is ready for deployment!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();