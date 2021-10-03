import { Output, OutputSchema } from './schema/output';
import { Schema } from './schema/general';
import * as schema from './schema/types';

/**
 * The supported HTTP methods.
 */
export type Method = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' | 'OPTIONS';

/**
 * The route definition.
 */
export interface Route<I, IH extends Record<string, unknown>, O extends Output> {
  method?: Method | Method[];
  path: string;
  input: {
    header: Schema<IH>;
    body: Schema<I>;
  };
  output: OutputSchema<O>;
  call(ctx: { header: IH; body: I }): O;
}

/**
 * The internal type-safe route builder.
 */
class RouterBuilder {
  private routes: Array<Route<unknown, Record<string, unknown>, Output>> = [];

  route<I, IH extends Record<string, unknown>, O extends Output>(route: Route<I, IH, O>): RouterBuilder {
    this.routes.push(route);
    return this;
  }

  /**
   * Add route to the builder.
   *
   * @param cb the route definer callback.
   * @returns this.
   */
  defineRoute(cb: (definer: RouteDefiner) => void) {
    const definer = new RouteDefiner(this);
    cb(definer);
    return this;
  }

  /**
   * Get routes.
   *
   * @returns the added routes.
   */
  getRoutes(): Array<Route<unknown, Record<string, unknown>, Output>> {
    return this.routes;
  }
}

class RouteDefiner {
  constructor(private readonly builder: RouterBuilder) {}

  schema<I, IH extends Record<string, unknown>, O extends Output>(schema: {
    method?: Method | Method[];
    path: string;
    input: {
      header: Schema<IH>;
      body: Schema<I>;
    };
    output: OutputSchema<O>;
  }) {
    return new RouteBuilder(this.builder, schema);
  }
}

class RouteBuilder<I, IH extends Record<string, unknown>, O extends Output> {
  constructor(
    private readonly routerBuilder: RouterBuilder,
    private readonly schema: {
      method?: Method | Method[];
      path: string;
      input: {
        header: Schema<IH>;
        body: Schema<I>;
      };
      output: OutputSchema<O>;
    },
  ) {}

  call(call: (ctx: { header: IH; body: I }) => O) {
    this.routerBuilder.route({
      ...this.schema,
      call,
    });
  }
}

/**
 * Define the schema via declarative syntax.
 *
 * @param cb the callback to define the schemas.
 * @returns the schema.
 */
export function defineSchema<T, Def>(cb: (types: typeof schema) => Schema<T, Def>): Schema<T, Def> {
  return cb(schema);
}

/**
 * The interface to help build routes with type-safety.
 */
export interface RouterDefiner {
  /**
   * Add route to the builder.
   *
   * @param cb the route definer callback.
   * @returns this.
   */
  defineRoute(cb: (definer: RouteDefiner) => void): RouterDefiner;
}

/**
 * The interface to help get the routes.
 */
export interface RouteContainer {
  getRoutes(): Array<Route<unknown, Record<string, unknown>, Output>>;
}

/**
 * Define the routes with declarative syntax.
 *
 * @param cb the callback to define routes.
 * @returns the container.
 */
export function defineRoutes(cb: (definer: RouterDefiner) => void): RouteContainer {
  const builder = new RouterBuilder();
  cb(builder);
  return builder;
}
