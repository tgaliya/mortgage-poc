/** Case-insensitive substring match across any number of record fields. */
export function matchesSearch(term: string, ...values: Array<string | number | null | undefined>): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  return values.some(v => v != null && String(v).toLowerCase().includes(needle));
}
