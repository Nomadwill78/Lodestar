import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';

// Run the actual handlers with isolated auth/database/model doubles. No live calls.
async function loadHandler(name, { user = null, plan = null, serviceKey = true, dbError = false } = {}) {
  let handler; let modelCalls = 0;
  const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'test-anon', SUPABASE_SERVICE_ROLE_KEY: serviceKey ? 'test-service' : '', ANTHROPIC_API_KEY: 'test-model' };
  const client = {
    auth: { getUser: async () => ({ data: { user } }) },
    from: () => {
      const chain = {};
      for (const key of ['select', 'eq', 'in', 'order', 'limit']) chain[key] = () => chain;
      chain.maybeSingle = async () => ({ data: plan ? { plan, status: 'active' } : null, error: dbError ? new Error('offline') : null });
      chain.upsert = async () => ({ error: null });
      return chain;
    },
  };
  const context = vm.createContext({ Deno: { env: { get: (key) => env[key] } }, createClient: () => client,
    serve: (fn) => { handler = fn; }, Request, Response, Date, console,
    fetch: async () => { modelCalls++; return Response.json({ content: [{ text: 'Test reading' }] }); },
  });
  const clean = (source) => stripTypeScriptTypes(source.replace(/^import .*;\s*$/gm, '').replace(/^export /gm, ''), { mode: 'transform' });
  // The advisor preserves its weekly allowance implementation; other readings use shared entitlement.
  if (name !== 'advisor') {
    const shared = await readFile(new URL('../supabase/functions/_shared/entitlement.ts', import.meta.url), 'utf8');
    vm.runInContext(clean(shared), context);
  }
  const source = await readFile(new URL(`../supabase/functions/${name}/index.ts`, import.meta.url), 'utf8');
  vm.runInContext(clean(source), context);
  return { call: () => handler(new Request('https://example.test', { method: 'POST', headers: { Authorization: 'Bearer test', 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }], category: 'general' }) })), calls: () => modelCalls };
}
for (const name of ['advisor', 'birth-chart', 'compatibility', 'horoscope']) {
  test(`${name}: anonymous callers never reach the model`, async () => {
    const harness = await loadHandler(name);
    assert.equal((await harness.call()).status, 401); assert.equal(harness.calls(), 0);
  });
}
for (const name of ['birth-chart', 'compatibility']) {
  test(`${name}: free accounts cannot request premium readings`, async () => {
    const harness = await loadHandler(name, { user: { id: 'user-a' } });
    assert.equal((await harness.call()).status, 403); assert.equal(harness.calls(), 0);
  });
}
test('advisor: missing service configuration fails closed', async () => {
  const harness = await loadHandler('advisor', { user: { id: 'user-a' }, serviceKey: false });
  assert.equal((await harness.call()).status, 503); assert.equal(harness.calls(), 0);
});
test('advisor: database errors never become free unmetered model calls', async () => {
  const harness = await loadHandler('advisor', { user: { id: 'user-a' }, dbError: true });
  assert.equal((await harness.call()).status, 503); assert.equal(harness.calls(), 0);
});
test('authenticated general horoscope still works', async () => {
  const harness = await loadHandler('horoscope', { user: { id: 'user-a' } });
  assert.equal((await harness.call()).status, 200); assert.equal(harness.calls(), 1);
});
