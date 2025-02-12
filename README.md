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

The template includes a built-in TestClient for local testing and the MCP Inspector for visual debugging.

### Using TestClient

The TestClient provides a simple way to test your tools:

```typescript
import { TestClient } from "./utils/TestClient";

describe("YourTool", () => {
  const client = new TestClient();

  it("should process data correctly", async () => {
    await client.assertToolCall(
      "your-tool-name",
      { input: "test" },
      (result) => {
        expect(result.toolResult.content).toBeDefined();
      }
    );
  });
});
```

### Using MCP Inspector

The template includes the MCP Inspector for visual debugging of your tools:

1. Start the inspector:

   ```bash
   npx @modelcontextprotocol/inspector node dist/index.js
   ```

2. Open the inspector UI at <http://localhost:5173>

The inspector provides:

- Visual interface for testing tools
- Real-time request/response monitoring
- Tool metadata inspection
- Interactive testing environment

### Local Testing with Cursor

To test your MCP server locally with Cursor:

1. Build and link the package:

   ```bash
   npm run build
   npm run link
   ```

2. Verify the binary works:

   ```bash
   npx architect-test-mcp-tool
   ```

3. Add the server to Cursor:

   - Open Cursor settings
   - Navigate to the Features tab
   - Scroll down to MCP Servers section
   - Click "Add Server"
   - Select "Command" type
   - Give it a name (e.g., "Local Example Tool")
   - Enter the command: `npx architect-test-mcp-tool`
   - Click Confirm

4. Verify the server starts correctly in Cursor by checking the MCP Servers section shows your server as running.

Note: If you make changes to your code, remember to rebuild and relink:

```bash
npm run build
npm run link
```

When you're done testing, you can unlink the package:

```bash
npm run unlink
```

This will remove the global symlink created during development.

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
