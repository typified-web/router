import type { JSONSchema7 } from 'json-schema';

/**
 * The schema definition.
 */
export interface Schema<T, SchemaDef = JSONSchema7> {
  transform(value: unknown): T;
  schema: SchemaDef;
}
