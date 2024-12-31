const {
  createVerify,
} = await import('node:crypto');

export class InferableService {
  private functions: Parameters<InferableService["registerFunction"]>[0][] = [];

  constructor(
    private options: {
      description: string;
      publicKey: string;
    },
  ) {}

  registerFunction(options: {
    name: string;
    description: string;
    handler: (input: any) => Promise<any>;
    input: {
      type: "object";
      properties: {
        [key: string]: any;
      };
      required: string[];
    };
  }): void {
    this.functions.push(options);
  }

  private isAuthenticated(request: Request): boolean {
    const signatureFromHeader = request.headers.get("X-Signature");

    if (!signatureFromHeader) {
      return false;
    }

    const timestamp = request.headers.get("X-Timestamp");
    const method = request.method;
    const path = request.url;
    const body = request.body;

    const verifier = createVerify("SHA256");
    verifier.update(`${timestamp}${method}${path}${body}`);
    verifier.end()

    return verifier.verify(this.options.publicKey, signatureFromHeader, "hex");
  }

  getServer(): (request: Request) => Promise<Response> {
    const server = async (request: Request): Promise<Response> => {
      const url = new URL(request.url);
      const path = url.pathname;

      const hasPublicKey = this.options.publicKey !== undefined;

      if (!hasPublicKey) {
        console.warn("No public key provided. Authentication is disabled. See https://docs.inferable.ai/valtown to learn how to enable it.");
      }

      if (hasPublicKey && !this.isAuthenticated(request)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "content-type": "application/json" },
        });
      }

      // Metadata route
      if (path === "/meta") {
        return new Response(
          JSON.stringify({
            description: this.options.description,
            functions: Object.values(this.functions).map(func => ({
              name: func.name,
              description: func.description,
              input: func.input,
            })),
          }),
          {
            headers: { "content-type": "application/json" },
          },
        );
      }

      // Execution route
      if (path.startsWith("/exec/functions/")) {
        const functionName = path.split("/")[3];

        if (request.method !== "POST") {
          return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "content-type": "application/json" },
          });
        }

        try {
          const input = await request.json();

          const handler = this.functions.find(func => func.name === functionName);

          if (!handler) {
            return new Response(JSON.stringify({ error: `Function ${functionName} not found` }), {
              status: 404,
              headers: { "content-type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ result: await handler.handler(input) }));
        } catch (error) {
          return new Response(JSON.stringify({ error: `Error occurred during execution: ${error}` }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
      }

      // Default route
      return new Response(
        JSON.stringify({
          error: `Route not found: ${path}`,
        }),
        {
          status: 404,
          headers: { "content-type": "application/json" },
        },
      );
    };

    return server;
  }
}

//
// Usage
//

// const service = new InferableService({
//   description: "My functions",
// });

// service.registerFunction({
//   name: "sum",
//   description: "Sum two numbers",
//   handler: (input: { a: number; b: number }) => Promise.resolve(input.a + input.b),
//   input: {
//     type: "object",
//     properties: {
//       a: { type: "number" },
//       b: { type: "number" },
//     },
//     required: ["a", "b"],
//   },
// });

// const server = service.getServer();

// export default server;
