import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { Architect } from './tools/architect.js';
import { Container } from './container.js';
import { DataProcessor } from './interfaces/tool.js';
import { createRequire } from 'module';
import { zodToJsonSchema } from 'zod-to-json-schema';
const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const container = new Container();
container.register(new Architect());

const server = new Server(
  { name: "mcp-server", version },
  { capabilities: { tools: {} } }
);

// Register available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: container.getAll().map(tool => {
    const metadata = tool.getMetadata();
    return {
      name: metadata.name,
      description: metadata.description,
      inputSchema: zodToJsonSchema(metadata.schema),
    };
  }),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const service = container.get(name) as DataProcessor;
    const result = await service.processInput(args);
    return { content: [{ type: "text", text: result }] };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Tool execution failed: ${error.message}`);
    }
    throw error;
  }
});

export async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("MCP server started");
}