import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dodo } from './helpers.js';

describe('literals', () => {
  it('numbers', () => {
    assert.equal(dodo('42'), 42);
    assert.equal(dodo('-7'), -7);
    assert.equal(dodo('3.14'), 3.14);
  });

  it('booleans', () => {
    assert.equal(dodo('true'), true);
    assert.equal(dodo('false'), false);
  });

  it('strings', () => {
    assert.equal(dodo('"hello"'), 'hello');
    assert.equal(dodo('"line\\none"'), 'line\none');
  });

  it('nil', () => {
    assert.equal(dodo('nil'), null);
  });
});

describe('def', () => {
  it('binds a value', () => {
    assert.equal(dodo('(def x 42) x'), 42);
  });

  it('returns nil', () => {
    assert.equal(dodo('(def x 1)'), null);
  });

  it('later bindings can reference earlier ones', () => {
    assert.equal(dodo('(def x 10) (def y (* x 2)) y'), 20);
  });
});

describe('fn and defn', () => {
  it('anonymous function returns value', () => {
    assert.equal(dodo('((fn (x) (* x x)) 5)'), 25);
  });

  it('defn creates a callable function', () => {
    assert.equal(dodo('(defn double (x) (* x 2)) (double 7)'), 14);
  });

  it('closures capture their environment', () => {
    assert.equal(dodo(`
      (defn make-adder (n) (fn (x) (+ x n)))
      (def add5 (make-adder 5))
      (add5 10)
    `), 15);
  });

  it('functions can be recursive', () => {
    assert.equal(dodo(`
      (defn fib (n)
        (match n
          (0 0)
          (1 1)
          (n (+ (fib (- n 1)) (fib (- n 2))))))
      (fib 10)
    `), 55);
  });
});

describe('do', () => {
  it('returns the last expression', () => {
    assert.equal(dodo('(do 1 2 3)'), 3);
  });

  it('evaluates expressions in order', () => {
    assert.equal(dodo('(do (def x 1) (def y 2) (+ x y))'), 3);
  });

  it('bindings do not leak to outer scope', () => {
    assert.throws(() => dodo('(do (def inner 1)) inner'));
  });
});

describe('let', () => {
  it('binds locals and returns body', () => {
    assert.equal(dodo('(let ((x 10) (y 20)) (+ x y))'), 30);
  });

  it('bindings are sequential', () => {
    assert.equal(dodo('(let ((x 10) (y (+ x 1))) (* x y))'), 110);
  });
});

describe('and / or', () => {
  it('and returns last value when all truthy', () => {
    assert.equal(dodo('(and 1 2 3)'), 3);
  });

  it('and returns first falsy value', () => {
    assert.equal(dodo('(and 1 false 3)'), false);
    assert.equal(dodo('(and 1 nil 3)'), null);
  });

  it('or returns first truthy value', () => {
    assert.equal(dodo('(or false nil 42)'), 42);
  });

  it('or returns last value when all falsy', () => {
    assert.equal(dodo('(or false nil)'), null);
  });

  it('0 and empty string are truthy in Dodo', () => {
    assert.equal(dodo('(and 0 "done")'), 'done');
    assert.equal(dodo('(and "" "done")'), 'done');
  });
});
