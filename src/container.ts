import { Tool } from './interfaces/tool.js';

export class Container {
    private tools: Map<string, Tool>;

    constructor() {
        this.tools = new Map();
    }

    register(service: Tool): void {
        const metadata = service.getMetadata();
        this.tools.set(metadata.name, service);
    }

    get(name: string): Tool {
        const service = this.tools.get(name);
        if (!service) {
            throw new Error(`Tool not found: ${name}`);
        }
        return service;
    }

    getAll(): Tool[] {
        return Array.from(this.tools.values());
    }
}