import { createOwner } from "../test/util";
import * as apiSecret from "./api-secret";

describe("verifyApiKey", () => {
  it("should verify an api secret when the key exists", async () => {
    const owner = await createOwner();
    const key = await apiSecret.createApiKey({
      clusterId: owner.clusterId,
      createdBy: owner.userId,
      name: "test key",
    });

    const result = await apiSecret.verifyApiKey(key.key);

    expect(result).toEqual({
      organizationId: owner.organizationId,
      clusterId: owner.clusterId,
      id: key.id,
    });
  });

  it("should return null when the key does not exist", async () => {
    const result = await apiSecret.verifyApiKey("invalid-token");
    expect(result).toBeUndefined();
  });

  it("should return null when the key is revoked", async () => {
    const owner = await createOwner();

    const key = await apiSecret.createApiKey({
      clusterId: owner.clusterId,
      createdBy: owner.userId,
      name: "test key",
    });

    await apiSecret.revokeApiKey({
      clusterId: owner.clusterId,
      keyId: key.id,
    });

    const result = await apiSecret.verifyApiKey(key.key);

    expect(result).toBeUndefined();
  });
});
