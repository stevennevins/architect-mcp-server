#!/usr/bin/env node
import { startServer } from './server.js';

startServer().catch((error: Error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});