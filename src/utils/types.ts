import z from 'zod'
import { Result, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'

export type ToolHandlers = Record<string, (request: z.infer<typeof CallToolRequestSchema>) => Promise<Result>>