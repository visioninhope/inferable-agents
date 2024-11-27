import { CommandModule } from "yargs";
import { getToken, startTokenFlow } from "../lib/auth";
import readline from "readline";
import { createCluster } from "./clusters-create";
import { createApiKey } from "./auth-keys";
import { downloadProject } from "../utils";
import { appendFile } from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import inquirer from "inquirer";
import crypto from "crypto";

const execAsync = promisify(exec);

interface BootstrapArgs {
  dir?: string;
  type?: string;
  "no-cluster"?: boolean;
}

const projectMap: Record<
  string,
  {
    url: string;
    ref: string;
  }
> = {
  node: {
    url: "https://git.inferable.ai/inferablehq/inferable/raw/refs/heads/main/archives/bootstrap-node.zip",
    ref: "bootstrap-node",
  },
  go: {
    url: "https://git.inferable.ai/inferablehq/inferable/raw/refs/heads/main/archives/bootstrap-go.zip",
    ref: "bootstrap-go",
  },
  dotnet: {
    url: "https://git.inferable.ai/inferablehq/inferable/raw/refs/heads/main/archives/bootstrap-dotnet.zip",
    ref: "bootstrap-dotnet",
  },
  proxy: {
    url: "https://github.com/inferablehq/proxy/archive/refs/heads/main.zip",
    ref: "proxy-main",
  },
};

export const Bootstrap: CommandModule<{}, BootstrapArgs> = {
  command: "bootstrap [type]",
  aliases: ["b"],
  describe: "Bootstrap a new Inferable project",
  builder: (yargs) =>
    yargs
      .positional("type", {
        describe: "Project type to create",
        type: "string",
        choices: ["node", "go", "dotnet", "proxy"],
        demandOption: false,
      })
      .option("dir", {
        describe: "Directory to create the application in",
        type: "string",
        demandOption: false,
      })
      .option("no-cluster", {
        describe: "Do not provision a new cluster",
        type: "boolean",
        demandOption: false,
      }),
  handler: async ({
    dir: providedDir,
    type: providedType,
    "no-cluster": noCluster,
  }) => {
    const { type } = providedType
      ? { type: providedType }
      : await inquirer.prompt([
          {
            type: "list",
            name: "type",
            message: "What type of project would you like to create?",
            choices: Object.keys(projectMap),
            default: providedType,
          },
        ]);

    const { cluster } =
      noCluster === undefined
        ? await inquirer.prompt([
            {
              type: "confirm",
              name: "cluster",
              message: "Would you like to provision a new cluster?",
              default: true,
            },
          ])
        : { cluster: !noCluster };

    const { dir } =
      providedDir === undefined
        ? await inquirer.prompt([
            {
              type: "input",
              name: "dir",
              message: "Where would you like to create the project?",
              default:
                providedDir ||
                `inferable-app-${crypto.randomBytes(5).toString("hex")}`,
            },
          ])
        : { dir: providedDir };

    const proxyRepo = projectMap[type];
    console.log(`Downloading ${proxyRepo.url}...`);
    await downloadProject(proxyRepo.url, proxyRepo.ref, dir);

    if (cluster) {
      if (!getToken()) {
        console.log(
          "To prevent abuse to our systems, we request that users verify their email address. Press Enter to continue...",
        );

        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        try {
          await new Promise<void>((resolve) => {
            rl.question("", () => {
              resolve();
            });
          });
        } finally {
          rl.close();
        }

        await startTokenFlow();
      }

      console.log("Creating Cluster... ");

      const newCluster = await createCluster({
        description: `CLI Created Cluster at ${new Date().toISOString()}`,
      });

      if (!newCluster) {
        console.log("Failed to create cluster");
        process.exit(1);
      }

      console.log("Cluster created with ID:", newCluster?.id);

      console.log("Creating API key...");

      const newApiKey = await createApiKey(
        newCluster?.id,
        `CLI Created API Key`,
      );

      if (!newApiKey) {
        console.log("Failed to create API key");
        process.exit(1);
      }

      const envFile = path.resolve(dir, ".env");

      await appendFile(envFile, `INFERABLE_API_SECRET=${newApiKey.key}\n`);
      await appendFile(envFile, `INFERABLE_CLUSTER_ID=${newCluster.id}\n`);

      console.log("API Key created with ID:", newApiKey?.id);
    }

    switch (type) {
      case "proxy":
      case "node":
        console.log("Installing dependencies...");
        try {
          await execAsync("npm install", { cwd: dir });
          console.log(`✅ Inferable ${type} project created in ${dir}`);
        } catch (error) {
          console.error("❌ Failed to install dependencies:", error);
          process.exit(1);
        }
        break;
      case "go":
        console.log("Installing dependencies...");
        try {
          await execAsync("go mod tidy", { cwd: dir });
        } catch (error) {
          console.error("❌ Failed to install dependencies:", error);
          process.exit(1);
        }
        break;
    }
  },
};
