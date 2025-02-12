import { TestClient } from '../utils/TestClient.js';
import { describe, it, expect, beforeAll } from 'vitest';
import { ArchitectToolResponse } from './architect.js';

describe('architect', () => {
    let client: TestClient;

    beforeAll(() => {
        client = new TestClient();
    });

    it('should be available in tools list', async () => {
        const tools = await client.listTools();
        expect(tools).toContainEqual(
            expect.objectContaining({
                name: 'architect',
                description: 'MCP server for the LLM Architect tool. Exposes resource "/llm-architect/chat" accepting POST requests with a prompt and optional conversationId, and interacts with the llm chat CLI to provide architectural design feedback while maintaining conversation context.',
            })
        );
    });

    it('should process valid input', async () => {
        const result = (await client.callTool('architect', { input: 'test prompt' })) as ArchitectToolResponse;
        expect(result.toolResult.content[0]).toEqual({
            type: 'text',
            text: expect.any(String)
        });
        const parsed = JSON.parse(result.toolResult.content[0].text);
        expect(parsed.conversationId).toBeTruthy();
        expect(parsed.response).toEqual(expect.any(String));
    });

    it('should reject empty input', async () => {
        await expect(
            client.callTool('architect', { input: '' })
        ).rejects.toThrow('Input must not be empty');
    });

    it('should reject missing input', async () => {
        await expect(
            client.callTool('architect', {})
        ).rejects.toThrow();
    });
});