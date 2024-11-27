## inferable.ai CLI

## Installation

```bash
npm install -g @inferable/cli
```

This will make the `inf` command available globally.

Alternatively, use the CLI with `npx`:

```bash
npx @inferable/cli <cmd>
```

## Usage

### Authentication

To authenticate the CLI, run `inf auth login`.
This will open a browser and prompt you to login to the Inferable console.

### Commands

- **inf clusters**: Manage Inferable clusters.

  - `create`: Create a new cluster.
  - `list`: List all clusters.
  - `info`: Show details of a cluster.
  - `open`: View a cluster in the browser.

- **inf runs**: Manage runs associated with your clusters.

  - `create`: Create a new run and follow its progress.
  - `list`: List runs within a cluster.
  - `info`: Display information about a specific run.
  - `open`: View a run in the browser.

- **inf auth**: Authenticate with the Inferable API.

  - `login`: Start the authentication process.
  - `keys`: Manage API keys.
    - `list`: List all API keys for a cluster.
    - `revoke`: Revoke a specific API key.
    - `create`: Create a new API key.

- **ing generate**: Generate functions for GraphQL and OpenAPI schemas.

  - `graphql`: Generate functions from a GraphQL schema.
  - `openapi`: Generate functions from an OpenAPI schema.

- **inf cli**: Manage the Inferable CLI itself.

  - `update`: Update the Inferable CLI.

- **inf app**: Open the Inferable app in a browser.

Use `inf <cmd> --help` to get details for a specific command.

## Local Development

All commands can be run with tsx:

```bash
tsx src/index.ts <cmd>
tsx src/index.ts auth login
```
