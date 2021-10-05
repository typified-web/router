import * as schema from './types';
import { InputSchema, Input } from './input';
import { Schema } from './general';
import { OutputSchema, Output, output as transform } from './output';
import { RouteSchema, Route } from './route';

/**
 * Define a input with header and body.
 *
 * @param cb the callback to return both header and body.
 */
export function input<I, IH extends Record<string, unknown>>(
  cb: (types: typeof schema) => InputSchema<Input<I, IH>>,
): InputSchema<Input<I, IH>>;

/**
 * Define a input with body only.
 *
 * @param cb the callback to return both header and body.
 */
export function input<I>(
  cb: (types: typeof schema) => { body: Schema<I> },
): InputSchema<Input<I, Record<string, unknown>>>;

/**
 * Define a input with header only.
 *
 * @param cb the callback to return both header and body.
 */
export function input<IH extends Record<string, unknown>>(
  cb: (types: typeof schema) => { header: Schema<IH> },
): InputSchema<Input<null, IH>>;

export function input(cb: (types: typeof schema) => Partial<InputSchema<Input>>): InputSchema<Input> {
  const partial = cb(schema);
  return {
    header: partial.header ?? schema.object({}),
    body: partial.body ?? schema.nil(),
  };
}

export namespace input {
  /**
   * Define input without any parameters.
   *
   * @returns the null input.
   */
  export function none(): InputSchema<Input<null, Record<string, unknown>>> {
    return {
      header: schema.object({}),
      body: schema.nil(),
    };
  }
}

/**
 * Define output with header, body and status.
 * If any parameter is undefined, it will be default to
 *
 * @param cb the callback to define the schema.
 * @returns output schema.
 */
export function output<
  S extends number = 200,
  H extends Record<string, unknown> = Record<string, unknown>,
  B = unknown,
>(
  cb: (types: typeof schema) => {
    status?: S;
    header?: Schema<H>;
    body?: Schema<B>;
  },
): OutputSchema<Output<S, H, B>>;

export function output(
  cb: (types: typeof schema) => {
    status?: number;
    header?: Schema<Record<string, unknown>>;
    body?: Schema<unknown>;
  },
): OutputSchema<Output> {
  const partial = cb(schema);
  return transform({
    status: partial.status ?? 200,
    header: partial.header ?? schema.object({}),
    body: partial.body ?? schema.nil(),
  });
}

export namespace output {
  /**
   * Define a union of outputs.
   */
  export const union = transform.union;

  /**
   * Define an empty output with status 200.
   *
   * @returns a output with 200.
   */
  export function status<S extends number>(status: S): OutputSchema<Output<S>> {
    return output(() => ({
      status,
    }));
  }

  /**
   * Define an empty output with status 200.
   *
   * @returns a output with 200.
   */
  export function ok(): OutputSchema<Output<200>> {
    return status(200);
  }
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
