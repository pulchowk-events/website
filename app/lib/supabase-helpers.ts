// Supabase's TS inference types ALL aliased joins as arrays (`T[]`),
// regardless of actual cardinality. Runtime usually returns an object for
// many-to-one joins — but TS can't tell, so accessing `.name` on the joined
// field errors at compile time.
//
// normalizeRelation() collapses either shape to a single value, so consumers
// always see the correct type AND runtime behavior is safe whether Supabase
// returns object or array.

export function normalizeRelation<T>(
  rel: T | T[] | null | undefined,
): T | null {
  if (rel == null) return null;
  if (Array.isArray(rel)) return rel[0] ?? null;
  return rel;
}

// Convenience for Supabase selects that include a joined user object
// under a specific alias (e.g. `users:author_id (...)`, `author:created_by (...)`).
export function normalizeJoin<T extends Record<string, any>>(
  row: T,
  field: string,
): T {
  return {
    ...row,
    [field]: normalizeRelation((row as any)[field]),
  };
}
