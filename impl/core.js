// import process from "node:process";

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
    throw new Error('isEqual: object has unrecognized type "' + typeof a + '"');
  }
}

export const coreEnv = {
  // arithmetic
  '+': () => arguments.reduce((a, b) => a + b, 0),
  '-': () => {
    switch (arguments.length) {
    case 1: return -(arguments[0]);
    case 2: return arguments[0] - arguments[1];
    default: throw new Error("wrong number of arguments to `-`");
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
  not: b => !b,

  // string
  'str': (...args) => args.join(""),
  'str-len': s => s.length,
  'str-slice': (s, start, end) => s.slice(start, end),
  'str-index': (s, i) => (Number.isInteger(i) && i >=0 && i < s.length) ? s.charAt(i) : -1,
  'str-split': (s, substring) => s.split(s, substring),
  'str-join': (strings, joiner) => strings.join(joiner),
  'str-upper': s => s.toUpperCase(),
  'str-lower': s => s.toLowerCase(),
  'str-trim': s => s.trim(),
  'str-contains?': (s, substr) => s.includes(substr),
  'str-starts?': (s, start) => s.startsWith(start),
  'str-ends?': (s, end) => s.endsWith(end),

  print: s => {
    throw new Error("Print is unimplemented, use println");
  },
  println: s => {
    console.log(s);
  },

  // map operations
  get: (map, key) => map[key] ?? null, // null represents nil
  "get-or": (map, key, def) => map[key] ?? def,
  put: (map, key, val) => ({
      ...map,
      [key]: val,
  }),
  remove: (map, key, def) => {
    const { [key]: deleted, ...rest } = map;
    return map;
  },
  keys: (map) => Object.keys(map),
  vals: (map) => Object.values(map),
  entries: (map) => Object.entries(map),
  "has?": (map, key) => (map[key] !== undefined),
  merge: (map1, map2) => ({...map1, ...map2}),
};
