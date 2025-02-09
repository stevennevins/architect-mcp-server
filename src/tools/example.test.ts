import { MCPTestClient } from 'mcp-test-client';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('example-tool', () => {
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
                name: 'example-tool',
                description: 'An example tool that processes input data',
            })
        );
    });

    it('should process valid input', async () => {
        await client.assertToolCall(
            'example-tool',
            { input: 'test data' },
            (result) => {
                expect(result.content[0].text).toBe('Processed: test data');
            }
        );
    });

    it('should reject empty input', async () => {
        await expect(
            client.callTool('example-tool', { input: '' })
        ).rejects.toThrow('Input must not be empty');
    });

    it('should reject missing input', async () => {
        await expect(
            client.callTool('example-tool', {})
        ).rejects.toThrow('Required');
    });
});