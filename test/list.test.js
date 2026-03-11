import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dodo } from './helpers.js';

describe('basic access', () => {
  it('head', () => {
    assert.equal(dodo('(head [1 2 3])'), 1);
  });

  it('tail', () => {
    assert.deepEqual(dodo('(tail [1 2 3])'), [2, 3]);
  });

  it('nth', () => {
    assert.equal(dodo('(nth [10 20 30] 0)'), 10);
    assert.equal(dodo('(nth [10 20 30] 1)'), 20);
    assert.equal(dodo('(nth [10 20 30] 2)'), 30);
  });

  it('len', () => {
    assert.equal(dodo('(len [1 2 3])'), 3);
    assert.equal(dodo('(len [])'), 0);
  });

  it('empty?', () => {
    assert.equal(dodo('(empty? [])'), true);
    assert.equal(dodo('(empty? [1])'), false);
  });
});

describe('construction', () => {
  it('cons prepends an element', () => {
    assert.deepEqual(dodo('(cons 0 [1 2 3])'), [0, 1, 2, 3]);
    assert.deepEqual(dodo('(cons 1 [])'), [1]);
  });

  it('concat', () => {
    assert.deepEqual(dodo('(concat [1 2] [3 4])'), [1, 2, 3, 4]);
    assert.deepEqual(dodo('(concat [] [1 2])'), [1, 2]);
  });

  it('reverse', () => {
    assert.deepEqual(dodo('(reverse [1 2 3])'), [3, 2, 1]);
    assert.deepEqual(dodo('(reverse [])'), []);
  });

  it('range', () => {
    assert.deepEqual(dodo('(range 0 5)'), [0, 1, 2, 3, 4]);
    assert.deepEqual(dodo('(range 0 0)'), []);
  });
});

describe('higher-order', () => {
  it('map', () => {
    assert.deepEqual(dodo('(map (fn (x) (* x x)) [1 2 3 4 5])'), [1, 4, 9, 16, 25]);
  });

  it('filter', () => {
    assert.deepEqual(dodo('(filter (fn (x) (> x 3)) [1 2 3 4 5])'), [4, 5]);
  });

  it('fold', () => {
    assert.equal(dodo('(fold (fn (acc x) (+ acc x)) 0 [1 2 3 4 5])'), 15);
    assert.equal(dodo('(fold (fn (acc x) (+ acc x)) 0 [])'), 0);
  });

  it('flat-map', () => {
    assert.deepEqual(dodo('(flat-map (fn (x) [x x]) [1 2 3])'), [1, 1, 2, 2, 3, 3]);
  });

  it('filter uses Dodo truthiness — 0 is truthy', () => {
    assert.deepEqual(dodo('(filter (fn (x) x) [0 1 2])'), [0, 1, 2]);
  });
});

describe('sorting', () => {
  it('sort numbers', () => {
    assert.deepEqual(dodo('(sort [3 1 4 1 5 9 2 6])'), [1, 1, 2, 3, 4, 5, 6, 9]);
  });

  it('sort strings', () => {
    assert.deepEqual(dodo('(sort ["banana" "apple" "cherry"])'), ['apple', 'banana', 'cherry']);
  });

  it('sort-by key function', () => {
    assert.deepEqual(
      dodo('(sort-by (fn (x) (nth x 1)) [["b" 2] ["a" 1] ["c" 3]])'),
      [['a', 1], ['b', 2], ['c', 3]]
    );
  });
});

describe('zip and enumerate', () => {
  it('zip', () => {
    assert.deepEqual(dodo('(zip [1 2 3] ["a" "b" "c"])'), [[1, 'a'], [2, 'b'], [3, 'c']]);
  });

  it('enumerate', () => {
    assert.deepEqual(dodo('(enumerate ["a" "b" "c"])'), [[0, 'a'], [1, 'b'], [2, 'c']]);
  });
});
