import { coreEnv } from './core.js';
import { createRequire } from 'node:module';
import 'path';

const evaluators = {};

// env is a stack of maps, implemented in javascript as a list, from outermost
// to innermost. Shadowing is allowed, so to look up a name in the environment,
// we check each map in reverse order (innermost to outermost).
const getEnvValue = (name, env) => {
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

function isTruthy(val) {
  return !(val === false || val === null);
}

function makeLambda(args, body, env) {
  return (...innerArgs) => {
    const newBindings = {};
    for (var i = 0; i < args.length; i++) {
      newBindings[args[i].name] = innerArgs[i];
    }


    const functionEnv = [...env, newBindings];
    return evalDodo(body, functionEnv);
  }
}

////////////////////////////////////////////////////////////////////////////////

evaluators.program = (node, env) => node.exprs.map(expr => evalDodo(expr, env)).at(-1);

evaluators.fnCall = (node, env) => {
  const fn = evalDodo(node.fn, env);
  const evaledArgs = node.args.map(arg => evalDodo(arg, env));
  return fn.apply(null, evaledArgs);
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

evaluators.def = (node, env) => {
  env.at(-1)[node.name.name] = evalDodo(node.value, env);
  return null;
};

evaluators.defn = (node, env) => {
  // xcxc note to self - the env will include things defined in the outer
  // environment - ok?
  env.at(-1)[node.name.name] = makeLambda(node.args, node.body, env);
  return null;
};

evaluators.fn = (node, env) => {
  return makeLambda(node.args, node.body, env);
};

evaluators['do'] = (node, env) => {
  let retval = null;
  for (const expr of node.exprs) {
    retval = evalDodo(expr, env);
  }
  return retval;
};

evaluators['let'] = (node, env) => {
  const newEnv = [...env, {}];
  node.bindings.forEach(({id, value}) => {
    newEnv[-1][id.name] = evalDodo(value, newEnv);
  });
  return evalDodo(node.expr, newEnv);
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
  case "nil":
    // xcxc NOTE_TO_SELF: check on this equality operator - need it to be deep
    if (evalDodo(pattern, env) !== matchVal) return fail;
    if (node.when && !evalDodo(node.when, env)) return fail;
    return { match: true, value: evalDodo(node.expr, env) };
  case "identifier":
    const newEnv = [...env, {[pattern.name]: matchVal}];
    if (node.when && !evalDodo(node.when, newEnv)) return fail;
    return { match: true, value: evalDodo(node.expr, newEnv) };
  case "listPat":
    if (!Array.isArray(matchVal)) return fail;
    if (pattern.patterns.length !== matchVal.length) return fail;
    // NOTE_TO_SELF: use deep equality
    if (!pattern.patterns.every((elem, i) => evalDodo(elem, env) === matchVal[i])) return fail;
    return { match: true, value: evalDodo(node.expr, env) };
    // if (!pattern.every(elem => evaluators.branch(
    // if (evalDodo(pattern, env) !== matchVal) return fail;
    // TODO start here???
  case "mapPat":
  default: throw new Error("pattern type unimplemented: " + pattern.type);
  };
};

evaluators.and = (node, env) => {
  let lastVal = true;
  for (const expr of node.exprs) {
    lastVal = evalDodo(expr, env);
    if (!isTruthy(lastVal)) return lastVal;
  }
  return lastVal;
};

evaluators.or = (node, env) => {
  let lastVal = false;
  for (const expr of node.exprs) {
    lastVal = evalDodo(expr, env);
    if (isTruthy(lastVal)) return lastVal;
  }
  return lastVal;
};

evaluators.string = (node, env) => node.value;
evaluators.number = (node, env) => node.value;
evaluators.bool = (node, env) => node.value;
evaluators.nil = (node, env) => null;

evaluators.identifier = (node, env) => {
  return getEnvValue(node.name, env);
}

evaluators.js = (node, env) => {
  const fName = evalDodo(node.functionName, env);
  // this is the js eval function
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
