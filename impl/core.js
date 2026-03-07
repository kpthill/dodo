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
    return {...map1, ...map2};
  },
};
