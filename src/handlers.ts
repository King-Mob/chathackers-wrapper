import { v4 as uuidv4 } from 'uuid';

// Define the handler interface for inputs
export interface HandlerInput {
  type: string;
  handle: (event: any) => Promise<void> | void;
}

// Define the handler interface to use internally
export interface EventHandler {
  toolId: string;
  type: string;
  handle: (event: any) => Promise<void> | void;
}

export interface Tool {
  name: string;
  description: string;
  id: string;
  handlers: HandlerInput[];
};

// Create a registry for handlers
const tools: Tool[] = [];
const handlers: EventHandler[] = [];

/**
 * Register a new event handler
 * @param type The event type to handle (e.g., "m.room.message")
 * @param handler The function to handle the event
 */
export function registerTool(toolname: string, description: string, handlerInputs: HandlerInput[]): void {
  // save the tool in the list of tools, along with a unique id
  const tool: Tool = {
    name: toolname,
    description: description,
    id: uuidv4(),
    handlers: handlers
  };
  tools.push(tool);
  // save the handler in the list of handlers, along with the tool id
  for (const handlerInput of handlerInputs) {
    const handler: EventHandler = {
      toolId: tool.id,
      type: handlerInput.type,
      handle: handlerInput.handle
    };
    handlers.push(handler);
  }
}

/**
 * Get all registered handlers
 */
export function getHandlers(): EventHandler[] {
  return handlers;
}

/**
 * Get handlers for a specific event type
 */
export function getHandlersForType(type: string): EventHandler[] {
  return handlers.filter(handler => handler.type === type);
} 