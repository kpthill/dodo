- need to address issue where many doesn't ignore whitespace (maybe just trim?)
- have claude clean up the spec:
  - remove random ";"'s from grammar?
  - or actually it looks like those are just ebnf notation - double check that?
- fix the issue with comments in the grammar

- next step - the grammar doesn't actually handle lists - they're reserved words so can't be
  identifiers, but there's no special handling O.O
