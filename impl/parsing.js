////////////////////////////////////////////////////////////////////////////////
// PARSING
// A parser is a function string -> { result: any, rest: string } | null
//   - The first case handles a match; the second no match
// They can be combined by operators:
//   - seqUntokenized([parser_a, parser_b]): runs a, then sends its rest to b, and returns the list of all the
//     results
//   - seq([parser_a, parser_b]): equivalent to seqUntokenized([many(whitespace), parser_a, many(whitespace), parser_b, many(whitespace)])
//   - or([a, b, c]): returns the result of the first of a, b, c that is non-null
//   - many(parser):

// commas are treated as whitespace in dodo, so we need a custom expression of trim. this also
// strips comments
export function trimWS(s) {
  const trimmed = s.replace(/^[\s,]*/, '');
  if (trimmed.match(/^;/)) {
    return trimWS(trimmed.replace(/^;[^\r\n]*[\n\r]/,''));
  }
  return trimmed;
}

export function lit(str) {
  const len = str.length;
  return (input) => {
    return (
      input.slice(0, len) === str
        ? {
          result: str,
          rest: input.slice(len)
        } : null
    );
  }
}

// Like lit(), but requires that it not be extensible to an identifier
export function tok(str) {
  const len = str.length;
  return input => {
    const head = input.slice(0, len);
    const rest = input.slice(len);
    if (head === str && !rest.match(/^[a-zA-Z0-9_?!>*\-+/%<=]/)) {
      return {
        result: str,
        rest,
      };
    }
    return null;
  }
}

export function regex(re) {
  // Make sure we only match the beginning of the input
  const fixed = re.source.match(/^\^/)
        ? re
        : new RegExp('^' + re.source);
  return (input) => {
    const match = fixed.exec(input);
    if (!match) return null;

    return {
      result: match[0],
      rest: input.slice(match[0].length),
    };
  };
}

export function seq() {
  const parsers = [...arguments];
  return (input) => {
    return parsers.reduce((current, parser) => {
      if (!current) return null;

      const res = parser(trimWS(current.rest));
      if (!res) return null;

      return {
        result: current.result.concat([res.result]),
        rest: res.rest,
      };
    }, {
      result: [],
      rest: input,
    })
  };
}

export function or() {
  const parsers = [...arguments];
  return (input) => {
    for (var i = 0; i < parsers.length; i++) {
      const res = parsers[i](input);

      if (res) return res;
    }

    return null;
  };
}

export function many(parser) {
  function recur(input, partial) {
    const res = parser(trimWS(input));
    if (res) return recur(res.rest, partial.concat([res.result]));
    return { result: partial, rest: input };
  }

  return (input) => {
    return recur(input, []);
  };
}

export function oneOrMore(parser) {
  return seq(parser, many(parser));
}

const empty = (input) => ({
  result: [],
  rest: input,
});

const fail = (input) => null;

export const opt = (parser) => or(
  parser,
  empty
);

export const barring = (parser, barred) => {
  return (input) => {
    const res = parser(input);
    if (res === null) return null;
    if (barred.includes(res.result)) return null;
    return res;
  };
};

// We put all our grammar definitions into an object so that lookups happen at runtime - this allows
// grammar element to reference each other or themselves. To reference things that haven't been
// added to the grammar yet, the rule function accepts a thunk and doesn't evaluate it until
// runtime. It also provides some utilities for debugging and will in the future give hooks for
// processing the nodes as they're parsed.
const DEBUG = false;
const LOG_HEAD = 10;
export const rule = (name, parserThunk, resultCleaner) => ((input) => {
  if (DEBUG) console.log('xcxc ' + name + ' input = ', input.slice(0, LOG_HEAD));
  const parser = parserThunk();
  const res = parser(trimWS(input));
  if (!res || !resultCleaner) return res;
  return {
    result: resultCleaner(res.result),
    rest: res.rest,
  };
});
