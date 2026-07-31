import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';

import { createApp } from '../app.js';

const server = http.createServer(createApp());

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET / returns service metadata', async () => {
  const response = await fetch(`http://127.0.0.1:${port}/`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    name: 'qrver-express-api',
    status: 'ok',
  });
});

test('GET /health returns an OK status', async () => {
  const response = await fetch(`http://127.0.0.1:${port}/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('invalid login payload is rejected before database access', async () => {
  const response = await fetch(`http://127.0.0.1:${port}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email', password: '123' }),
  });

  assert.equal(response.status, 400);
  assert.equal(Array.isArray(await response.json()), true);
});
