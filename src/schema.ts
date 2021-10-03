import type { JSONSchema7, JSONSchema7TypeName } from 'json-schema';

/**
 * The schema definition.
 */
export interface Schema<T, SchemaDef = JSONSchema7> {
  transform(value: unknown): T;
  schema: SchemaDef;
}

/**
 * Declare a string schema.
 * By default, it transform all value into string format. Specify the strict flag to enable strict validation.
 *
 * @param opt the options.
 * @returns the schema of string.
 */
export function string(opt?: { strict: boolean }): Schema<string> {
  return {
    transform(value) {
      if (opt?.strict) {
        if (typeof value === 'string') {
          return value;
        }
        throw new Error('not a string');
      }
      return `${value}`;
    },
    schema: {
      type: 'string',
    },
  };
}

/**
 * Declare a number schema.
 * Specify strict flag to enable strict validation.
 *
 * @param opt the options.
 * @returns the schema of number
 */
export function number(opt?: { strict: boolean }): Schema<number> {
  return {
    transform(value) {
      if (typeof value === 'number') return value;
      if (!opt?.strict && typeof value === 'string') return parseFloat(value);
      throw new Error('not a number');
    },
    schema: {
      type: 'number',
    },
  };
}

/**
 * Declare a boolean schema.
 * Specify strict flag to enable strict validation.
 *
 * @param opt the options.
 * @returns the schema of boolean.
 */
export function boolean(opt?: { strict: boolean }): Schema<boolean> {
  return {
    transform(value) {
      if (typeof value === 'boolean') return value;
      if (!opt?.strict) {
        if (value === 'true') return true;
        if (value === 'false') return false;
      }
      throw new Error('not a boolean');
    },
    schema: {
      type: 'boolean',
    },
  };
}

/**
 * Declare a null schema.
 *
 * @returns the schema of null.
 */
export function nil(): Schema<null> {
  return {
    transform(value) {
      if (value == null) return null;
      throw new Error('not a null');
    },
    schema: {
      type: 'null',
    },
  };
}

/**
 * Declare a structure with properties defined.
 *
 * @param defn the definition of object.
 * @returns the schema of object.
 */
export function object<T extends Record<string, unknown>>(defn: {
  [k in keyof T]: Schema<T[k]>;
}): Schema<T> {
  return {
    transform(value) {
      if (typeof value !== 'object') throw new Error('not an object');
      if (!value) throw new Error('null object');
      const obj = value as Record<keyof T, unknown>;
      return (Object.keys(defn) as Array<keyof T>).reduce((m, key) => {
        m[key] = defn[key].transform(obj[key]);
        return m;
      }, {} as T);
    },
    schema: {
      type: 'object',
      properties: Object.keys(defn).reduce((m, key) => {
        m[key] = defn[key].schema;
        return m;
      }, {} as Record<string, JSONSchema7>),
    },
  };
}

/**
 * Declare an array with specific type.
 *
 * @param defn the definition of array items.
 * @returns the schema of array.
 */
export function array<T>(defn: Schema<T>): Schema<T[]> {
  return {
    transform(value) {
      if (!Array.isArray(value)) {
        throw new Error('not a value');
      }
      return value.map((v) => defn.transform(v));
    },
    schema: {
      type: 'array',
      items: defn.schema,
    },
  };
}

export function literal<T extends string | number>(defn: T): Schema<T> {
  return {
    transform(value) {
      if (value !== defn) {
        throw new Error('not equal to the given literal form');
      }
      return value as T;
    },
    schema: {
      type: typeof defn === 'string' ? 'string' : typeof defn === 'number' ? 'number' : 'null',
    },
  };
}

type DecodeType<S> = S extends Schema<infer T, unknown> ? DecodeType<T> : S;
type SumOfArray<arr> = arr extends (infer elements)[] ? elements : never;

export function union<Schemas extends Schema<unknown>[]>(...s: Schemas): Schema<DecodeType<SumOfArray<Schemas>>> {
  return {
    transform(value) {
      const result = s.reduce(
        (ret, i) => {
          if (!ret.done) {
            try {
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
      return result.result as any;
    },
    schema: {
      type: s.map((s) => s.schema.type as JSONSchema7TypeName),
    },
  };
}

export type Responses = {
  [k: number]: {
    content: {
      'application/json': {
        schema: JSONSchema7;
      };
    };
  };
};

export function output<S extends number, H extends Record<string, unknown>, B>(defn: {
  status: S;
  header: Schema<H>;
  body: Schema<B>;
}): Schema<{ status: S; header?: H; body: B }, Responses> {
  return {
    transform(value) {
      if (typeof value !== 'object') throw new Error('not an object');
      if (!value) throw new Error('null object');
      const obj = value as Record<string, unknown>;
      return {
        status: literal(defn.status).transform(obj['status']),
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
  export function union<Schemas extends Schema<unknown, Responses>[]>(
    ...s: Schemas
  ): Schema<DecodeType<SumOfArray<Schemas>>, Responses> {
    return {
      transform(value) {
        const result = s.reduce(
          (ret, i) => {
            if (!ret.done) {
              try {
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
        return result.result as any;
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
