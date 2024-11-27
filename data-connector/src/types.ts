import type { ContextInput, Inferable } from "inferable";

export interface DataConnector {
  getContext(): Promise<any[]>;
  executeQuery(input: { query: string }, ctx: ContextInput): Promise<any>;
  createService(client: Inferable): any;
}
