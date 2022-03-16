export function invertRecord(
  obj: Record<string, string>
): Record<string, string> {
  const invertedEntries = Object.entries(obj).map(([key, value]) => [
    value,
    key
  ]);

  return Object.fromEntries(invertedEntries);
}
