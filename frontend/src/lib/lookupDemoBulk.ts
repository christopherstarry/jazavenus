/** Pad seed rows to exactly `target` items (default 50) for QA / lookup dialogs. */
export function expandLookupDemoRows<T>(
  seed: readonly T[],
  /** Default 50 — POC list length for pagination testing */
  target = 50,
  /**
   * @param gapIndex sequential index starting at 0 for generated rows after seed length
   * @param zeroBasedRow absolute row ordinal (existing count before pushing)
   */
  create: (gapIndex: number, zeroBasedRow: number) => T,
): T[] {
  const out = [...seed];
  let gapIndex = 0;
  while (out.length < target) {
    out.push(create(gapIndex, out.length));
    gapIndex++;
  }
  return out;
}
