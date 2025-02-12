import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { log } from '../utils/helpers.js'
import { ToolHandlers } from '../utils/types.js'
import z from 'zod'
import { execa } from 'execa'
import commandExists from 'command-exists'
import { ToolResult } from '../utils/TestClient.js'

// Define input validation schema using zod
const architectInputSchema = z.object({
    input: z.string().min(1, 'Input must not be empty'),
    conversationId: z.string().optional()
});

// Tool definition
const ARCHITECT_TOOL: Tool = {
    name: 'architect',
    description: 'MCP server for the LLM Architect tool. Exposes resource "/llm-architect/chat" accepting POST requests with a prompt and optional conversationId, and interacts with the llm chat CLI to provide architectural design feedback while maintaining conversation context.',
    inputSchema: {
        type: 'object',
        properties: {
            input: {
                type: 'string',
                description: 'Input prompt to process',
                minLength: 1
            },
            conversationId: {
                type: 'string',
                description: 'Optional conversation ID for context',
                nullable: true
            }
        },
        required: ['input']
    }
};

// Export tools
export const ARCHITECT_TOOLS = [ARCHITECT_TOOL];

async function executeCommand(args: string[], input?: string): Promise<string> {
    log('Executing command', { args, input });
    try {
        const result = await execa('llm', args, input ? { input, env: process.env } : { env: process.env });
        const output = result.stdout.trim();
        log('Command output', output);
        if (!output) {
            throw new Error('Command failed to return a response');
        }
        return output;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to execute LLM command: ${errorMessage}`);
    }
}

// Helper function to get the latest conversation ID
async function getLatestConversationId(): Promise<string> {
    log('Getting latest conversation ID');
    const output = await executeCommand(['logs', '--current', '--json']);
    let logs;
    try {
        logs = JSON.parse(output);
    } catch (e) {
        throw new Error('Failed to parse logs JSON');
    }

    if (!Array.isArray(logs) || logs.length === 0 || !logs[0]?.conversation_id) {
        throw new Error('No valid conversation ID found in logs');
    }
    const conversationId = logs[0].conversation_id;
    log('Found conversation ID', conversationId);
    return conversationId;
}

// Helper function to handle conversation logic
async function handleConversation(cleanedInput: string, conversationId?: string): Promise<{ conversationId: string, response: string }> {
    log('Handling conversation', { cleanedInput, conversationId });
    if (conversationId) {
        const response = await executeCommand(['prompt', '--conversation', conversationId, '--no-stream'], cleanedInput);
        log('Continued conversation response', response);
        return { conversationId, response };
    } else {
        const response = await executeCommand(['prompt', '--no-stream'], cleanedInput);
        const newConversationId = await getLatestConversationId();
        log('New conversation created', { response, newConversationId });
        return { conversationId: newConversationId, response };
    }
}

// Main processing function for architect
async function handleArchitectProcess(input: string, conversationId?: string): Promise<{ conversationId: string, response: string }> {
    const cleanedInput = input.replace(/\n/g, ' ').trim();
    return await handleConversation(cleanedInput, conversationId);
}

// Export handlers
export const ARCHITECT_HANDLERS: ToolHandlers = {
    'architect': async (request): Promise<ToolResult> => {
        try {
            const { input, conversationId } = request.params.arguments as { input: string, conversationId?: string };
            // Validate input using zod
            architectInputSchema.parse({ input, conversationId });

            // Ensure the 'llm' command exists
            if (!(await commandExists('llm'))) {
                throw new Error('LLM command not found. Please ensure it is installed and in your PATH.');
            }
            const result = await handleArchitectProcess(input, conversationId);
            return {
                toolResult: {
                    content: [{ type: 'text', text: JSON.stringify({ conversationId: result.conversationId, response: result.response }) }],
                }
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to process input: ${errorMessage}`);
        }
    }
};