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

## Prerequisites

### LLM CLI Installation

This project requires the LLM CLI to be installed. You can install it using Homebrew:

```bash
brew install llm
```

After installation, ensure the `llm` command is available in your PATH by running:

```bash
llm --version
```

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

## Architect Tool

The Architect tool (`src/tools/architect.ts`) provides an interface to interact with the LLM CLI for architectural design feedback. It maintains conversation context and handles the communication between your application and the LLM CLI.

### Features

- Maintains conversation context across multiple interactions
- Handles command execution through the LLM CLI
- Provides error handling and logging
- Supports both new conversations and continued discussions

### Usage

The Architect tool accepts POST requests to `/llm-architect/chat` with the following payload:

```json
{
  "input": "Your architectural question or prompt",
  "conversationId": "optional-conversation-id"
}
```

Example response:

```json
{
  "content": [
    {
      "type": "text",
      "text": "LLM's response",
      "conversationId": "conversation-id"
    }
  ]
}
```

### Requirements

- The LLM CLI must be installed and available in your PATH (see Prerequisites section)
- Environment variables should be properly configured for the LLM CLI

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

## Troubleshooting

### Using MCP Inspector

The MCP Inspector is a helpful tool for debugging and inspecting your MCP server. To use it:

1. First, build your project:

   ```bash
   npm run build
   ```

2. Run the inspector:
   ```bash
   npx @modelcontextprotocol/inspector node dist/index.js
   ```

The inspector provides a web interface that allows you to:

- View all available tools and their schemas
- Test tool calls interactively
- Inspect request/response payloads
- Debug communication issues between your server and clients

Common issues and solutions:

- If you see "Connection refused", ensure your server is running and listening on the correct port
- If tools aren't showing up, verify they're properly registered in the container
- For schema validation errors, check that your tool's input/output matches the declared schema

For more detailed debugging, you can run the server with debug logs:

```bash
DEBUG=mcp* node dist/index.js
```
