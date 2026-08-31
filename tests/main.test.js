import test from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from '../js/main.js';

test('startup surfaces a storage read issue after the initial render', async () => {
  const calls = [];
  await startApp({
    delay: async () => {},
    load: () => ({ finds: [], issue: 'Stored finds could not be read.' }),
    create: () => ({ getFinds: () => [] }),
    loading: () => calls.push('loading'),
    render: () => calls.push('render'),
    toast: (message) => calls.push(message),
    bind: () => {}
  });
  assert.deepEqual(calls, ['loading', 'render', 'Stored finds could not be read.']);
});
