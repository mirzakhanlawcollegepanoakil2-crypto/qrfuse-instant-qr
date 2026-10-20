/** Load every page and propagate failures rather than publishing a partial list. */
export async function collectPages<T>(
  fetchPage: (from: number, to: number) => Promise<T[]>,
  pageSize = 500,
): Promise<T[]> {
  const result: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const rows = await fetchPage(from, from + pageSize - 1);
    result.push(...rows);
    if (rows.length < pageSize) return result;
  }
}