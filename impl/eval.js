import { coreEnv } from './core.js';
import { createRequire } from 'node:module';
import 'path';

const evaluators = {};

// env is a stack of maps, implemented in javascript as a list, from outermost
// to innermost. Shadowing is allowed, so to look up a name in the environment,
// we check each map in reverse order (innermost to outermost).
const getEnvValue = (name, env) => {
  // console.log("xcxc getting env value, name = ", name);
  for (var i = env.length - 1; i >= 0; i--) {
    if (env[i].hasOwnProperty(name)) return env[i][name];
  }
  throw new Error("Value not found in env: " + name);
}

export const evalDodo = (node, env=[coreEnv]) => {
  const fn = evaluators[node.type];
  if (!fn) {
    throw new Error("NOT IMPLEMENTED: " + node.type);
  };
  return fn(node, env);
};

function makeLambda(args, body, env) {
  return () => {
    const newBindings = {};
    for (var i = 0; i < args.length; i++) {
      newBindings[args[i].name] = arguments[i];
    }

    const functionEnv = [...env, newBindings];
    return evalDodo(body, functionEnv);
  }
}

////////////////////////////////////////////////////////////////////////////////

evaluators.program = (node, env) => node.exprs.map(expr => evalDodo(expr, env)).at(-1);

evaluators.fnCall = (node, env) => {
  const fn = evalDodo(node.fn, env);
  return fn.apply(fn, node.args.map(arg => evalDodo(arg, env)));
};

evaluators.list = (node, env) => {
  return node.exprs.map(expr => evalDodo(expr, env));
};

evaluators.map = (node, env) => {
  const res = {};
  node.entries.forEach(entry => {
    const { key, value } = entry;
    const resKey = evalDodo(key, env);
    const resValue = evalDodo(value, env);
    res[resKey] = resValue;
  });
  return res;
};

evaluators.defn = (node, env) => {
  // xcxc note to self - the env will include things defined in the outer
  // environment - ok?
  env.at(-1)[node.name.name] = makeLambda(node.args, node.body, env);
  return null;
};

evaluators.def = (node, env) => {
  env.at(-1)[node.name.name] = evalDodo(node.value, env);
  return null;
};

evaluators.match = (node, env) => {
  const matchVal = evalDodo(node.expr, env);
  for (const branch of node.branches) {
    const branchVal = evaluators.branch(branch, env, matchVal);
    if (branchVal.match) return branchVal.value;
  }

  throw new Error("No Match Found");
};

evaluators.branch = (node, env, matchVal) => {
  const fail = { match: false };
  const pattern = node.pattern;

  switch (pattern.type) {
  case "patternDefault":
    if (node.when && !evalDodo(node.when, env)) return fail;
    return { match: true, value: evalDodo(node.expr, env) };
  case "bool":
  case "number":
  case "string":
    // xcxc NOTE_TO_SELF: check on this equality operator - need it to be deep
    if (evalDodo(pattern, env) !== matchVal) return fail;
    if (node.when && !evalDodo(node.when, env)) return fail;
    return { match: true, value: evalDodo(node.expr, env) };
  case "identifier":
    return { match: true, value: evalDodo(node.expr, [env, {[pattern.name]: matchVal}]) };
  case "listPat":
  case "mapPat":
  case "nil":
  default: throw new Error("pattern type unimplemented: " + pattern.type);
  };
};

evaluators.string = (node, env) => node.value;
evaluators.number = (node, env) => node.value;
evaluators.bool = (node, env) => node.value;

evaluators.identifier = (node, env) => getEnvValue(node.name, env);

evaluators.js = (node, env) => {
  // this is the js eval function
  const fName = evalDodo(node.functionName, env);
  const fn = eval(fName);
  const args = node.args.map(arg => evalDodo(arg, env));
  return fn.apply(null, args);
};

evaluators.jsGet = (node, env) => {
  const object = eval(evalDodo(node.object, env));
  const key = evalDodo(node.key, env);
  return object[key];
};

const require = createRequire(import.meta.url);
evaluators.jsImport = (node, env) => {
  return require(evalDodo(node.module, env));
};

evaluators.jsMethod = (node, env) => {
  const object = evalDodo(node.object, env);
  const methodName = evalDodo(node.methodName, env);
  const args = node.args.map(arg => evalDodo(arg, env));
  return object[methodName].apply(object, args);
};
