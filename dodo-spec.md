# Dodo Language Specification

**Version:** 0.2.2 (Draft)

Dodo is a small, purely functional, expression-based programming language
with Lisp-style syntax. It is designed to be implementable in a weekend as a
tree-walking interpreter in JavaScript.

---

## 1. Design Principles

- **Expression-based**: Everything is an expression that returns a value.
- **Lisp-style syntax**: S-expressions make parsing trivial.
- **Purely functional**: All bindings are immutable. Side effects happen only
  through the JS FFI.
- **No if, no loops**: Use `match` with destructuring for control flow, and
  `map`/`filter`/`fold`/recursion instead of loops.
- **Weekend-sized**: The entire language should be implementable in a couple
  of days.

---

## 2. Types

Dodo is dynamically typed. Values carry their type at runtime.

| Type     | Literal Examples               | Notes                                    |
|----------|--------------------------------|------------------------------------------|
| `int`    | `0`, `42`, `-7`                | Arbitrary-precision or JS number         |
| `float`  | `3.14`, `-0.5`, `1.0`          | Must contain a `.`                       |
| `bool`   | `true`, `false`                |                                          |
| `string` | `"hello"`, `"it's \"fine\""`   | Double-quoted, backslash escapes         |
| `list`   | `[1 2 3]`                      | Heterogeneous, immutable                 |
| `map`    | `{"a": 1, "b": 2}`             | Key-value pairs, keys can be any type    |
| `nil`    | `nil`                          | The unit/nothing value                   |
| `fn`     | `(fn (x) (+ x 1))`             | First-class functions (closures)         |

### 2.1 Type Coercion

There is no implicit type coercion. `(+ 1 "hello")` is a runtime error. Use
explicit conversion functions (`int->string`, `string->int`, etc.) when
needed.

---

## 3. Lexical Structure

### 3.1 Comments

```
; This is a line comment
```

### 3.2 Identifiers

There are two forms of identifier:

- **Word-style**: starts with a letter, `_`, `?`, or `!`; continues with letters,
  digits, `_`, `?`, `!`, `>`, `*`, `=`, or `-`. Used for names and predicates.
- **Operator-style**: one or more characters from `+`, `-`, `*`, `/`, `%`, `<`,
  `>`, `=`. Used for arithmetic and comparison operators.

```
x
my-var
empty?
do-thing!
int->string
+
<=
!=
```

### 3.3 Whitespace

Whitespace (spaces, tabs, newlines) separates tokens but is otherwise
insignificant. Commas are treated as whitespace (optional stylistic
separator).

### 3.4 Numeric Literals

- Integers: optional `-`, then one or more digits. `42`, `-7`, `0`.
- Floats: optional `-`, digits, `.`, digits. `3.14`, `-0.5`. At least one
  digit must appear on each side of the `.`.

### 3.5 String Literals

Strings are double-quoted. Supported escape sequences: `\\`, `\"`, `\n`,
`\t`, `\r`.

```
"hello world"
"line one\nline two"
"she said \"hi\""
```

---

## 4. Expressions

### 4.1 Literals

Integers, floats, booleans (`true`, `false`), strings, and `nil` are all
literal expressions that evaluate to themselves.

### 4.2 Identifiers

A bare identifier evaluates to the value bound to it in the current
environment. It is a runtime error to reference an unbound identifier.

### 4.3 List and Map Literals

```
[1 2 3]                 ; => [1, 2, 3]
[]                      ; => []

{"x": 10, "y": 20}      ; => {"x": 10, "y": 20}
{}                      ; => {}
```

All elements are evaluated. Map literals take alternating key-value pairs
separated by `:`. Commas are optional (treated as whitespace).

### 4.4 Function Calls

```
(f arg1 arg2 ...)
```

The first element is evaluated (must produce a function), then all arguments
are evaluated left-to-right, then the function is applied. All functions are
called by value.

### 4.5 Special Forms

The following are **special forms** — they have custom evaluation rules and
cannot be shadowed or redefined.

#### `def` — Top-level and Local Bindings

```
(def x 42)
(def greeting "hello")
```

Binds a name to a value in the current scope. The binding is immutable.
`def` returns `nil`.

Bindings are visible to all subsequent expressions in the same scope. `def`
may appear at the top level or inside a `do` block.

#### `defn` — Function Definition (Sugar)

```
(defn add (a b)
  (+ a b))
```

Equivalent to `(def add (fn (a b) (+ a b)))`. The function is bound in the
current scope and may refer to itself recursively by name.

#### `fn` — Anonymous Function (Lambda)

```
(fn (x) (* x x))
(fn (x y) (+ x y))
(fn () 42)
```

Creates a closure capturing the current environment. The body is a single
expression. Use `do` for multiple expressions.

#### `do` — Sequence

```
(do
  (def x 10)
  (def y 20)
  (+ x y))
```

Evaluates each expression in order in a new child scope. Returns the value
of the last expression. `def` bindings inside a `do` are visible to
subsequent expressions within the same `do`, but do not leak to the outer
scope.

#### `let` — Local Bindings (Sugar)

```
(let ((x 10)
      (y 20))
  (+ x y))
```

Equivalent to a `do` with `def` bindings followed by a body expression.
Bindings are evaluated sequentially (each binding can see the previous
ones).

```
(let ((x 10)
      (y (+ x 1)))  ; y can reference x
  (* x y))          ; => 110
```

#### `match` — Pattern Matching

The primary control flow mechanism. See **Section 5**.

#### `and` / `or` — Short-Circuit Logical Operators

```
(and expr1 expr2 ...)
(or expr1 expr2 ...)
```

`and` evaluates left-to-right, returning the first falsy value (`false` or
`nil`), or the last value if all are truthy. `or` evaluates left-to-right,
returning the first truthy value, or the last value if all are falsy.

These are special forms (not functions) because they short-circuit.

#### `js` — Foreign Function Interface

See **Section 7**.

---

## 5. Pattern Matching

`match` is the only branching construct. It replaces `if`, `cond`, and
`switch`.

### 5.1 Syntax

```
(match expr
  (pattern1 body1)
  (pattern2 body2)
  ...)
```

`expr` is evaluated once. Each pattern is tried in order. The body of the
first matching pattern is evaluated in a scope extended with any bindings
introduced by the pattern. It is a runtime error if no pattern matches.

### 5.2 Pattern Types

#### Wildcard

```
(_ body)
```

Matches any value, binds nothing.

#### Literal

```
(42 body)
(true body)
("hello" body)
(nil body)
```

Matches if the value is equal to the literal.

#### Variable Binding

```
(x body)
```

Any identifier that is not `_`, `true`, `false`, or `nil` and does not
appear as a constructor pattern. Matches any value and binds it to the name.

#### List Destructuring

```
([] body)                         ; matches empty list
([a b c] body)                    ; matches 3-element list, binds elements
([a b . rest] body)               ; matches 2+ elements; rest is the remaining list
([1 _ c] body)                    ; patterns can be nested/mixed
```

The `[...]` pattern mirrors the literal syntax. The `.` (rest) operator
captures the tail as a list.

#### Map Destructuring

```
({"x": vx, "y": vy} body)        ; matches map with at least keys "x" and "y"
({"name": name . rest} body)      ; binds matching key and rest of map
```

Map patterns match if the map contains *at least* the specified keys.
Additional keys are ignored unless captured with `. rest`.

#### Nested Patterns

Patterns can be arbitrarily nested:

```
(match point
  ([[0 0]] "origin")
  ([[x 0]] "on x-axis")
  ([[0 y]] "on y-axis")
  ([[x y]] (format "({}, {})" x y)))
```

#### Guard Clauses

A pattern may include a `when` guard:

```
(match n
  (x when (> x 0) "positive")
  (x when (< x 0) "negative")
  (_ "zero"))
```

The guard expression is evaluated after a successful structural match, with
the pattern's bindings in scope. If the guard returns falsy, matching
continues to the next branch.

### 5.3 Exhaustiveness

There is no compile-time exhaustiveness check. A runtime error is raised if
no pattern matches. Using a wildcard `_` or variable pattern as the final
branch ensures a match.

---

## 6. Built-in Functions

### 6.1 Arithmetic

All arithmetic operators work on both ints and floats. Mixing int and float
promotes the result to float.

| Function    | Example            | Notes                         |
|-------------|--------------------|-------------------------------|
| `+`         | `(+ 1 2)` → `3`   | Also: variadic `(+ 1 2 3)`   |
| `-`         | `(- 5 3)` → `2`   | Unary: `(- x)` negates       |
| `*`         | `(* 2 3)` → `6`   | Variadic                      |
| `/`         | `(/ 10 3)` → `3`  | Integer division for ints     |
| `%`         | `(% 10 3)` → `1`  | Modulo                        |

### 6.2 Comparison

All comparisons return `bool`. `=` works on any type (structural equality
for lists/maps). The ordering operators (`<`, `>`, `<=`, `>=`) work on
numbers and strings (lexicographic).

| Function | Example                 |
|----------|-------------------------|
| `=`      | `(= 1 1)` → `true`     |
| `!=`     | `(!= 1 2)` → `true`    |
| `<`      | `(< 1 2)` → `true`     |
| `>`      | `(> 2 1)` → `true`     |
| `<=`     | `(<= 1 1)` → `true`    |
| `>=`     | `(>= 2 1)` → `true`    |

### 6.3 Logical

| Function | Example                      | Notes                                  |
|----------|------------------------------|----------------------------------------|
| `not`    | `(not true)` → `false`       | Function (not short-circuit)           |
| `and`    | `(and true false)` → `false` | Special form, short-circuits           |
| `or`     | `(or false 42)` → `42`      | Special form, short-circuits           |

### 6.4 String Operations

| Function        | Example                                    | Notes                          |
|-----------------|--------------------------------------------|--------------------------------|
| `str`           | `(str "hi" " " "there")` → `"hi there"`   | Concatenation; coerces args to strings |
| `str-len`       | `(str-len "hello")` → `5`                  |                                |
| `str-slice`     | `(str-slice "hello" 1 3)` → `"el"`         | Start (inclusive), end (exclusive) |
| `str-index`     | `(str-index "hello" "ll")` → `2`           | Returns -1 if not found        |
| `str-split`     | `(str-split "a,b,c" ",")` → `["a","b","c"]`| Returns a list                 |
| `str-join`      | `(str-join ["a" "b"] ",")` → `"a,b"`       |                                |
| `str-upper`     | `(str-upper "hi")` → `"HI"`                |                                |
| `str-lower`     | `(str-lower "HI")` → `"hi"`                |                                |
| `str-trim`      | `(str-trim "  hi  ")` → `"hi"`             |                                |
| `str-contains?` | `(str-contains? "hello" "ell")` → `true`   |                                |
| `str-starts?`   | `(str-starts? "hello" "he")` → `true`      |                                |
| `str-ends?`     | `(str-ends? "hello" "lo")` → `true`        |                                |

### 6.5 List Operations

| Function  | Example                                          | Notes                          |
|-----------|--------------------------------------------------|--------------------------------|
| `head`    | `(head [1 2 3])` → `1`                          | Error on empty list            |
| `tail`    | `(tail [1 2 3])` → `[2, 3]`                     | Error on empty list            |
| `cons`    | `(cons 0 [1 2])` → `[0, 1, 2]`                  | Prepend                        |
| `concat`  | `(concat [1 2] [3 4])` → `[1,2,3,4]`            | List concatenation             |
| `len`     | `(len [1 2 3])` → `3`                            | Also works on strings and maps |
| `nth`     | `(nth [10 20 30] 1)` → `20`                      | Zero-indexed                   |
| `empty?`  | `(empty? [])` → `true`                           | Also works on strings and maps |
| `map`     | `(map (fn (x) (* x 2)) [1 2 3])` → `[2,4,6]`   | Returns new list               |
| `filter`  | `(filter (fn (x) (> x 2)) [1 2 3 4])` → `[3,4]` |                               |
| `fold`    | `(fold (fn (acc x) (+ acc x)) 0 [1 2 3])` → `6` | Left fold                     |
| `flat-map`| `(flat-map (fn (x) [x x]) [1 2])` → `[1,1,2,2]` |                               |
| `range`   | `(range 0 5)` → `[0, 1, 2, 3, 4]`               | Start (inclusive), end (exclusive) |
| `reverse` | `(reverse [1 2 3])` → `[3, 2, 1]`               |                                |
| `sort`    | `(sort [3 1 2])` → `[1, 2, 3]`                  | Natural ordering               |
| `sort-by` | `(sort-by (fn (x) (nth x 1)) data)` | Sort by key function |
| `zip`     | `(zip [1 2] ["a" "b"])` → `[[1,"a"],[2,"b"]]`   |                                |
| `enumerate`| `(enumerate ["a" "b"])` → `[[0,"a"],[1,"b"]]`  |                                |

### 6.6 Map Operations

| Function    | Example                                       | Notes                        |
|-------------|-----------------------------------------------|------------------------------|
| `get`       | `(get m "key")` → value or `nil`              |                              |
| `get-or`    | `(get-or m "key" default)` → value or default |                              |
| `put`       | `(put m "key" val)` → new map                 | Returns a new map            |
| `remove`    | `(remove m "key")` → new map                  | Returns a new map            |
| `keys`      | `(keys m)` → list of keys                     |                              |
| `vals`      | `(vals m)` → list of values                   |                              |
| `entries`   | `(entries m)` → list of [key, value] lists     |                              |
| `has?`      | `(has? m "key")` → `bool`                     |                              |
| `merge`     | `(merge m1 m2)` → new map                     | m2 values overwrite m1       |

### 6.7 Type Checking and Conversion

| Function       | Example                        | Notes                              |
|----------------|--------------------------------|------------------------------------|
| `type`         | `(type 42)` → `"int"`         | Returns type as a string           |
| `int?`         | `(int? 42)` → `true`          |                                    |
| `float?`       | `(float? 3.14)` → `true`      |                                    |
| `string?`      | `(string? "hi")` → `true`     |                                    |
| `bool?`        | `(bool? true)` → `true`       |                                    |
| `list?`        | `(list? [1])` → `true`        |                                    |
| `map?`         | `(map? {})` → `true`          |                                    |
| `nil?`         | `(nil? nil)` → `true`         |                                    |
| `fn?`          | `(fn? +)` → `true`            |                                    |
| `int->float`   | `(int->float 3)` → `3.0`      |                                    |
| `float->int`   | `(float->int 3.7)` → `3`      | Truncates toward zero              |
| `int->string`  | `(int->string 42)` → `"42"`   |                                    |
| `string->int`  | `(string->int "42")` → `42`   | Error if not parseable             |
| `float->string`| `(float->string 3.14)` → `"3.14"` |                                |
| `string->float`| `(string->float "3.14")` → `3.14` |                                |

### 6.8 I/O (Via FFI Convenience Wrappers)

These are thin wrappers around JS I/O, included as built-ins for
convenience:

| Function  | Example                    | Notes                      |
|-----------|----------------------------|----------------------------|
| `print`   | `(print "hello")`          | Prints to stdout, returns nil |
| `println` | `(println "hello")`        | Prints with newline        |

---

## 7. JavaScript FFI

The `js` special form allows calling into JavaScript from Dodo. This is the
only mechanism for side effects.

### 7.1 Calling JS Functions

```
(js "Math.sqrt" 144)             ; => 12.0
(js "console.log" "hello")      ; => nil (side effect: prints)
(js "JSON.stringify" {"a": 1})   ; => "{\"a\":1}"
```

Syntax: `(js <string-path> arg1 arg2 ...)`

The first argument is a string naming a JS function accessible from the
global scope (or via dot-path traversal). The remaining arguments are
evaluated and passed to the function. Dodo values are converted to JS values
at the boundary:

| Dodo           | JS                   |
|----------------|----------------------|
| `int`, `float` | `number`             |
| `bool`         | `boolean`            |
| `string`       | `string`             |
| `nil`          | `null`               |
| `list`         | `Array`              |
| `map`          | plain `Object`/`Map` |
| `fn`           | `Function` (wrapped) |

The return value is converted back from JS to Dodo using the inverse
mapping. `undefined` maps to `nil`. JS objects with non-string keys become
Dodo maps.

### 7.2 Importing Modules

```
(def fs (js/import "fs"))
(def data (js/method fs "readFileSync" "data.txt" "utf8"))
```

- `(js/import <string>)` — calls `require()` with the given module name.
  Returns the module object as a Dodo map.
- `(js/method <object> <method-name> args...)` — calls a method on a JS
  object.

### 7.3 Accessing Properties

```
(def pi (js/get "Math" "PI"))       ; => 3.141592653589793
(def obj (js "JSON.parse" "{\"a\": 1}"))
(def a (js/get obj "a"))            ; => 1
```

- `(js/get <object-or-string> <property-name>)` — accesses a property. If
  the first argument is a string, it is treated as a global path.

### 7.4 Wrapping JS Libraries

The idiomatic way to use a JS library is to write thin Dodo wrappers:

```
(def fs (js/import "fs"))

(defn read-file (path)
  (js/method fs "readFileSync" path "utf8"))

(defn write-file (path content)
  (js/method fs "writeFileSync" path content))

; Now use the wrappers naturally:
(def data (read-file "input.txt"))
(write-file "output.txt" (str-upper data))
```

---

## 8. Program Structure

A Dodo program is a sequence of top-level expressions. They are evaluated in
order. The program's result is the value of the last expression.

```
; fibonacci.dodo

(defn fib (n)
  (match n
    (0 0)
    (1 1)
    (n (+ (fib (- n 1)) (fib (- n 2))))))

(println (str "fib(10) = " (int->string (fib 10))))
```

### 8.1 File Extension

`.dodo` (suggested)

### 8.2 Entry Point

The interpreter evaluates all top-level expressions in the file
sequentially. There is no `main` function.

---

## 9. Scoping Rules

Dodo uses **lexical scoping**. Closures capture their definition
environment.

```
(defn make-adder (n)
  (fn (x) (+ x n)))

(def add5 (make-adder 5))
(add5 10)  ; => 15
```

Inner `def` bindings shadow outer ones within their scope. There is no
mutation — a name always refers to the same value within its scope.

---

## 10. Error Handling

Errors are runtime exceptions. There is no `try/catch` in the language
itself.

The following conditions produce runtime errors:
- Unbound identifier
- Type mismatch (e.g., `(+ 1 "x")`)
- Arity mismatch (wrong number of arguments)
- Non-exhaustive match (no pattern matches)
- Index out of bounds (`nth`, `str-slice`)
- Division by zero
- FFI errors (JS exceptions are re-raised as Dodo errors)

**Design note:** For a v0.2, you might add a
`(try expr (catch e handler))` form, but it's fine to skip for a weekend
project. Errors simply crash with a stack trace.

---

## 11. Complete Example

```
; A tiny program that processes a list of people

(def people
  [{"name": "Alice", "age": 30}
   {"name": "Bob",   "age": 17}
   {"name": "Charlie", "age": 25}
   {"name": "Diana", "age": 15}])

; Filter adults (no if — use match!)
(defn adult? (person)
  (match (>= (get person "age") 18)
    (true true)
    (false false)))

; Format a greeting
(defn greet (person)
  (str "Hello, " (get person "name") "!"))

; Process
(def adults (filter adult? people))
(def greetings (map greet adults))

; Print each greeting
(defn print-all (items)
  (match items
    ([] nil)
    ([first . rest]
      (do
        (println first)
        (print-all rest)))))

(print-all greetings)
; Output:
; Hello, Alice!
; Hello, Charlie!
```

A second example demonstrating map and list destructuring, guard clauses,
and accumulator-style recursion:

```
; Classify shapes by size using pattern matching

; Map destructuring: match a specific key value, bind the rest
(defn area (shape)
  (match shape
    ({"kind": "circle",   "radius": r}             (* 3.14159 r r))
    ({"kind": "rect",     "width": w, "height": h} (* w h))
    ({"kind": "triangle", "base": b,  "height": h} (/ (* b h) 2))))

; Guard clause: branch on a computed property of the matched value
(defn label (shape)
  (match shape
    (s when (> (area s) 100) (str "large " (get s "kind")))
    ({"kind": kind}          kind)))

; Head/tail list destructuring with a guard on the head element;
; accumulates into two lists passed as extra arguments
(defn split-by-size (shapes)
  (let ((go (fn (remaining small large)
               (match remaining
                 ([]                                [small large])
                 ([s . rest] when (> (area s) 100) (go rest small (cons s large)))
                 ([s . rest]                        (go rest (cons s small) large))))))
    (go shapes [] [])))

(def shapes
  [{"kind": "circle",   "radius": 3}
   {"kind": "rect",     "width": 12, "height": 10}
   {"kind": "triangle", "base": 6,   "height": 4}
   {"kind": "circle",   "radius": 7}])

; Destructure the [small large] pair returned by split-by-size
(match (split-by-size shapes)
  ([small large]
    (do
      (println "small:")
      (fold (fn (_ s) (println (str "  " (label s)))) nil small)
      (println "large:")
      (fold (fn (_ s) (println (str "  " (label s)))) nil large))))
; Output:
; small:
;   triangle
;   circle
; large:
;   large circle
;   large rect
```

---

## 12. Grammar (EBNF)

```
program     = expr* ;

comment     = ';' [^\n]* ;

expr        = literal
            | identifier
            | '[' expr* ']'
            | '{' map-pair* '}'
            | '(' special ')'
            | '(' expr expr* ')' ;

map-pair    = expr ':' expr ;

special     = 'def' identifier expr
            | 'defn' identifier '(' identifier* ')' expr
            | 'fn' '(' identifier* ')' expr
            | 'do' expr+
            | 'let' '(' binding* ')' expr
            | 'match' expr branch+
            | 'and' expr+
            | 'or' expr+
            | 'js' string expr*
            | 'js/import' string
            | 'js/method' expr string expr*
            | 'js/get' expr string ;

binding     = '(' identifier expr ')' ;

branch      = '(' pattern ('when' expr)? expr ')' ;

pattern     = '_'
            | literal
            | identifier
            | '[' list-pat* ('.' identifier)? ']'
            | '{' map-pat-entry* ('.' identifier)? '}' ;

list-pat    = pattern ;

map-pat-entry = expr ':' pattern ;

literal     = integer | float | string | 'true' | 'false' | 'nil' ;

identifier  = [a-zA-Z_?!][a-zA-Z0-9_?!>*=\-]*
            | [+\-*/%<>=][+\-*/%<>=]* ;
              (* except reserved words: def, defn, fn, do, let,
                 match, and, or, js, js/import, js/method, js/get,
                 true, false, nil, when *)

integer     = '-'? [0-9]+ ;
float       = '-'? [0-9]+ '.' [0-9]+ ;
string      = '"' (escape | [^"\\])* '"' ;
escape      = '\\' [\\\"ntr] ;
comment     = ';' [^\n]* ;
```

---

## 13. Implementation Notes

This section is non-normative — suggestions for the JS interpreter.

### 13.1 Architecture

A tree-walking interpreter with three phases:

1. **Tokenizer** — Split input into tokens (parens, strings, numbers,
   identifiers).
2. **Parser** — Build an AST from the token stream. Since the syntax is
   S-expressions, this is essentially just matching balanced parens and
   classifying the head of each list.
3. **Evaluator** — Recursively walk the AST, maintaining an environment
   (scope chain) as a linked list of Maps.

### 13.2 Environment

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

### 13.3 Match Implementation

Pattern matching can be implemented as a recursive
`matchPattern(pattern, value)` function that returns either `null` (no
match) or a `Map<string, value>` of bindings. The evaluator tries each
branch and uses the first successful match.

### 13.4 FFI Implementation

The `js` form can use JavaScript's bracket notation for path traversal:

```javascript
function resolveJsPath(path) {
  return path.split('.').reduce((obj, key) => obj[key], globalThis);
}
```

### 13.5 Tail Call Optimization (Stretch Goal)

If you want to support deep recursion without stack overflow, implement TCO
for:
- The last expression in a `do` block
- The body of a matched `match` branch
- The body of a `fn`

This can be done with a trampoline: instead of recursing, return a thunk,
and loop at the top level until you get a non-thunk value.

---

## Appendix A: Reserved Words

```
def  defn  fn  do  let  match  when  and  or
js  js/import  js/method  js/get
true  false  nil
```

## Appendix B: Operator Precedence

Not applicable — Dodo has no infix operators. All operations use prefix
notation with explicit parentheses.
