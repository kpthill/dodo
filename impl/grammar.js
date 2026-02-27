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

export const g = {};

const reserved = [
  'def', 'defn', 'fn', 'do', 'let', 'match', 'and', 'or', 'js',
  'js/import', 'js/method', 'js/get', 'true', 'false', 'nil',
  'when', 'list', 'map'
];

g.program = rule('program', () =>
  many(g.expr)
);

g.expr = rule('expr', () =>
  or(
    g.literal,
    g.identifier,
    seq(lit('('), g.special, lit(')')),
    seq(lit('('), oneOrMore(g.expr), lit(')')),
    seq(lit('['), many(g.expr), lit(']')),
    seq(lit('{'), many(g.mapPair), lit('}')),
  )
);

g.mapPair = rule('mapPair', () =>
  seq(g.expr, lit(':'), g.expr)
);

g.special = rule('special', () =>
  or(
    // note ordering - defn has to go before def because it's an extension of it
    seq(tok('defn'), g.identifier, lit('('), many(g.identifier), lit(')'), g.expr),
    seq(tok('def'), g.identifier, g.expr),
    seq(tok('fn'), lit('('), many(g.identifier), lit(')'), g.expr),
    seq(tok('do'), oneOrMore(g.expr)),
    seq(tok('let'), lit('('), many(g.binding), lit(')'), g.expr),
    seq(tok('match'), g.expr, many(g.branch)),
    seq(tok('and'), many(g.expr)),
    seq(tok('or'), many(g.expr)),
    seq(tok('list'), many(g.expr)),
    seq(tok('map'), many(g.expr)),
    seq(tok('js/import'), g.string),
    seq(tok('js/method'), g.expr, g.string, many(g.expr)),
    seq(tok('js/get'), g.expr, g.string),
    seq(tok('js'), g.string, many(g.expr)),
  )
);

g.binding = rule('binding', () =>
  seq(lit('('), g.identifier, g.expr, lit(')')),
);

g.branch = rule('branch', () =>
  seq(lit('('), g.pattern, opt(seq(tok('when'), g.expr)), g.expr, lit(')'))
);

g.pattern = rule('pattern', () =>
  or(
    tok('_'),
    g.literal,
    g.identifier,
    seq(lit('['), many(g.listPat), opt(seq(lit('.'), g.identifier)), lit(']')),
    seq(lit('{'), many(g.mapEntry), opt(seq(lit('.'), g.identifier)), lit('}')),
  )
);

g.listPat = rule('listPat', () => g.pattern);

g.mapEntry = rule('mapEntry', () =>
  seq(g.expr, lit(':'), g.pattern)
);

g.literal = rule('literal', () =>
  or(
    g.integer,
    g.float,
    g.string,
    tok('true'),
    tok('false'),
    tok('nil')
  )
);

g.identifier = rule('identifier', () =>
  barring(
    or(
      regex(/[a-zA-Z_?!][a-zA-Z0-9_?!>*-]*/),
      regex(/[+\-*/%<>=]+/),
    ),
    reserved
  )
);

g.integer = rule('integer', () => regex(/-?[0-9]+/));
g['float'] = rule('float', () => regex(/-?[0-9]+.[0-9]+/));
g.string = rule('string', () => regex(/"(\\[\\\"ntr]|[^"\\])*"/));
g.comment = rule('comment', () => regex(/;[^\n]*\n/));
