import test from 'node:test';
import assert from 'node:assert/strict';
let SessionGate;
try { ({ SessionGate } = await import('../src/session.js')); } catch {}
test('session protection is available', () => assert.ok(SessionGate, 'The session guard has not been implemented yet.'));
const check = (title, fn) => test(title, { skip: !SessionGate }, fn);
check('old-account tokens stop working immediately on a change of account', () => {
  const gate = new SessionGate();
  const a = gate.activate('alice'); gate.setPhase(a, 'ready'); gate.assertWritable(a);
  const b = gate.activate('bob');
  assert.equal(gate.isCurrent(a), false);
  assert.throws(() => gate.assertWritable(a), /account|session/i);
  assert.throws(() => gate.assertWritable(b), /ready|loading/i);
  gate.setPhase(b, 'ready'); gate.assertWritable(b);
});
check('loading, offline, errors and sign-out do not permit cloud mutations', () => {
  const gate = new SessionGate();
  const token = gate.activate('alice');
  for (const phase of ['loading', 'offline', 'error']) {
    gate.setPhase(token, phase); assert.throws(() => gate.assertWritable(token));
  }
  gate.setPhase(token, 'ready'); gate.assertWritable(token);
  gate.activate(null); assert.throws(() => gate.assertWritable(token));
});
check('a late snapshot cannot re-enable a previous account session', () => {
  const gate = new SessionGate();const old = gate.activate('alice');
  const current = gate.activate('bob');gate.setPhase(old, 'ready');
  assert.throws(() => gate.assertWritable(current));
  gate.setPhase(current, 'ready');gate.assertWritable(current);
});
