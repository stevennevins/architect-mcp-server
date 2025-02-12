#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { log } from './utils/helpers.js'
import { ARCHITECT_TOOLS, ARCHITECT_HANDLERS } from './tools/architect.js'
import { version } from './utils/version.js'

// Handle process events
process.on('uncaughtException', (error) => {
  log('Uncaught exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (error) => {
  log('Unhandled rejection:', error)
  process.exit(1)
})

// Combine all tools
const ALL_TOOLS = [...ARCHITECT_TOOLS]
const ALL_HANDLERS = { ...ARCHITECT_HANDLERS }

// Create server
const server = new Server(
  { name: 'mcp-server-template', version },
  { capabilities: { tools: {} } }
)

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  log('Received list tools request')
  return { tools: ALL_TOOLS }
})

// Handle tool calls with simplified logic
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name
  log('Received tool call:', toolName)

  try {
    const handler = ALL_HANDLERS[toolName]
    if (!handler) {
      throw new Error(`Unknown tool: ${toolName}`)
    }
    return await handler(request)
  } catch (error) {
    log('Error handling tool call:', error)
    return {
      toolResult: {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      },
    }
  }
})

// Start server
export async function main() {
  log('Starting server...')
  try {
    const transport = new StdioServerTransport()
    log('Created transport')
    await server.connect(transport)
    log('Server connected and running')
  } catch (error) {
    log('Fatal error:', error)
    process.exit(1)
  }
}

main()