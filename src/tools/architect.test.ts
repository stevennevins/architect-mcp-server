import { MCPTestClient } from 'mcp-test-client';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('architect', () => {
    let client: MCPTestClient;

    beforeAll(async () => {
        client = new MCPTestClient({
            serverCommand: 'tsx',
            serverArgs: ['src/index.ts'],
        });
        await client.init();
    });

    afterAll(async () => {
        await client.cleanup();
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

    it('should execute command and clean input', async () => {
        // First make a call to get a valid conversation ID
        const firstCall = await client.callTool('architect', { input: 'initial message' });
        const response = JSON.parse(firstCall.content[0].text);
        const conversationId = response.content[0].conversationId;
        expect(response.content[0].text).toBeTruthy();
        console.log(conversationId);
        expect(conversationId).not.toBeNull();
    });

    it('should use provided conversation ID', async () => {
        // First make a call to get a valid conversation ID
        const firstCall = await client.callTool('architect', { input: 'initial message' });
        const firstResponse = JSON.parse(firstCall.content[0].text);
        const conversationId = firstResponse.content[0].conversationId;

        console.log(firstResponse)

        expect(firstResponse.content[0].text).toBeTruthy();
        expect(conversationId).toBeTruthy();
        console.log('First conversation ID:', conversationId);

        // Use that conversation ID in a subsequent call
        const secondCall = await client.callTool('architect', {
            input: 'follow up message',
            conversationId
        });

        const secondResponse = JSON.parse(secondCall.content[0].text);
        console.log('Second response:', secondResponse);

        expect(secondResponse.content[0].text).toBeTruthy();
        expect(secondResponse.content[0].conversationId).toBe(conversationId);
    }, { timeout: 10000 });

    it('should handle invalid conversation IDs', async () => {
        await expect(
            client.callTool('architect', {
                input: 'test message',
                conversationId: 'invalid-id'
            })
        ).rejects.toThrow();
    });

    it('should reject empty input', async () => {
        await expect(
            client.callTool('architect', { input: '' })
        ).rejects.toThrow();
    });

    it('should reject missing input', async () => {
        await expect(
            client.callTool('architect', {})
        ).rejects.toThrow('Required');
    });
});