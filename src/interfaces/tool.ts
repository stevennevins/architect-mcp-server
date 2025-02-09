import { z } from 'zod';

export interface ToolMetadata {
    name: string;
    description: string;
    schema: z.ZodSchema;
}

export interface Tool {
    getMetadata(): ToolMetadata;
}

export interface DataProcessor extends Tool {
    processInput(input: unknown): Promise<string>;
}