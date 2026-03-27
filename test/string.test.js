import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dodo } from './helpers.js';

describe('str', () => {
  it('concatenates strings', () => {
    assert.equal(dodo('(str "hello" " " "world")'), 'hello world');
  });

  it('single argument', () => {
    assert.equal(dodo('(str "hi")'), 'hi');
  });

  it('coerces non-strings', () => {
    assert.equal(dodo('(str "n=" 42)'), 'n=42');
    assert.equal(dodo('(str true)'), 'true');
    assert.equal(dodo('(str nil)'), 'nil');
  });
});

describe('str-len', () => {
  it('returns length', () => {
    assert.equal(dodo('(str-len "hello")'), 5);
    assert.equal(dodo('(str-len "")'), 0);
  });
});

describe('str-slice', () => {
  it('start inclusive, end exclusive', () => {
    assert.equal(dodo('(str-slice "hello" 1 3)'), 'el');
    assert.equal(dodo('(str-slice "hello" 0 5)'), 'hello');
  });
});

describe('str-index', () => {
  it('returns index of substring', () => {
    assert.equal(dodo('(str-index "hello" "ll")'), 2);
    assert.equal(dodo('(str-index "hello" "he")'), 0);
  });

  it('returns -1 when not found', () => {
    assert.equal(dodo('(str-index "hello" "xyz")'), -1);
  });
});

describe('str-split', () => {
  it('splits on delimiter', () => {
    assert.deepEqual(dodo('(str-split "a,b,c" ",")'), ['a', 'b', 'c']);
  });

  it('no delimiter found returns single-element list', () => {
    assert.deepEqual(dodo('(str-split "hello" ",")'), ['hello']);
  });
});

describe('str-join', () => {
  it('joins with separator', () => {
    assert.equal(dodo('(str-join ["a" "b" "c"] ",")'), 'a,b,c');
  });

  it('empty separator', () => {
    assert.equal(dodo('(str-join ["a" "b" "c"] "")'), 'abc');
  });
});

describe('str-upper / str-lower', () => {
  it('str-upper', () => {
    assert.equal(dodo('(str-upper "hello")'), 'HELLO');
  });

  it('str-lower', () => {
    assert.equal(dodo('(str-lower "HELLO")'), 'hello');
  });
});

describe('str-trim', () => {
  it('removes leading and trailing whitespace', () => {
    assert.equal(dodo('(str-trim "  hello  ")'), 'hello');
    assert.equal(dodo('(str-trim "hello")'), 'hello');
  });
});

describe('str-contains? / str-starts? / str-ends?', () => {
  it('str-contains?', () => {
    assert.equal(dodo('(str-contains? "hello" "ell")'), true);
    assert.equal(dodo('(str-contains? "hello" "xyz")'), false);
  });

  it('str-starts?', () => {
    assert.equal(dodo('(str-starts? "hello" "he")'), true);
    assert.equal(dodo('(str-starts? "hello" "lo")'), false);
  });

  it('str-ends?', () => {
    assert.equal(dodo('(str-ends? "hello" "lo")'), true);
    assert.equal(dodo('(str-ends? "hello" "he")'), false);
  });
});

describe('len and empty? on strings', () => {
  it('len', () => {
    assert.equal(dodo('(len "hello")'), 5);
    assert.equal(dodo('(len "")'), 0);
  });

  it('empty?', () => {
    assert.equal(dodo('(empty? "")'), true);
    assert.equal(dodo('(empty? "x")'), false);
  });
});
