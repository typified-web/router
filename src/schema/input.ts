import { Schema } from './general';

/**
 * The route input.
 */
export interface Input<B = unknown, H extends Record<string, unknown> = Record<string, unknown>> {
  header: H;
  body: B;
}

/**
 * The schema of route input.
 */
export type InputSchema<I extends Input = Input> = {
  [key in keyof I]: Schema<I[key]>;
};
