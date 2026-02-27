# Dodo Interpreter — Implementation Notes

Non-normative notes and suggestions for the JavaScript implementation.

---

## Architecture

A tree-walking interpreter with three phases:

1. **Tokenizer** — Split input into tokens (parens, strings, numbers,
   identifiers).
2. **Parser** — Build an AST from the token stream. Since the syntax is
   S-expressions, this is essentially just matching balanced parens and
   classifying the head of each list.
3. **Evaluator** — Recursively walk the AST, maintaining an environment
   (scope chain) as a linked list of Maps.

---

## Environment

```javascript
class Env {
  constructor(parent = null) {
    this.bindings = new Map();
    this.parent = parent;
  }
  get(name) {
    if (this.bindings.has(name)) return this.bindings.get(name);
    if (this.parent) return this.parent.get(name);
    throw new Error(`Unbound identifier: ${name}`);
  }
  set(name, value) {
    this.bindings.set(name, value);
  }
}
```

---

## AST Node Representation

The idiomatic JavaScript approach for AST nodes is plain objects with a
`type` discriminant field, rather than a class hierarchy:

```javascript
{ type: "Literal",     value: 42 }
{ type: "Identifier",  name: "foo" }
{ type: "Call",        callee: <node>, args: [<node>, ...] }
{ type: "Def",         name: "x", value: <node> }
```

This is what all major JS AST tooling (Babel, Acorn, ESTree) uses. The
evaluator is then a `switch (node.type)` dispatch. No class hierarchy
needed since evaluation logic lives in the evaluator, not on the nodes.
Factory functions per node type are a useful middle ground if you want
validation or default fields without full classes.

---

## Value Representation

Using native JS values directly (rather than tagged wrapper objects) keeps
the implementation simple. The mapping is:

| Dodo       | JS representation         |
|------------|---------------------------|
| `number`   | `number`                  |
| `bool`     | `boolean`                 |
| `string`   | `string`                  |
| `nil`      | `null`                    |
| `list`     | `Array`                   |
| `map`      | `Map`                     |
| `fn`       | `Function`                |

A few gotchas with this approach:

**Falsy value mismatch.** In Dodo only `false` and `nil` are falsy; `0`,
`""`, and `[]` are truthy. In JS, all of those are falsy. Never use a raw
`if (value)` check — write a dedicated `isTruthy(value)` helper and use it
everywhere:

```javascript
function isTruthy(v) { return v !== false && v !== null; }
```

**`typeof null === "object"`.** If Dodo `nil` is JS `null`, you need to
special-case it in type dispatch before any object checks.

**`fn?` and FFI functions.** A native JS function passed back over the FFI
boundary looks identical to a Dodo closure. If you want `fn?` to
distinguish them, mark Dodo closures with a property:

```javascript
const closure = function(...) { ... };
closure.isDodoClosure = true;
```

**Structural equality.** `=` requires deep equality for lists and maps —
JS `===` gives reference equality for objects. A custom `dodoEqual`
function is needed regardless of value representation.

**Map keys.** Using JS `Map` (rather than plain objects) for Dodo maps
avoids prototype pollution issues with keys like `"constructor"` or
`"toString"`.

---

## Match Implementation

Pattern matching can be implemented as a recursive
`matchPattern(pattern, value)` function that returns either `null` (no
match) or a `Map<string, value>` of bindings. The evaluator tries each
branch and uses the first successful match.

---

## FFI Implementation

The `js` form can use JavaScript's bracket notation for path traversal:

```javascript
function resolveJsPath(path) {
  return path.split('.').reduce((obj, key) => obj[key], globalThis);
}
```

---

## Tail Call Optimization (Stretch Goal)

If you want to support deep recursion without stack overflow, implement TCO
for:
- The last expression in a `do` block
- The body of a matched `match` branch
- The body of a `fn`

This can be done with a trampoline: instead of recursing, return a thunk,
and loop at the top level until you get a non-thunk value.
