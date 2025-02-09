import { z } from 'zod';
import { DataProcessor, ToolMetadata } from '../interfaces/tool.js';

const schema = z.object({
  input: z.string().min(1, "Input must not be empty"),
});

export class Example implements DataProcessor {
  private metadata: ToolMetadata = {
    name: "example-tool",
    description: "An example tool that processes input data",
    schema,
  };

  getMetadata(): ToolMetadata {
    return this.metadata;
  }

  async processInput(input: unknown): Promise<string> {
    const { input: validatedInput } = schema.parse(input);
    return `Processed: ${validatedInput}`;
  }
}