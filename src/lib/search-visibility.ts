/** Authentication remains the access boundary; this only controls search visibility. */
export function isPrivateSearchPath(path: string): boolean {
  return ["/admin", "/auth", "/dashboard", "/r"].some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}