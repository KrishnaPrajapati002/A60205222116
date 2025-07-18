// src/logs.js
export async function log(stack, level, pkg, message) {
  // Validate inputs as per the backend requirements if needed
  await fetch('http://localhost:3000/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stack, level, package: pkg, message
    })
  }).catch(() => {});
}
