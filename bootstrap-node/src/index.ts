import { Inferable } from 'inferable';
import { z } from 'zod';

// Some mock functions to register
import * as demo from './demo';

// Instantiate the Inferable client.
const client = new Inferable({
  // To get a new key, run:
  // npx @inferable/cli auth keys create 'My New Machine Key' --type='cluster_machine'
  apiSecret: process.env.INFERABLE_API_SECRET
})

// Register some demo functions
client.default.register({
  name: "searchInventory",
  func: demo.searchInventory,
  description: "Searches the inventory",
  schema: {
    input: z.object({
      search: z.string().describe("Could match name or description"),
    }),
  },
});

client.default.register({
  name: "getInventoryItem",
  func: demo.getInventoryItem,
  description: "Gets an inventory item",
  schema: {
    input: z.object({
      id: z.string(),
    }),
  },
});

client.default.register({
  name: "listOrders",
  func: demo.listOrders,
  description: "Lists all orders",
  schema: {
    input: z.object({}),
  },
});

client.default.register({
  name: "totalOrderValue",
  func: demo.totalOrderValue,
  description: "Calculates the total value of all orders",
  schema: {
    input: z.object({}),
  },
});

client.default.register({
  name: "makeOrder",
  func: demo.makeOrder,
  description: "Makes an order",
  config: {
    requiresApproval: true,
  },
  schema: {
    input: z.object({
      items: z.array(
        z.object({
          id: z.string().describe("Item ID"),
          qty: z.number().int().positive().describe("Quantity to order"),
        })
      ),
    }),
  },
});

client.default.start().then(() => {
  console.log("Inferable demo service started");
})

// Trigger a Run programmatically
// https://docs.inferable.ai/pages/runs
// client.run({
//   message: "Can you make an order for 2 lightsabers?",
//   // Optional: Explicitly attach the functions (All functions attached by default)
//   //attachedFunctions: [],
//   // Optional: Specify the schema of the result
//   //resultSchema: z.object({}),
// }).then(async (run) => {
//     console.log("Run result", {
//       result: await run.poll(),
//     });
//   });

