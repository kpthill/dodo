import {
  lit,
  tok,
  regex,
  seq,
  or,
  many,
  oneOrMore,
  opt,
  barring,
  rule,
} from './parsing.js';

// DODO GRAMMAR

// The grammar is stored in g, here. We populate g with thunks that may reference other parts of g,
// which is why we need the lazy `rule` helper to join them together.
export const g = {};

const emptyOpt = (optResult) => (optResult === []);
const reserved = [
  'def', 'defn', 'fn', 'do', 'let', 'match', 'and', 'or', 'js',
  'js/import', 'js/method', 'js/get', 'true', 'false', 'nil',
  'when', 'list', 'map'
];

g.program = rule('program', () =>
  many(g.expr),
  exprs => ({
    nType: 'program',
    exprs,
  }),
);

g.expr = rule('expr', () =>
  or(
    g.literal,
    g.identifier,
    g.special,
    g.fnCall,
    g.list,
    g.map,
  )
);

g.fnCall = rule('fnCall', () =>
  seq(lit('('), oneOrMore(g.expr), lit(')')),
  ([open, [fn, ...args], close]) => ({
    nType: 'fnCall',
    fn, args
  }),
);

g.list = rule('list', () =>
  seq(lit('['), many(g.expr), lit(']')),
  ([open, exprs, close]) => ({
    nType: 'list',
    exprs
  }),
);

g.map = rule('map', () =>
  seq(lit('{'), many(g.mapPair), lit('}')),
  ([open, entries, close]) => ({
    nType: 'map',
    entries,
  }),
);

g.mapPair = rule('mapPair', () =>
  seq(g.expr, lit(':'), g.expr)
);

g.special = rule('special', () =>
  seq(lit('('),
      or(
        g.def,
        g.defn,
        g.fn,
        g['do'],
        g['let'],
        g.match,
        g.and,
        g.or,
        g.jsImport,
        g.jsMethod,
        g.jsGet,
        g.js,
      ),
      lit(')')
     ),
  ([open, value, close]) => value,
);

g.def = rule('def', () =>
  seq(tok('def'), g.identifier, g.expr),
  ([def, name, value]) => ({
    nType: 'def',
    name, value,
  }),
);

g.defn = rule('defn', () =>
  seq(tok('defn'), g.identifier, lit('('), many(g.identifier), lit(')'), g.expr),
  ([defn, name, open, args, close, body]) => ({
    nType: 'defn',
    name, args, body,
  }),
);

g.fn = rule('fn', () =>
  seq(tok('fn'), lit('('), many(g.identifier), lit(')'), g.expr),
  ([fn, open, args, body]) => ({
    nType: 'fn',
    args, body,
  }),
);

g['do'] = rule('do', () =>
  seq(tok('do'), oneOrMore(g.expr)),
  ([doTag, exprs]) => ({
    nType: 'do',
    exprs
  }),
);

g['let'] = rule('let', () =>
  seq(tok('let'), lit('('), many(g.binding), lit(')'), g.expr),
  ([letTag, open, bindings, close, expr]) => ({
    nType: 'let',
    bindings, expr
  }),
);

g.match = rule('match', () =>
  seq(tok('match'), g.expr, many(g.branch)),
  ([match, expr, branches]) => ({
    nType: 'match',
    expr, branches
  }),
);

g.and = rule('and', () =>
  seq(tok('and'), many(g.expr)),
  ([and, exprs]) => ({
    nType: 'and',
    exprs
  }),
);

g.or = rule('or', () =>
  seq(tok('or'), many(g.expr)),
  ([or, exprs]) => ({
    nType: 'or',
    exprs
  }),
);

g.jsImport = rule('jsImport', () =>
  seq(tok('js/import'), g.string),
  ([tag, module]) => ({
    nType: 'jsImport',
    module
  }),
);

g.jsMethod = rule('jsMethod', () =>
  seq(tok('js/method'), g.expr, g.string, many(g.expr)),
  ([tag, object, methodName, args]) => ({
    nType: 'jsMethod',
    object, methodName, args
  }),
);

g.jsGet = rule('jsGet', () =>
  seq(tok('js/get'), g.expr, g.string),
  ([tag, object, key]) => ({
    nType: 'jsMethod',
    object, key
  }),
);

g.js = rule('js', () =>
  seq(tok('js'), g.string, many(g.expr)),
  ([tag, functionName, args]) => ({
    nType: 'js',
    object, functionName, args
  }),
);

g.binding = rule('binding', () =>
  seq(lit('('), g.identifier, g.expr, lit(')')),
  ([open, id, value, close]) => ({
    nType: 'binding',
    id, value
  }),
);

g.branch = rule('branch', () =>
  seq(lit('('), g.pattern, opt(seq(tok('when'), g.expr)), g.expr, lit(')')),
  ([open, pattern, maybeWhen, expr, close]) => {
    const basic = {
      nType: 'branch',
      pattern, expr,
    };
    if (emptyOpt(maybeWhen)) return basic;

    const [label, whenExpr] = maybeWhen
    return {
      ...basic,
      when: whenExpr
    }
  },
);

g.pattern = rule('pattern', () =>
  or(
    g.patternDefault,
    g.literal,
    g.identifier,
    g.listPat,
    g.mapPat,
  )
);

g.patternDefault = rule("patternDefault", () =>
  tok('_'),
  () => ({ nType: "patternDefault" })
);

g.listPat = rule('listPat', () =>
  seq(lit('['), many(g.pattern), opt(seq(lit('.'), g.identifier)), lit(']')),
  ([_1, patterns, id_pattern, _2]) => {
    if (emptyOpt(id_pattern)) return { nType: 'listPat', patterns };
    const [_, id] = id_pattern;
    return { nType: 'listPat', patterns, identifier: id };
  }
);

g.mapPat = rule('mapPat', () =>
  seq(lit('{'), many(g.mapEntry), opt(seq(lit('.'), g.identifier)), lit('}')),
  ([open, entries, id_pattern, close]) => {
    if (emptyOpt(id_pattern)) return { nType: 'mapPat', entries };
    const [_, id] = id_pattern;
    return { nType: 'mapPat', entries, identifier: id };
  },
);

g.mapEntry = rule('mapEntry', () =>
  seq(g.expr, lit(':'), g.pattern),
  ([expr, colon, pattern]) => ({nType: 'mapEntry', key: expr, value: pattern}),
);

g.literal = rule('literal', () =>
  or(
    tok('true'),
    tok('false'),
    tok('nil'),
    g.number,
    g.string,
  ),
  res => {
    if (nTypeof res === 'string') {
      switch (res) {
      case 'true': return { nType: 'bool', val: true };
      case 'false': return { nType: 'bool', val: false };
      case 'nil': return { nType: 'nil' };
      default: throw new Error('Literal value not recognized: ' + res);
      }
    }
    return res;
  }
);

g.identifier = rule('identifier', () =>
  barring(
    or(
      regex(/[a-zA-Z_?!][a-zA-Z0-9_?!>*-]*/),
      regex(/[+\-*/%<>=]+/),
    ),
    reserved
  ),
  s => ({ nType: 'identifier', name: s }),
);

g.number = rule('number', () =>
  regex(/-?[0-9]+(.[0-9]+)?/),
  numStr => ({ nType: 'number', value: Number(numStr) })
);
g.string = rule('string', () =>
  regex(/"(\\[\\\"ntr]|[^"\\])*"/),
  s => ({ nType: 'string', value: s }),
);
