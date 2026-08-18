// repl-shims.js — browser stand-ins for the Node built-ins that impl/eval.js
// imports ('node:module' and bare 'path'). Wired up via the import map in
// repl.html; never loaded under Node. Agent-maintained; not part of the
// interpreter (impl/ is Patrick's code only).

// impl/eval.js calls createRequire(import.meta.url) at module load time and
// only invokes the returned require() inside the js/import evaluator, so this
// factory must succeed; the returned function throws the friendly error.
export const createRequire = () => (moduleName) => {
  throw new Error(
    "js/import is not available in the browser REPL (tried to load " +
    JSON.stringify(moduleName) + ")"
  );
};

// 'path' is imported for side effects only; resolving it to this module is
// enough — no exports required.
