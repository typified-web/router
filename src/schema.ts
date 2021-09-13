import type { JSONSchema7 } from 'json-schema';

/**
 * The schema definition.
 */
export interface SimpleSchema<T> {
  transform(value: unknown): T;
  schema: JSONSchema7;
}

/**
 * Declare a string schema.
 * By default, it transform all value into string format. Specify the strict flag to enable strict validation.
 *
 * @param opt the options.
 * @returns the schema of string.
 */
export function string(opt?: { strict: boolean }): SimpleSchema<string> {
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
export function number(opt: { strict: boolean }): SimpleSchema<number> {
  return {
    transform(value) {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') return parseFloat(value);
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
export function boolean(opt?: { strict: boolean }): SimpleSchema<boolean> {
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
export function nil(): SimpleSchema<null> {
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
  [k in keyof T]: SimpleSchema<T[k]>;
}): SimpleSchema<T> {
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
export function array<T>(defn: SimpleSchema<T>): SimpleSchema<T[]> {
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
