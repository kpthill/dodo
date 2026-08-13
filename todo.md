# Dodo Implementation Todo

## Special Forms
- [x] Implement `do`
- [x] Implement `let`
- [x] Implement `and` / `or` (short-circuit)

## Pattern Matching
- [x] Fix guard clause scoping (pattern bindings must be in scope when guard is evaluated)
- [x] Implement `nil` pattern
- [x] Implement list pattern destructuring (`[a b . rest]`)
- [x] Implement map pattern destructuring (`{"x": vx}`)

## Built-ins
- [x] Fix `+` (missing return statement)
- [x] Arithmetic: `-`, `*`, `/`, `%`
- [x] Comparison: `=`, `!=`, `<`, `>`, `<=`, `>=`
- [x] Logic: `not`, `print`
- [x] List: `head`, `tail`, `cons`, `concat`, `len`, `nth`, `empty?`, `map`, `filter`, `fold`, `flat-map`, `range`, `reverse`, `sort`, `sort-by`, `zip`, `enumerate`
- [x] Map: `get`, `get-or`, `put`, `remove`, `keys`, `vals`, `entries`, `has?`, `merge`
- [x] String: `str`, `str-len`, `str-slice`, `str-index`, `str-split`, `str-join`, `str-upper`, `str-lower`, `str-trim`, `str-contains?`, `str-starts?`, `str-ends?`
- [x] Type: `type`, `number?`, `string?`, `bool?`, `list?`, `map?`, `nil?`, `fn?`, `number->string`, `string->number`

## Spec-Compliance Bugs (failing tests exist for each)
- [ ] `print` is a stub that throws ("use println")
- [ ] `sort` on numbers is lexicographic (`(sort [10 2 1])` → `[1 10 2]`);
      spec says natural ordering
- [ ] `head` errors when the first element is `nil` (`??` treats it as missing)
- [ ] `len` / `empty?` don't work on maps (spec says lists, strings, and maps)
- [ ] Match guards use JS truthiness instead of Dodo truthiness
      (guard result `0` should count as truthy)
- [ ] `nth` out of bounds returns `undefined` instead of erroring (spec §10)
- [ ] Type mismatch doesn't error: `(+ 1 "x")` → `"1x"` (spec §10)
- [ ] Arity mismatch doesn't error: missing args silently bind `undefined`,
      extra args silently ignored (spec §10)

## Cleanup
- [ ] Remove debug output from `dodo.js` (syntax-tree dump, `xcxc value =` prefix)
- [ ] Dedup `isTruthy` between `impl/core.js` and `impl/eval.js`
- [ ] `remove` in `impl/core.js` has an unused `def` parameter
