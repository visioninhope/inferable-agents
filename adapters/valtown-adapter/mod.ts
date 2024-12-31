const {
  createVerify,
} = await import('node:crypto');

type JWKSPublicKey = {
  alg: string;
  kty: string;
  n: string;
  e: string;
}

export class InferableService {
  private functions: Parameters<InferableService["registerFunction"]>[0][] = [];

  constructor(
    private options: {
      description: string;
      publicKey?: JWKSPublicKey;
    },
  ) {
    if (options.publicKey) {
      if (!options.publicKey.alg || !options.publicKey.kty || !options.publicKey.n || !options.publicKey.e) {
        throw new Error("Invalid public key");
      }
    }
  }

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

  private isAuthenticated({
    xTimestamp,
    xSignature,
    method,
    path,
    body,
  }: {
    xTimestamp: string;
    xSignature: string;
    method: string;
    path: string;
    body: string;
  }): boolean {
    const signatureFromHeader = xSignature;

    if (!signatureFromHeader) {
      return false;
    }

    console.log("About to verify", {
      xTimestamp,
      method,
      path,
      body,
      signatureFromHeader,
      publicKey: this.options.publicKey,
    });

    const verifier = createVerify("SHA256");
    const message = `${xTimestamp}${method}${path}${body}`;
    console.log("Message to verify:", message);
    verifier.update(message);
    verifier.end();
    const result = verifier.verify({
      key: this.options.publicKey,
      format: "jwk",
    }, signatureFromHeader, "hex");
    console.log("Verification result:", result);
    return result;
  }

  getServer(): (request: Request) => Promise<Response> {
    const server = async (request: Request): Promise<Response> => {
      const url = new URL(request.url);
      const path = url.pathname;

      const hasPublicKey = this.options.publicKey !== undefined;

      if (!hasPublicKey) {
        console.warn("No public key provided. Authentication is disabled. See https://docs.inferable.ai/valtown to learn how to enable it.");
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
        const body = await request.body?.getReader().read();
        const bodyText = body ? new TextDecoder().decode(body.value) : "";

        if (!bodyText) {
          return new Response(JSON.stringify({ error: "No body" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        if (hasPublicKey && !this.isAuthenticated({
          xTimestamp: request.headers.get("X-Timestamp") || "",
          xSignature: request.headers.get("X-Signature") || "",
          method: request.method,
          path,
          body: bodyText,
        })) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        }

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
