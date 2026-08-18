# Dodo Interpreter Project

## What This Is

Patrick is implementing the Dodo programming language (a small, purely
functional, Lisp-style language) as a learning exercise. The spec is in
`dodo-spec.md`.

Agents assist with:
- Workspace setup and project organization
- Spec management (versioning, clarifications, amendments)
- Advice and guidance when asked
- Writing and maintaining tests (in `test/`)

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

Current spec version: `0.2.8`

## Formatting

Prose in markdown files is hard-wrapped at 100 columns for comfortable
reading in Emacs. Tables and code blocks are exempt.

## Todo Tracking

Patrick's implementation todos live in `todo.md`. Agents should keep that
file up to date when new work items are identified. Do not use the Claude
Code internal task list for Patrick's todos.

## Git Workflow

- Commit every time changes are accepted.
- Bump the intrasession version in the spec on each commit that touches it.
- Bump the minor version at end-of-day wrap-up.
- Only include `Co-Authored-By: Claude` in commits where Claude actually
  authored or co-authored the changes. Patrick's own code (e.g. dodo.js)
  should be committed by Patrick without the co-author tag.

## Do Not Commit Patrick's Implementation Code

**Agents must never run `git commit` (or `git add`) on interpreter
implementation files.** This includes anything under `impl/` and any
top-level interpreter entry points (e.g. `dodo.js`). The goal is a clean git
history where Patrick's own work is committed by Patrick, and agent-authored
work (tests, spec, frontend, harness) is committed by the agent with a
`Co-Authored-By: Claude` tag.

If Patrick asks an agent to commit a file that falls in the implementation
category, the agent should decline and remind him to commit it himself.
Non-implementation files (spec, tests, REPL/frontend, AGENTS.md, todo.md)
are fine for agents to commit as usual.

## Browser REPL, Spec Viewer, and Deployment

`repl.html`, `spec.html`, and `repl-shims.js` are agent-maintained browser
front-ends. They contain no copies of the interpreter or spec:

- `repl.html` imports the interpreter live as ES modules from `impl/`. The
  Node-only imports in `impl/eval.js` (`node:module`, `path`) are redirected
  to `repl-shims.js` by an import map in the HTML; `print`/`println` are
  shadowed through the evaluator's env stack to capture output into the
  page. Browser adaptations belong in these agent-owned files — never in
  `impl/`. If a new Node-only import appears in `impl/`, add it to the
  import map and shim rather than touching Patrick's code.
- `spec.html` fetches `dodo-spec.md` at runtime and renders it client-side.

Because of the module imports and fetch, these pages do NOT work from
`file://` URLs. Preview locally with an HTTP server:

```bash
python3 -m http.server 8788   # then open http://localhost:8788/repl.html
```

### Deploying to the website

Patrick's site repo (`~/Projects/kpthill.github.io`, deployed to thill.me
via GitHub Pages) serves this repo as the `dodo/` git submodule; the pages
are live at `/dodo/repl.html` and `/dodo/spec.html`. Pushing this repo alone
changes nothing on the site — the site builds from the submodule commit
pinned in the site repo. To deploy:

```bash
git push                        # 1. push dodo main
cd ~/Projects/kpthill.github.io # 2. bump the submodule pin and push the site
git submodule update --remote dodo && git add dodo && git commit -m "bump dodo" && git push
```

Pushing the site repo's `master` is what triggers the deploy. Since the
pages load `impl/` and the spec live, the submodule bump is the only step
needed after language changes — no re-syncing of the HTML files.
