import { Tool, ToolMetadata, DataProcessor } from '../interfaces/tool.js';
import { execa } from 'execa';
import commandExists from 'command-exists';
import { z } from 'zod';

interface ArchitectResponse {
    conversationId: string;
    response: string;
}

const architectInputSchema = z.object({
    input: z.string().min(1, 'Input must not be empty'),
    conversationId: z.string().optional()
});

export class Architect implements DataProcessor {
    private async executeCommand(args: string[], input?: string): Promise<string> {
        console.log('Executing command:', { args, input });
        try {
            const result = await execa('llm', [...args], input ? {
                input,
                env: process.env
            } : {
                env: process.env
            });

            const output = result.stdout.trim();
            console.log('Command output:', output);

            if (!output) {
                throw new Error('Command failed to return a response');
            }

            return output;
        } catch (error) {
            return this.handleError('Failed to execute LLM command', error);
        }
    }

    private async getLatestConversationId(): Promise<string> {
        console.log('Getting latest conversation ID');
        const output = await this.executeCommand(['logs', '--current', '--json']);
        const logs = JSON.parse(output);
        console.log('Parsed logs:', logs);

        if (!Array.isArray(logs) || logs.length === 0 || !logs[0]?.id) {
            throw new Error('No valid conversation ID found in logs');
        }

        console.log('Found conversation ID:', logs[0].conversation_id);
        return logs[0].conversation_id;
    }

    private handleError(message: string, error: unknown): never {
        console.error(`${message}:`, error);
        throw new Error(`${message}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    private async handleConversation(input: string, conversationId?: string): Promise<ArchitectResponse> {
        const cleanedInput = input.replace(/\n/g, ' ').trim();
        console.log('Handling conversation:', { cleanedInput, conversationId });

        try {
            if (conversationId) {
                // For continued conversations, send the input with the conversation ID
                const response = await this.executeCommand(['prompt', '--conversation', conversationId, '--no-stream'], cleanedInput);
                console.log('Continued conversation response:', response);
                return { conversationId, response };
            } else {
                // For new conversations, first send the input
                const response = await this.executeCommand(['prompt', '--no-stream'], cleanedInput);
                // Then get the conversation ID from the current conversation
                const newConversationId = await this.getLatestConversationId();
                console.log('New conversation created:', { response, newConversationId });
                return { conversationId: newConversationId, response };
            }
        } catch (error) {
            console.error('Conversation error:', error);
            throw error; // Let the error propagate up
        }
    }

    getMetadata(): ToolMetadata {
        return {
            name: 'architect',
            description: 'MCP server for the LLM Architect tool. Exposes resource "/llm-architect/chat" accepting POST requests with a prompt and optional conversationId, and interacts with the llm chat CLI to provide architectural design feedback while maintaining conversation context.',
            schema: architectInputSchema
        };
    }

    async processInput(input: unknown): Promise<string> {
        console.log('Processing input:', input);

        if (!(await commandExists('llm'))) {
            throw new Error('LLM command not found. Please ensure it is installed and in your PATH.');
        }

        const parsed = architectInputSchema.parse(input);

        try {
            const result = await this.handleConversation(parsed.input, parsed.conversationId);
            console.log('Process result:', result);

            return JSON.stringify({
                content: [{
                    type: "text",
                    text: result.response,
                    conversationId: result.conversationId
                }]
            });
        } catch (error) {
            console.error('Process error:', error);
            throw error;
        }
    }
}