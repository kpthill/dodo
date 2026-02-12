# Dodo Interpreter Project

## What This Is

Patrick is implementing the Dodo programming language (a small, purely
functional, Lisp-style language) as a learning exercise. The spec is in
`dodo-spec.md`.

Agents assist with:
- Workspace setup and project organization
- Spec management (versioning, clarifications, amendments)
- Advice and guidance when asked
- Possibly writing tests (TBD)

## Do Not Write Interpreter Code

**Agents must never write or modify the interpreter implementation code.**
The entire point of this project is for Patrick to learn by implementing it
himself. Agents may discuss approaches, answer questions, and point out
issues, but the code is Patrick's to write.

## Spec Versioning

The spec version follows a `major.minor.intrasession` scheme:

- **intrasession**: Bumped on each git commit where spec changes are
  accepted.
- **minor**: Bumped when wrapping up for the day (end-of-session).
- **major**: Reserved for milestones. Agents may suggest bumping major but
  should ask first. Since this is a learning project not intended for
  release, major bumps are unlikely.

Current spec version: `0.1.2`

## Formatting

Prose in markdown files is hard-wrapped at 100 columns for comfortable
reading in Emacs. Tables and code blocks are exempt.

## Git Workflow

- Commit every time changes are accepted.
- Bump the intrasession version in the spec on each commit that touches it.
- Bump the minor version at end-of-day wrap-up.
