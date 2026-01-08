const { execSync } = require('child_process');
const path = require('path');

console.log('Building Failure-Aware Learning Coach...');

try {
  // Install backend dependencies
  console.log('Installing backend dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Install frontend dependencies
  console.log('Installing frontend dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });

  // Build frontend
  console.log('Building frontend...');
  execSync('npm run build', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });

  console.log('Build completed successfully!');
  console.log('To start the application, run: npm start');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}