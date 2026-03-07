// import process from "node:process";

export const coreEnv = {
  '+': () => {
    return arguments.reduce((a, b) => a + b, 0);
  },
  print: s => {
    throw new Error("Print is unimplemented, use println");
  },
  println: s => {
    console.log(s);
  },
  get: (map, key) => {
    return map[key] ?? null; // null represents nil
  },
  "get-or": (map, key, def) => {
    return map[key] ?? def;
  },
  put: (map, key, val) => {
    return {
      ...map,
      [key]: val,
    };
  },
  remove: (map, key, def) => {
    const { [key]: deleted, ...rest } = map;
    return map;
  },
  keys: (map) => {
    return Object.keys(map);
  },
  vals: (map) => {
    return Object.values(map);
  },
  entries: (map) => {
    return Object.entries(map);
  },
  "has?": (map, key) => {
    return map[key] !== undefined;
  },
  merge: (map1, map2) => {

  },
};

| `get`       | `(get m "key")` → value or `nil`              |                              |
| `get-or`    | `(get-or m "key" default)` → value or default |                              |
| `put`       | `(put m "key" val)` → new map                 | Returns a new map            |
| `remove`    | `(remove m "key")` → new map                  | Returns a new map            |
| `keys`      | `(keys m)` → list of keys                     |                              |
| `vals`      | `(vals m)` → list of values                   |                              |
| `entries`   | `(entries m)` → list of [key, value] lists     |                              |
| `has?`      | `(has? m "key")` → `bool`                     |                              |
| `merge`     | `(merge m1 m2)` → new map                     | m2 values overwrite m1       |
