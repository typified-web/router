import type { Schema } from './general';

export type DecodeType<S> = S extends Schema<infer T, unknown> ? DecodeType<T> : S;
export type SumOfArray<arr> = arr extends (infer elements)[] ? elements : never;

export function unionTransform<Schemas extends Schema<unknown, unknown>[]>(
  value: unknown,
  ...s: Schemas
): DecodeType<SumOfArray<Schemas>> {
  const result = s.reduce(
    (ret, i) => {
      if (!ret.done) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ret.result = i.transform(value) as any;
          ret.done = true;
        } catch (err) {}
      }
      return ret;
    },
    { result: null, done: false },
  );
  if (!result.done) {
    throw new Error('cannot transform');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result.result as any;
}

export function literalTransform<T extends string | number>(value: unknown, defn: T): T {
  if (value !== defn) {
    throw new Error('not equal to the given literal form');
  }
  return value as T;
}
