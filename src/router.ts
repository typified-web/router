import { Route } from './schema/route';
import * as route from './schema/route-definer';

/**
 * The router definition.
 */
export interface Router {
  title: string,
  version?: string,
  routes: Route[];
}

/**
 * A type-safe wrapper to create a router.
 *
 * @param router the router.
 * @returns the router.
 */
export function defineRouter(cb: (r: typeof route) => Router): Router {
  return cb(route);
}
