import { makeProps, xor } from '../src/tools';

test('xor', () => {
  expect(xor('something', undefined)).toBe(true);
  expect(xor(undefined, 'something')).toBe(true);
  expect(xor(undefined, undefined)).toBe(false);
  expect(xor('something', 'something')).toBe(false);
  expect(xor('', 'something')).toBe(true);
  expect(xor('something', '')).toBe(true);
});

test('makeprops shallow merge', () => {
  const src = {
    a: 1,
  };

  expect(makeProps(src)).toStrictEqual({ a: 1 });
  expect(makeProps(src, { defaults: { b: 2 } })).toStrictEqual({ a: 1, b: 2 });
  expect(makeProps(src, { defaults: { a: 2 } })).toStrictEqual({ a: 1 });
  expect(makeProps(src, { overrides: { a: 2 } })).toStrictEqual({ a: 2 });
  expect(makeProps({ a: { b: 1 } }, { overrides: { a: 2 } })).toStrictEqual({ a: 2 });
  expect(src).toStrictEqual({ a: 1 });
});


test('makeprops deep merge', () => {
  const src = {
    a: {
      b: 1,
    },
  };

  expect(makeProps(src, { defaults: { c: 2 } }, true)).toStrictEqual({ a: { b: 1 }, c: 2 });
  expect(makeProps(src, { defaults: { a: 2 } }, true)).toStrictEqual({ a: { b: 1 } });
  expect(makeProps(src, { overrides: { a: 2 } }, true)).toStrictEqual({ a: 2 });
  expect(makeProps(src, { defaults: { a: { c: 2 } } }, true)).toStrictEqual({ a: { b: 1, c: 2 } });
  expect(makeProps({ a: [1, 2, 3] }, { overrides: { a: [4] } }, true)).toStrictEqual({ a: [4] });
  expect(src).toStrictEqual({ a: { b: 1 } });
});
