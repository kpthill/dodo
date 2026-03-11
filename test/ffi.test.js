import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dodo } from './helpers.js';

describe('js — call global functions by dot-path', () => {
  it('Math.sqrt', () => {
    assert.equal(dodo('(js "Math.sqrt" 144)'), 12);
  });

  it('Math.pow', () => {
    assert.equal(dodo('(js "Math.pow" 2 10)'), 1024);
  });

  it('Math.abs', () => {
    assert.equal(dodo('(js "Math.abs" -42)'), 42);
  });

  it('Math.max (variadic)', () => {
    assert.equal(dodo('(js "Math.max" 3 7 2 9 1)'), 9);
  });

  it('JSON.stringify', () => {
    assert.equal(dodo('(js "JSON.stringify" {"x": 1})'), '{"x":1}');
  });

  it('JSON round-trip', () => {
    assert.equal(
      dodo('(js/get (js "JSON.parse" "{\\\"name\\\":\\\"dodo\\\"}") "name")'),
      'dodo'
    );
  });
});

describe('js/get — access properties', () => {
  it('Math.PI', () => {
    assert.equal(dodo('(js/get "Math" "PI")'), Math.PI);
  });

  it('Number.MAX_SAFE_INTEGER', () => {
    assert.equal(dodo('(js/get "Number" "MAX_SAFE_INTEGER")'), Number.MAX_SAFE_INTEGER);
  });

  it('property on a local object', () => {
    assert.equal(
      dodo('(def obj (js "JSON.parse" "{\\\"a\\\":42}")) (js/get obj "a")'),
      42
    );
  });
});

describe('js/import and js/method', () => {
  it('path.extname', () => {
    assert.equal(
      dodo('(def path (js/import "path")) (js/method path "extname" "index.html")'),
      '.html'
    );
  });

  it('path.basename', () => {
    assert.equal(
      dodo('(def path (js/import "path")) (js/method path "basename" "src/eval.js")'),
      'eval.js'
    );
  });

  it('path.dirname', () => {
    assert.equal(
      dodo('(def path (js/import "path")) (js/method path "dirname" "src/eval.js")'),
      'src'
    );
  });
});
