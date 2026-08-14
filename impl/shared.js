export function isTruthy(val) {
  return !(val === false || val === null);
}

export const isHash = (obj) => {
  return typeof obj === 'object' && obj !== null && obj.constructor === Object;
};

export function errorOut(s) {
  throw new Error(s);
}
