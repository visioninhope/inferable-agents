import { filterMostExpressiveKeys } from "./result-keys";

describe("filterMostExpressiveKeys", () => {
  it("should return the most expressive keys from a simple object", () => {
    const result = { a: 1, b: { c: 2, d: 3 } };
    const existingKeys = null;

    const filteredKeys = filterMostExpressiveKeys(result, existingKeys);

    expect(filteredKeys).toEqual([
      { key: "a", last_seen: expect.any(Number) },
      { key: "b.c", last_seen: expect.any(Number) },
      { key: "b.d", last_seen: expect.any(Number) },
    ]);
  });

  it("should handle arrays in the result object", () => {
    const result = { a: [{ b: 1 }, { c: 2 }] };
    const existingKeys = null;

    const filteredKeys = filterMostExpressiveKeys(result, existingKeys);

    expect(filteredKeys).toEqual([
      { key: "a[].b", last_seen: expect.any(Number) },
      { key: "a[].c", last_seen: expect.any(Number) },
    ]);
  });

  it("should merge new keys with existing keys", () => {
    const result = { a: 1, b: 2 };
    const existingKeys = [
      { key: "c", last_seen: Date.now() - 1000 },
      { key: "d", last_seen: Date.now() - 2000 },
    ];

    const filteredKeys = filterMostExpressiveKeys(result, existingKeys);

    expect(filteredKeys).toEqual([
      { key: "a", last_seen: expect.any(Number) },
      { key: "b", last_seen: expect.any(Number) },
      { key: "c", last_seen: expect.any(Number) },
      { key: "d", last_seen: expect.any(Number) },
    ]);
    expect(filteredKeys[2].last_seen).toBe(existingKeys[0].last_seen);
    expect(filteredKeys[3].last_seen).toBe(existingKeys[1].last_seen);
  });

  it("should update last_seen for existing keys", () => {
    const result = { a: 1 };
    const existingKeys = [{ key: "a", last_seen: Date.now() - 1000 }];

    const filteredKeys = filterMostExpressiveKeys(result, existingKeys);

    expect(filteredKeys).toEqual([{ key: "a", last_seen: expect.any(Number) }]);
    expect(filteredKeys[0].last_seen).toBeGreaterThan(
      existingKeys[0].last_seen,
    );
  });

  it("should filter out less expressive keys", () => {
    const result = { a: { b: { c: 1 } } };
    const existingKeys = [
      { key: "a", last_seen: Date.now() - 1000 },
      { key: "a.b", last_seen: Date.now() - 2000 },
    ];

    const filteredKeys = filterMostExpressiveKeys(result, existingKeys);

    expect(filteredKeys).toEqual([
      { key: "a.b.c", last_seen: expect.any(Number) },
    ]);
  });

  it("should handle empty result object", () => {
    const result = {};
    const existingKeys = null;

    const filteredKeys = filterMostExpressiveKeys(result, existingKeys);

    expect(filteredKeys).toEqual([]);
  });

  it("should handle null result", () => {
    const result = null;
    const existingKeys = null;

    const filteredKeys = filterMostExpressiveKeys(result, existingKeys);

    expect(filteredKeys).toEqual([]);
  });

  it("should handle nested arrays in the result object", () => {
    const result = { a: [{ b: 1 }, { c: 2 }] };
    const existingKeys = null;

    const filteredKeys = filterMostExpressiveKeys(result, existingKeys);

    expect(filteredKeys).toEqual([
      { key: "a[].b", last_seen: expect.any(Number) },
      { key: "a[].c", last_seen: expect.any(Number) },
    ]);
  });
});
