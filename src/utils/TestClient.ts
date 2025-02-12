import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { ARCHITECT_TOOLS, ARCHITECT_HANDLERS } from '../tools/architect.js'

export type ToolResult = {
    toolResult: {
        content: Array<{ type: string; text: string }>
    }
}

export class TestClient {
    private tools: Tool[]
    private handlers: Record<string, Function>

    constructor() {
        this.tools = ARCHITECT_TOOLS
        this.handlers = ARCHITECT_HANDLERS
    }

    async listTools(): Promise<Tool[]> {
        return this.tools
    }

    async callTool(toolName: string, args: Record<string, unknown>): Promise<ToolResult> {
        const handler = this.handlers[toolName]
        if (!handler) {
            throw new Error(`Tool ${toolName} not found`)
        }

        return handler({ params: { arguments: args } })
    }
}