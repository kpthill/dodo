import { g } from '../impl/grammar.js';
import { evalDodo } from '../impl/eval.js';

/** Parse and evaluate a Dodo source string, returning the result. */
export function dodo(source) {
  const parsed = g.program(source);
  if (!parsed) throw new Error(`Parse failed: ${source}`);
  return evalDodo(parsed.result);
}
