# MCP Server Template
[![smithery badge](https://smithery.ai/badge/@stevennevins/mcp-server-template)](https://smithery.ai/server/@stevennevins/mcp-server-template)

A template for creating Model Context Protocol (MCP) servers in TypeScript. This template provides a solid foundation for building MCP-compatible servers with proper tooling, type safety, and best practices.

## Features

- 🚀 Full TypeScript support
- 🏗️ Container-based dependency injection
- 📦 Service-based architecture with DataProcessor interface
- 🛠️ Example tool implementation with tests
- 🧪 Vitest testing framework
- 📝 Type definitions
- 🔌 MCP SDK integration

## Getting Started

### Installing via Smithery

To install MCP Server Template for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@stevennevins/mcp-server-template):

```bash
npx -y @smithery/cli install @stevennevins/mcp-server-template --client claude
```

### Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server with hot reload:

   ```bash
   npm run dev
   ```

3. Build the project:

   ```bash
   npm run build
   ```

4. Run tests:

   ```bash
   npm test
   ```

5. Start the production server:

   ```bash
   npm start
   ```

## Project Structure

```
src/
├── index.ts          # Entry point
├── server.ts         # MCP server configuration
├── container.ts      # Dependency injection container
├── interfaces/       # Interface definitions
│   └── tool.ts      # DataProcessor interface
└── tools/           # Tool implementations
    └── example.ts   # Example tool
```

## Creating Tools

1. Implement the DataProcessor interface:

   ```typescript
   import { DataProcessor } from "../interfaces/tool";

   export class MyTool implements DataProcessor {
     getMetadata() {
       return {
         name: "my-tool",
         description: "Description of my tool",
       };
     }

     async processInput(args: any): Promise<string> {
       // Implement your tool logic here
       return "Result";
     }
   }
   ```

2. Register your tool in the container:

   ```typescript
   // In server.ts
   import { MyTool } from "./tools/my-tool";

   container.register(new MyTool());
   ```

The server will automatically:

- List your tool in the available tools
- Handle input validation
- Process requests to your tool
- Format responses according to the MCP protocol

## Testing

The template includes Vitest for testing. Check `example.test.ts` for a sample test implementation:

```typescript
import { describe, it, expect } from "vitest";
import { YourTool } from "./tools/your-tool";

describe("YourTool", () => {
  it("should process data correctly", async () => {
    const tool = new YourTool();
    const result = await tool.processData({ input: "test" });
    expect(result).toBeDefined();
  });
});
```

## Container Pattern

The template uses a simple dependency injection container that:

- Manages tool instances
- Provides easy registration of new tools
- Handles tool retrieval by name
- Ensures single instance per tool
