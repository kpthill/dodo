// import process from "node:process";

export const coreEnv = {
  // arithmetic
  '+': () => arguments.reduce((a, b) => a + b, 0),
  '-': () => {
    switch (arguments.length) {
    case 1: return -(arguments[0]);
    case 2: return arguments[0] - arguments[1];
    default: throw new Error("wrong number of arguments to `-`");
    }
  };
  `*`: () => arguments.reduce((a, b) => a * b, 0),
  '/': (num, denom) => num / denom,
  '%': (div, mod) => div % mod,

  // comparison
// `=`      | `(= 1 1)` → `true`     |
// `!=`     | `(!= 1 2)` → `true`    |
// `<`      | `(< 1 2)` → `true`     |
// `>`      | `(> 2 1)` → `true`     |
// `<=`     | `(<= 1 1)` → `true`    |
// `>=`     | `(>= 2 1)` → `true`    |

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
