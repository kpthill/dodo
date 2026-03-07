# Dodo

A small, purely functional, Lisp-style programming language implemented as a tree-walking
interpreter in JavaScript. Built as a learning exercise.

## Running

```
node dodo.js < program.dodo
```

Requires Node.js. See `examples/` for sample programs.

## Language

Dodo is expression-based and dynamically typed. Everything returns a value. There is no
mutation — all bindings are immutable — and no implicit type coercion.

### Types

| Type     | Examples                          |
|----------|-----------------------------------|
| `number` | `42`, `-7`, `3.14`                |
| `bool`   | `true`, `false`                   |
| `string` | `"hello"`, `"line\none"`          |
| `list`   | `[1 2 3]`, `[]`                   |
| `map`    | `{"x": 1, "y": 2}`, `{}`         |
| `nil`    | `nil`                             |
| `fn`     | `(fn (x) (* x x))`               |

Numbers are IEEE 754 doubles (same as JavaScript). Only `false` and `nil` are falsy.

### Syntax

S-expressions with a few extensions. Commas are whitespace.

```
(def x 42)
(defn square (n) (* n n))
(square 5)   ; => 25
```

Lists use `[...]`, maps use `{key: value, ...}`:

```
(def nums [1 2 3 4 5])
(def person {"name": "Alice", "age": 30})
```

### Functions

```
; Anonymous
(fn (x y) (+ x y))

; Named (sugar for def + fn)
(defn add (x y) (+ x y))

; Closures
(defn make-adder (n)
  (fn (x) (+ x n)))

(def add5 (make-adder 5))
(add5 10)   ; => 15
```

### Pattern Matching

`match` is the only branching construct — no `if`.

```
(defn describe (n)
  (match n
    (0 "zero")
    (x when (> x 0) "positive")
    (_ "negative")))
```

List destructuring:

```
(defn sum (lst)
  (match lst
    ([]         0)
    ([x . rest] (+ x (sum rest)))))
```

Map destructuring:

```
(defn greet (person)
  (match person
    ({"name": name, "age": age}
      (str "Hello " name ", you are " (number->string age)))))
```

### Sequencing and Binding

```
; do: evaluate a sequence, return last value
(do
  (def x 10)
  (def y 20)
  (+ x y))   ; => 30

; let: local bindings (sequential — each can reference the previous)
(let ((x 10)
      (y (+ x 1)))
  (* x y))   ; => 110
```

### JavaScript FFI

The only way to perform side effects is through the JS interop forms:

```
; Call a global JS function
(js "Math.sqrt" 144)            ; => 12

; Access a property
(js/get "Math" "PI")            ; => 3.141592653589793

; Import a Node module and call methods
(def path (js/import "path"))
(js/method path "join" "src" "index.js")   ; => "src/index.js"
```

### Notable Features

**No `if`** — use `match` with literal or guard patterns instead.

**No loops** — use `map`, `filter`, `fold`, and recursion.

**Operator identifiers** — `+`, `<=`, `!=` etc. are regular built-in functions, not
syntax. They can be passed as values: `(fold + 0 [1 2 3])`.

**Short-circuit `and`/`or`** — these are special forms and return the deciding value, not
just a boolean: `(or nil 42)` => `42`.

---

## Implementation

The interpreter is a single-pass, tree-walking design written in vanilla Node.js with no
dependencies.

### Architecture

```
source text
    │
    ▼
 grammar.js   — parser combinators define the full grammar
    │
    ▼
  AST (plain JS objects with a `type` field)
    │
    ▼
  eval.js     — dispatch table maps node types to evaluator functions
    │
    ▼
  value (native JS value)
```

### Parser

Rather than a separate lexer and parser, the whole thing is a **single-pass parser
combinator**. `parsing.js` provides primitives (`lit`, `tok`, `regex`, `seq`, `or`,
`many`, `opt`, …) that `grammar.js` composes into the full language grammar. Rules are
wrapped in thunks to allow forward references and recursive definitions.

Whitespace and comments (`;` to end of line) are stripped inside the `seq` combinator, so
they don't appear explicitly in the grammar rules.

### Evaluator

`eval.js` is a dispatch table (`evaluators[node.type]`) over AST node types. The
environment is a stack of plain JS objects; variable lookup walks the stack from innermost
to outermost scope. `def` mutates the innermost frame — a deliberate pragmatic choice that
makes top-level sequencing work naturally.

### Values

Dodo values are represented as native JS values — no wrapper objects. The mapping is
straightforward (`number` → JS number, `list` → Array, `map` → JS Map, `nil` → `null`,
etc.). One consequence: truthiness checks must use an explicit `isTruthy` helper rather
than relying on JS's native truthiness, since `0` and `""` are truthy in Dodo.

### FFI

The `js` special form resolves dot-paths against `globalThis` and calls into JS directly.
This makes interop seamless but means Dodo programs have full access to the Node.js
environment.

---

## Status

Work in progress. Parsing is complete. The evaluator handles basic expressions, `def`,
`defn`, `fn`, `match` (literal and variable patterns), and the FFI forms. Still to come:
`do`, `let`, `and`/`or`, list/map pattern destructuring, and most of the built-in function
library.
