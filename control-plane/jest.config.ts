import type { Config } from "jest";

const config: Config = {
  prettierPath: require.resolve("prettier-2"),
  testTimeout: 20000,
};

export default config;
