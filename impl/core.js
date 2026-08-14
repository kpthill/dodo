import { isTruthy, isHash, errorOut } from './shared.js';

// from <https://stackoverflow.com/questions/65787971/ways-to-determine-if-something-is-a-plain-object-in-javascript#:~:text=Comments,-Add%20a%20comment&text=ToolJS%20has%20a%20method%20under,infact%20a%20plain%20object%20literal.&text=Under%20the%20hood%2C%20the%20method,if%20its%20a%20plain%20object.>
const isPlainObject = value => value?.constructor === Object;

function isEqual(a, b) {
  switch(typeof a) {
  case 'number':
  case 'string':
  // functions have pointer-equality semantics - distinct functions with the
  // same definition will be treated as different.
  case 'function':
    return a === b;
  case 'boolean':
    // no "truthy" / "falsy" values - require b is a bool
    return (a === true && b === true) || (a === false && b === false);
  case 'object':
    // can be hashes, lists, or nil
    // note that this recursion will overflow on objects with cycles - ignoring for now
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every((aElem, i) => isEqual(aElem, b[i]));
    } else if (a === null && b === null) {
      return true;
    } else if (isPlainObject(a) && isPlainObject(b)) {
      return (
        Object.keys(a).length === Object.keys(b).length &&
          Object.keys(a).every(k =>
            Object.hasOwn(b, k) && isEqual(a[k], b[k])
          )
      );
    }
    // they are objects of different types
    return false;
  default:
    errorOut('isEqual: object has unrecognized type "' + typeof a + '"');
  }
}

const typeMap = {
  'boolean': 'bool',
  'number': 'number',
  'string': 'string',
  'function': 'fn',
};

export const coreEnv = {
  // arithmetic
  '+': (...args) => args.reduce((a, b) => a + b, 0),
  '-': (...args) => {
    switch (args.length) {
    case 1: return -(args[0]);
    case 2: return args[0] - args[1];
    default: errorOut("wrong number of arguments to `-`: " + args.length);
    }
  },
  '*': (...args) => args.reduce((a, b) => a * b, 1),
  '/': (num, denom) => num / denom,
  '%': (div, mod) => div % mod,

  // comparison
  '=': isEqual,
  '!=': (a, b) => !isEqual(a, b),
  '<': (a, b) => a < b,
  '>': (a, b) => a > b,
  '<=': (a, b) => a <= b,
  '>=':  (a, b) => a >= b,

  // logical (`and` and `or` are special forms)
  not: b => !isTruthy(b),

  // string operations
  'str': (...args) => args.map(x => x ?? 'nil').join(""),
  // len under list operations
  // empty? under list operations
  'str-slice': (s, start, end) => s.slice(start, end),
  'str-index': (s, substring) => s.indexOf(substring),
  'str-split': (s, substring) => s.split(substring),
  'str-join': (strings, joiner) => strings.join(joiner),
  'str-upper': s => s.toUpperCase(),
  'str-lower': s => s.toLowerCase(),
  'str-trim': s => s.trim(),
  'str-contains?': (s, substr) => s.includes(substr),
  'str-starts?': (s, start) => s.startsWith(start),
  'str-ends?': (s, end) => s.endsWith(end),

  // // list operations
  'head': l => l.length > 0 ? l[0] : errorOut("head called on empty list"),
  'tail': l => l.length > 0 ? l.slice(1) : errorOut("tail called on empty list"),
  'cons': (a, l) => [a, ...l],
  'concat': (l1, l2) => [...l1, ...l2],
  'len': l => {
    if (typeof l === "string") return l.length;
    if (Array.isArray(l)) return l.length;
    if (isHash(l)) return Object.keys(l).length;
    errorOut("len called on object that is not a string, list, or map");
  },
  'nth': (l, n) => l.length > n ? l[n] : errorOut("nth called on list of length <= n"),
  'empty?': l => coreEnv.len(l) === 0,
  'map': (f, l) => l.map(f),
  'filter': (f, l) => l.filter(elem => isTruthy(f(elem))),
  'fold': (f, init, l) => l.reduce(f, init),
  'flat-map': (f, l) => l.flatMap(f),
  'range': (s, e) => Array.from({length: e - s}, (_, i) => s + i),
  'reverse': l => l.toReversed(),
  'sort': l => l.toSorted((x,y) => (x < y ? -1 : x === y ? 0 : 1)),
  'sort-by': (f, l) => l.toSorted((x, y) => (f(x) <= f(y) ? -1 : 1)),
  'zip': (l1, l2) => l1.length === l2.length ? l1.map((e, i) => [e, l2[i]]) : errorOut("Lists to be zipped must have equal length"),
  'enumerate': l => l.map((e, i) => [i, e]),

  // map operations
  get: (map, key) => map[key] ?? null, // null represents nil
  "get-or": (map, key, def) => map[key] ?? def,
  put: (map, key, val) => ({
      ...map,
      [key]: val,
  }),
  remove: (map, key) => {
    const { [key]: deleted, ...rest } = map;
    return rest;
  },
  keys: (map) => Object.keys(map),
  vals: (map) => Object.values(map),
  entries: (map) => Object.entries(map),
  "has?": (map, key) => (map[key] !== undefined),
  merge: (map1, map2) => ({...map1, ...map2}),

  // Type Checking and Conversion
  'type': x => typeof x === 'object' ?
    (x === null ? "nil" : (Array.isArray(x) ? "list" : "map"))
    : typeMap[typeof x],
  'number?': x => typeof x === "number",
  'string?': x => typeof x === "string",
  'bool?': x => typeof x === "boolean",
  'list?': x => Array.isArray(x),
  'map?': x => x !== null && typeof x === 'object' && !Array.isArray(x),
  'nil?': x => x === null,
  'fn?': x => typeof x === "function",
  'number->string': n => n.toString(),
  'string->number': n => {
    const res = Number(n);
    if (isNaN(res)) errorOut(n + " is not a number");
    return res;
  },

  // I/O
  print: _s => {
    errorOut("Print is unimplemented, use println");
  },
  println: s => {
    console.log(s);
  },
};
