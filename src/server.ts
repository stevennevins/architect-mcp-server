import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { Example } from './tools/example.js';
import { Container } from './container.js';
import { DataProcessor } from './interfaces/tool.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const container = new Container();
container.register(new Example());

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
      inputSchema: {
        type: "object",
        properties: {
          input: {
            type: "string",
            description: "The input data to process",
          },
        },
        required: ["input"],
      },
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