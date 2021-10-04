import * as schema from './types';
import { InputSchema, Input } from './input';
import { Schema } from './general';
import { OutputSchema, Output, output as transform } from './output';
import { RouteSchema, Route } from './route';

/**
 * A helper function to define the input schema.
 *
 * @param cb the callback to define the schema.
 * @returns input schema.
 */
export function input<I, IH extends Record<string, unknown>>(
  cb: (types: typeof schema) => InputSchema<Input<I, IH>>,
): InputSchema<Input<I, IH>> {
  return cb(schema);
}

/**
 * A helper function to define the output schema.
 *
 * @param cb the callback to define the schema.
 * @returns output schema.
 */
export function output<S extends number, H extends Record<string, unknown>, B>(
  cb: (types: typeof schema) => {
    status: S;
    header: Schema<H>;
    body: Schema<B>;
  },
): OutputSchema<Output<S, H, B>> {
  return transform(cb(schema));
}

export namespace output {
  /**
   * Define a union of outputs.
   */
  export const union = transform.union;
}

/**
 * Define the route.
 *
 * @param schema the route schema.
 * @returns the factory to create the route.
 */
export function route<I, IH extends Record<string, unknown>, O extends Output>(
  schema: RouteSchema<I, IH, O>,
): (call: (ctx: Input<I, IH>) => O) => Route<I, IH, O> {
  return (call) => ({
    ...schema,
    call,
  });
}
