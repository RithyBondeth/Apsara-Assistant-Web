/**
 * A page of results from a list endpoint — mirrors the backend's `Page` schema.
 *
 * `total` is the count of everything matching the query, not the length of
 * `items`. Rendering `items.length` as the total is the bug this shape exists
 * to prevent.
 */
export interface IPage<T> {
  items: T[];
  total: number;
}
