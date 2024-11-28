import NodeCache from "node-cache";

const nodeCache = new NodeCache({
  maxKeys: 5000,
});

export const createCache = <T>(namespace: symbol) => {
  return {
    get: (key: string) => {
      return nodeCache.get<T>(`${namespace.toString()}:${key}`);
    },
    set: (key: string, value: T, ttl: number) => {
      return nodeCache.set(`${namespace.toString()}:${key}`, value, ttl);
    },
  };
};

// Usage
// const cache = createCache(Symbol("cache"));
// cache.set("key", "value");
// const value = cache.get("key");
