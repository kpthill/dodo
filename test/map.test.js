import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dodo } from './helpers.js';

describe('access', () => {
  it('get returns value for existing key', () => {
    assert.equal(dodo('(get {"a": 1, "b": 2} "a")'), 1);
  });

  it('get returns nil for missing key', () => {
    assert.equal(dodo('(get {"a": 1} "z")'), null);
  });

  it('get-or returns default for missing key', () => {
    assert.equal(dodo('(get-or {"a": 1} "z" 99)'), 99);
    assert.equal(dodo('(get-or {"a": 1} "a" 99)'), 1);
  });

  it('has?', () => {
    assert.equal(dodo('(has? {"a": 1} "a")'), true);
    assert.equal(dodo('(has? {"a": 1} "z")'), false);
  });
});

describe('functional updates', () => {
  it('put returns new map with added key', () => {
    assert.equal(dodo('(get (put {"a": 1} "b" 2) "b")'), 2);
  });

  it('put does not mutate original', () => {
    assert.equal(dodo('(def m {"a": 1}) (put m "b" 2) (has? m "b")'), false);
  });

  it('remove returns new map without key', () => {
    assert.equal(dodo('(has? (remove {"a": 1, "b": 2} "a") "a")'), false);
  });

  it('remove does not mutate original', () => {
    assert.equal(dodo('(def m {"a": 1, "b": 2}) (remove m "a") (has? m "a")'), true);
  });
});

describe('enumeration', () => {
  it('keys', () => {
    assert.deepEqual(dodo('(sort (keys {"a": 1, "b": 2, "c": 3}))'), ['a', 'b', 'c']);
  });

  it('vals', () => {
    assert.deepEqual(dodo('(sort (vals {"a": 1, "b": 2, "c": 3}))'), [1, 2, 3]);
  });

  it('entries', () => {
    const result = dodo('(sort-by (fn (e) (nth e 0)) (entries {"a": 1, "b": 2}))');
    assert.deepEqual(result, [['a', 1], ['b', 2]]);
  });
});

describe('merge', () => {
  it('combines two maps', () => {
    assert.equal(dodo('(get (merge {"a": 1} {"b": 2}) "a")'), 1);
    assert.equal(dodo('(get (merge {"a": 1} {"b": 2}) "b")'), 2);
  });

  it('right side overwrites on conflict', () => {
    assert.equal(dodo('(get (merge {"a": 1} {"a": 99}) "a")'), 99);
  });
});

describe('len and empty?', () => {
  it('len', () => {
    assert.equal(dodo('(len {"a": 1, "b": 2})'), 2);
    assert.equal(dodo('(len {})'), 0);
  });

  it('empty?', () => {
    assert.equal(dodo('(empty? {})'), true);
    assert.equal(dodo('(empty? {"a": 1})'), false);
  });
});
