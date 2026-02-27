const evaluators = {};

// env is a stack of maps, implemented in javascript as a list, from outermost
// to innermost. Shadowing is allowed, so to look up a name in the environment,
// we check each map in reverse order (innermost to outermost).
const getEnvValue = (name, env) => {
  for (var i = env.length - 1; i >= 0; i++) {
    if (env[i].hasOwn(name)) return env[i][name];
  }
  throw new Error("Value not found in env: " + name);
}

export const evalDodo = (node, env=[{}]) => {
  const fn = evaluators[node.nType];
  if (!fn) {
    throw new Error("NOT IMPLEMENTED: " + node.nType);
  };
  return fn(node, env);
};

evaluators.program = (node, env) => node.exprs.map(expr => evalDodo(expr, env)).at(-1);

function makeLambda(args, body, env) {
  return () => {
    const newBindings = {};
    for (var i = 0; i < args.length; i++) {
      newBindings[args[i].name] = arguments[i];
    }
    functionEnv = [...env, newBindings];
    return evalDodo(body, functionEnv);
  }
}

evaluators.defn = (node, env) => {
  // xcxc note to self - the env will include things defined in the outer
  // environment - ok?
  env.at(-1)[node.name] = makeLambda(node.args, node.body, node.env);
  return null;
};

evaluators.def = (node, env) => {
  env.at(-1)[node.name] = evalDodo(node.value, env);
  return null;
};
