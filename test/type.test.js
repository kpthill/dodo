import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dodo } from './helpers.js';

describe('type', () => {
  it('returns the type name as a string', () => {
    assert.equal(dodo('(type 42)'),       'number');
    assert.equal(dodo('(type 3.14)'),     'number');
    assert.equal(dodo('(type "hello")'),  'string');
    assert.equal(dodo('(type true)'),     'bool');
    assert.equal(dodo('(type false)'),    'bool');
    assert.equal(dodo('(type nil)'),      'nil');
    assert.equal(dodo('(type [1 2])'),    'list');
    assert.equal(dodo('(type {"a": 1})'), 'map');
    assert.equal(dodo('(type (fn (x) x))'), 'fn');
  });
});

describe('type predicates', () => {
  it('number?', () => {
    assert.equal(dodo('(number? 42)'),     true);
    assert.equal(dodo('(number? 3.14)'),   true);
    assert.equal(dodo('(number? "42")'),   false);
    assert.equal(dodo('(number? nil)'),    false);
  });

  it('string?', () => {
    assert.equal(dodo('(string? "hi")'),   true);
    assert.equal(dodo('(string? 42)'),     false);
  });

  it('bool?', () => {
    assert.equal(dodo('(bool? true)'),     true);
    assert.equal(dodo('(bool? false)'),    true);
    assert.equal(dodo('(bool? nil)'),      false);
    assert.equal(dodo('(bool? 0)'),        false);
  });

  it('list?', () => {
    assert.equal(dodo('(list? [1 2 3])'),  true);
    assert.equal(dodo('(list? [])'),       true);
    assert.equal(dodo('(list? {})'),       false);
  });

  it('map?', () => {
    assert.equal(dodo('(map? {"a": 1})'),  true);
    assert.equal(dodo('(map? {})'),        true);
    assert.equal(dodo('(map? [])'),        false);
  });

  it('nil?', () => {
    assert.equal(dodo('(nil? nil)'),       true);
    assert.equal(dodo('(nil? false)'),     false);
    assert.equal(dodo('(nil? 0)'),         false);
  });

  it('fn?', () => {
    assert.equal(dodo('(fn? (fn (x) x))'), true);
    assert.equal(dodo('(fn? +)'),          true);
    assert.equal(dodo('(fn? 42)'),         false);
  });
});

describe('number->string', () => {
  it('converts integer', () => {
    assert.equal(dodo('(number->string 42)'),   '42');
    assert.equal(dodo('(number->string -7)'),   '-7');
    assert.equal(dodo('(number->string 0)'),    '0');
  });

  it('converts float', () => {
    assert.equal(dodo('(number->string 3.14)'), '3.14');
  });
});

describe('string->number', () => {
  it('parses integer string', () => {
    assert.equal(dodo('(string->number "42")'),   42);
    assert.equal(dodo('(string->number "-7")'),   -7);
  });

  it('parses float string', () => {
    assert.equal(dodo('(string->number "3.14")'), 3.14);
  });

  it('throws on unparseable input', () => {
    assert.throws(() => dodo('(string->number "abc")'));
  });
});
