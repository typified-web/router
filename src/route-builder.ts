import * as schema from './schema';

/**
 * The supported HTTP methods.
 */
export type Method = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' | 'OPTIONS';

/**
 * The route definition.
 */
export interface Route<
  I,
  IH extends Record<string, unknown>,
  O,
  OH extends Record<string, unknown>,
  AO extends O,
  AOH extends OH,
> {
  method?: Method | Method[];
  path: string;
  input: {
    header: schema.SimpleSchema<IH>;
    body: schema.SimpleSchema<I>;
  };
  output: {
    header: schema.SimpleSchema<OH>;
    body: schema.SimpleSchema<O>;
  };
  call(ctx: { header: IH; body: I }): {
    header: AOH;
    body: AO;
  };
}

/**
 * The internal type-safe route builder.
 */
class RouteBuilder {
  private routes: Array<
    Route<unknown, Record<string, unknown>, any, Record<string, unknown>, unknown, Record<string, unknown>>
  > = [];

  /**
   * Add route to the builder.
   *
   * @param route the route parameters.
   * @returns this.
   */
  route<I, IH extends Record<string, unknown>, O, OH extends Record<string, unknown>, AO extends O, AOH extends OH>(
    route: Route<I, IH, O, OH, AO, AOH>,
  ): RouteBuilder {
    this.routes.push(route);
    return this;
  }

  /**
   * Get routes.
   *
   * @returns the added routes.
   */
  getRoutes(): Array<
    Route<unknown, Record<string, unknown>, any, Record<string, unknown>, unknown, Record<string, unknown>>
  > {
    return this.routes;
  }
}

/**
 * Define the schema via declarative syntax.
 *
 * @param cb the callback to define the schemas.
 * @returns the schema.
 */
export function defineSchema<T>(cb: (types: typeof schema) => schema.SimpleSchema<T>): schema.SimpleSchema<T> {
  return cb(schema);
}

/**
 * The interface to help build routes with type-safety.
 */
export interface RouteDefiner {
  route<I, IH extends Record<string, unknown>, O, OH extends Record<string, unknown>, AO extends O, AOH extends OH>(
    route: Route<I, IH, O, OH, AO, AOH>,
  ): RouteDefiner;
}

/**
 * The interface to help get the routes.
 */
export interface RouteContainer {
  getRoutes(): Array<
    Route<unknown, Record<string, unknown>, any, Record<string, unknown>, unknown, Record<string, unknown>>
  >;
}

/**
 * Define the routes with declarative syntax.
 *
 * @param cb the callback to define routes.
 * @returns the container.
 */
export function defineRoutes(cb: (definer: RouteDefiner) => void): RouteContainer {
  const builder = new RouteBuilder();
  cb(builder);
  return builder;
}
