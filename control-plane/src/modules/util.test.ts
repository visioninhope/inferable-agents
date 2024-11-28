import { withThrottle } from "./util";
import * as redis from "./redis";

describe("withThrottle", () => {
  beforeAll(async () => {
    redis.start();
  });
  afterAll(async () => {
    redis.stop();
  });

  it("should not allow calls within the time limit", async () => {
    const fn = jest.fn();
    const key = `throttle-test-${Date.now()}`;

    for (let i = 0; i < 10; i++) {
      await withThrottle(key, 10, fn);
    }

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should allow calls after the time limit", async () => {
    const fn = jest.fn();
    const key = `throttle-test-${Date.now()}`;

    await withThrottle(key, 1, fn);

    expect(fn).toHaveBeenCalledTimes(1);

    await new Promise((resolve) => {
      setTimeout(resolve, 1500);
    });

    await withThrottle(key, 1, fn);

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
