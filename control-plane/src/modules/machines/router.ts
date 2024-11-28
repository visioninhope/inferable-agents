import { initServer } from "@ts-rest/fastify";
import { contract } from "../contract";
import { upsertMachine } from "../machines";
import * as events from "../observability/events";
import { upsertServiceDefinition } from "../service-definitions";
import { dereferenceSync } from "dereference-json-schema";
import { safeParse } from "../../utilities/safe-parse";
import { BadRequestError } from "../../utilities/errors";

const ILLEGAL_SERVICE_NAMES = [
  "inferable",
  "Inferable",
  "toolhouse",
  "ToolHouse",
];

export const machineRouter = initServer().router(
  { createMachine: contract.createMachine },
  {
    createMachine: async (request) => {
      const machine = request.request.getAuth().isMachine();

      const machineId = request.headers["x-machine-id"];

      if (!machineId) {
        throw new BadRequestError("Request does not contain machine ID header");
      }

      const { service, functions } = request.body;

      if (service && ILLEGAL_SERVICE_NAMES.includes(service)) {
        throw new BadRequestError(
          `Service name ${service} is reserved and cannot be used.`,
        );
      }

      const derefedFns = functions?.map((fn) => {
        const schema = fn.schema
          ? safeParse(fn.schema)
          : { success: true, data: undefined };

        if (!schema.success) {
          throw new BadRequestError(
            `Function ${fn.name} has an invalid schema.`,
          );
        }

        return {
          clusterId: machine.clusterId,
          name: fn.name,
          description: fn.description,
          schema: schema.data
            ? JSON.stringify(dereferenceSync(schema.data))
            : undefined,
          config: fn.config,
        };
      });

      await Promise.all([
        upsertMachine({
          clusterId: machine.clusterId,
          machineId,
          sdkVersion: request.headers["x-machine-sdk-version"],
          sdkLanguage: request.headers["x-machine-sdk-language"],
          xForwardedFor: request.headers["x-forwarded-for"],
          ip: request.request.ip,
        }),
        service &&
          upsertServiceDefinition({
            service,
            definition: {
              name: service,
              functions: derefedFns,
            },
            owner: machine,
          }),
      ]);

      events.write({
        type: "machineRegistered",
        clusterId: machine.clusterId,
        machineId,
        service,
      });

      return {
        status: 200,
        body: {
          clusterId: machine.clusterId,
        },
      };
    },
  },
);
