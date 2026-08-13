import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dodo } from './helpers.js';

/**
 * Run fn while capturing everything written to stdout (console.log and
 * process.stdout.write both funnel through process.stdout.write).
 * Returns { value, out }.
 */
function captureStdout(fn) {
  const original = process.stdout.write;
  let out = '';
  process.stdout.write = (chunk) => {
    out += chunk;
    return true;
  };
  try {
    return { value: fn(), out };
  } finally {
    process.stdout.write = original;
  }
}

describe('print', () => {
  it('prints to stdout without a trailing newline', () => {
    const { out } = captureStdout(() => dodo('(print "hello")'));
    assert.equal(out, 'hello');
  });

  it('returns nil', () => {
    const { value } = captureStdout(() => dodo('(print "hello")'));
    assert.equal(value, null);
  });
});

describe('println', () => {
  it('prints to stdout with a trailing newline', () => {
    const { out } = captureStdout(() => dodo('(println "hello")'));
    assert.equal(out, 'hello\n');
  });
});
