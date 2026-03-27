# Dodo Implementation Todo

## Special Forms
- [ ] Implement `do`
- [ ] Implement `let`
- [ ] Implement `and` / `or` (short-circuit)

## Pattern Matching
- [ ] Fix guard clause scoping (pattern bindings must be in scope when guard is evaluated)
- [ ] Implement `nil` pattern
- [ ] Implement list pattern destructuring (`[a b . rest]`)
- [ ] Implement map pattern destructuring (`{"x": vx}`)

## Built-ins
- [ ] Fix `+` (missing return statement)
- [ ] Arithmetic: `-`, `*`, `/`, `%`
- [ ] Comparison: `=`, `!=`, `<`, `>`, `<=`, `>=`
- [ ] Logic: `not`, `print`
- [ ] List: `head`, `tail`, `cons`, `concat`, `len`, `nth`, `empty?`, `map`, `filter`, `fold`, `flat-map`, `range`, `reverse`, `sort`, `sort-by`, `zip`, `enumerate`
- [ ] Map: `get`, `get-or`, `put`, `remove`, `keys`, `vals`, `entries`, `has?`, `merge`
- [ ] String: `str`, `str-len`, `str-slice`, `str-index`, `str-split`, `str-join`, `str-upper`, `str-lower`, `str-trim`, `str-contains?`, `str-starts?`, `str-ends?`
- [ ] Type: `type`, `number?`, `string?`, `bool?`, `list?`, `map?`, `nil?`, `fn?`, `number->string`, `string->number`
