import type { JSONSchema7 } from 'json-schema';
import type { Schema } from './general';
import { DecodeType, literalTransform, SumOfArray, unionTransform } from './util';

export type Output<
  S extends number = number,
  H extends Record<string, unknown> = Record<string, unknown>,
  B = unknown,
> = { status: S; header: H; body: B };

type Responses = {
  [k: number]: {
    content: {
      'application/json': {
        schema: JSONSchema7;
      };
    };
  };
};

export type OutputSchema<O extends Output> = Schema<O, Responses>;

export function output<S extends number, H extends Record<string, unknown>, B>(defn: {
  status: S;
  header: Schema<H>;
  body: Schema<B>;
}): OutputSchema<Output<S, H, B>> {
  return {
    transform(value) {
      if (typeof value !== 'object') throw new Error('not an object');
      if (!value) throw new Error('null object');
      const obj = value as Record<string, unknown>;
      return {
        status: literalTransform(obj['status'], defn.status),
        header: defn.header?.transform(obj['header']),
        body: defn.body.transform(obj['body']),
      };
    },
    schema: {
      [defn.status]: {
        content: {
          'application/json': {
            schema: defn.body.schema,
          },
        },
      },
    },
  };
}

export namespace output {
  export function union<Schemas extends OutputSchema<Output>[]>(
    ...s: Schemas
  ): OutputSchema<DecodeType<SumOfArray<Schemas>>> {
    return {
      transform(value) {
        return unionTransform(value, ...s);
      },
      schema: s.reduce(
        (schema, defn) => ({
          ...defn.schema,
          ...schema,
        }),
        {},
      ),
    };
  }
}
