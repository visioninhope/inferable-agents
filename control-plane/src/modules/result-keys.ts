function getResultKeys(result: unknown, path: string = ""): string[] {
  if (typeof result === "object" && result !== null) {
    if (Array.isArray(result)) {
      return result.flatMap((item) =>
        getResultKeys(item, path ? `${path}[]` : `[]`),
      );
    } else {
      return Object.entries(result).flatMap(([key, value]) => {
        const newPath = path ? `${path}.${key}` : key;
        if (typeof value === "object" && value !== null) {
          return [newPath, ...getResultKeys(value, newPath)];
        }
        return [newPath];
      });
    }
  }
  return [];
}

function mergeResultKeys(
  newKeys: string[],
  existingKeys: { key: string; last_seen: number }[] | null,
): { key: string; last_seen: number }[] {
  const currentTime = Date.now();
  const newKeyObjects = newKeys.map((key) => ({ key, last_seen: currentTime }));

  return [...newKeyObjects, ...(existingKeys ?? [])].reduce(
    (acc, curr) => {
      const existing = acc.find((item) => item.key === curr.key);
      if (existing) {
        existing.last_seen = Math.max(existing.last_seen, curr.last_seen);
      } else {
        acc.push(curr);
      }
      return acc;
    },
    [] as { key: string; last_seen: number }[],
  );
}

// a.b.c is more expressive than a.b
// a.b is more expressive than a
export function filterMostExpressiveKeys(
  result: unknown,
  existingKeys: { key: string; last_seen: number }[] | null,
): { key: string; last_seen: number }[] {
  const newKeys = getResultKeys(result);
  const mergedKeys = mergeResultKeys(newKeys, existingKeys);

  const keys = mergedKeys.map((k) => k.key).sort((a, b) => b.length - a.length);

  const mostExpressiveKeys: string[] = [];

  for (const key of keys) {
    if (
      !mostExpressiveKeys.some(
        (expKey) =>
          key !== expKey && (key.startsWith(expKey) || expKey.startsWith(key)),
      )
    ) {
      mostExpressiveKeys.push(key);
    }
  }

  return mergedKeys.filter((k) => mostExpressiveKeys.includes(k.key));
}
