import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dodo } from './helpers.js';

describe('literal patterns', () => {
  it('matches numbers', () => {
    assert.equal(dodo('(match 0 (0 "zero") (_ "other"))'), 'zero');
    assert.equal(dodo('(match 42 (0 "zero") (_ "other"))'), 'other');
  });

  it('matches booleans', () => {
    assert.equal(dodo('(match true (true "yes") (_ "no"))'), 'yes');
    assert.equal(dodo('(match false (true "yes") (false "no"))'), 'no');
  });

  it('matches strings', () => {
    assert.equal(dodo('(match "hi" ("hi" "hello") (_ "?"))'), 'hello');
  });

  it('matches nil', () => {
    assert.equal(dodo('(match nil (nil "nothing") (_ "something"))'), 'nothing');
  });
});

describe('variable binding', () => {
  it('binds the matched value', () => {
    assert.equal(dodo('(match 42 (x x))'), 42);
  });

  it('binding is available in the body', () => {
    assert.equal(dodo('(match 5 (x (* x x)))'), 25);
  });
});

describe('wildcard', () => {
  it('matches anything', () => {
    assert.equal(dodo('(match 99 (_ "caught"))'), 'caught');
    assert.equal(dodo('(match nil (_ "caught"))'), 'caught');
  });

  it('binds nothing', () => {
    assert.equal(dodo('(match 1 (_ 42))'), 42);
  });
});

describe('guard clauses', () => {
  it('evaluates guard with pattern bindings in scope', () => {
    assert.equal(dodo(`
      (match 5
        (x when (> x 0) "positive")
        (x when (< x 0) "negative")
        (_ "zero"))
    `), 'positive');
  });

  it('falls through when guard is false', () => {
    assert.equal(dodo(`
      (match -3
        (x when (> x 0) "positive")
        (x when (< x 0) "negative")
        (_ "zero"))
    `), 'negative');
  });

  it('wildcard with guard', () => {
    assert.equal(dodo(`
      (match 0
        (x when (> x 0) "positive")
        (x when (< x 0) "negative")
        (_ "zero"))
    `), 'zero');
  });
});

describe('list pattern destructuring', () => {
  it('matches empty list', () => {
    assert.equal(dodo('(match [] ([] "empty") (_ "nonempty"))'), 'empty');
  });

  it('matches fixed-length list and binds elements', () => {
    assert.equal(dodo('(match [1 2 3] ([a b c] (+ a b c)))'), 6);
  });

  it('does not match wrong length', () => {
    assert.equal(dodo('(match [1 2] ([a b c] "three") (_ "other"))'), 'other');
  });

  it('head/tail destructuring', () => {
    assert.equal(dodo('(match [1 2 3] ([x . rest] x))'), 1);
    assert.deepEqual(dodo('(match [1 2 3] ([x . rest] rest))'), [2, 3]);
  });

  it('rest is empty list for single-element list', () => {
    assert.deepEqual(dodo('(match [1] ([x . rest] rest))'), []);
  });

  it('nested list patterns', () => {
    assert.equal(dodo('(match [[1 2] [3 4]] ([[a b] [c d]] (+ a d)))'), 5);
  });

  it('recursive sum via destructuring', () => {
    assert.equal(dodo(`
      (defn sum (lst)
        (match lst
          ([]         0)
          ([x . rest] (+ x (sum rest)))))
      (sum [1 2 3 4 5])
    `), 15);
  });
});

describe('map pattern destructuring', () => {
  it('matches on a key value and binds another', () => {
    assert.equal(dodo(`
      (match {"kind": "circle", "radius": 3}
        ({"kind": "circle", "radius": r} r)
        (_ nil))
    `), 3);
  });

  it('fails when required key has wrong value', () => {
    assert.equal(dodo(`
      (match {"kind": "rect", "width": 4}
        ({"kind": "circle", "radius": r} "circle")
        (_ "other"))
    `), 'other');
  });

  it('matches with at least the specified keys (extra keys ok)', () => {
    assert.equal(dodo(`
      (match {"name": "Alice", "age": 30, "city": "Portland"}
        ({"name": name} name))
    `), 'Alice');
  });

  it('rest captures remaining keys', () => {
    assert.equal(dodo(`
      (match {"a": 1, "b": 2, "c": 3}
        ({"a": v . rest} v))
    `), 1);
  });
});
