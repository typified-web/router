import { Output, OutputSchema } from './output';
import { Input, InputSchema } from './input';

/**
 * The supported HTTP methods.
 */
export type Method = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' | 'OPTIONS';

/**
 * The schema of a route.
 */
export interface RouteSchema<I, IH extends Record<string, unknown>, O extends Output> {
  method?: Method | Method[];
  path: string;
  input: InputSchema<Input<I, IH>>;
  output: OutputSchema<O>;
}

/**
 * The route definition.
 */
export interface Route<
  I = unknown,
  IH extends Record<string, unknown> = Record<string, unknown>,
  O extends Output = Output,
> extends RouteSchema<I, IH, O> {
  call(ctx: Input<I, IH>): O;
}