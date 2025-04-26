// Define the handler interface
export interface EventHandler {
  type: string;
  handle: (event: any) => Promise<void> | void;
}

// Create a registry for handlers
const handlers: EventHandler[] = [];

/**
 * Register a new event handler
 * @param type The event type to handle (e.g., "m.room.message")
 * @param handler The function to handle the event
 */
export function registerHandler(type: string, handler: (event: any) => Promise<void> | void): void {
  handlers.push({ type, handle: handler });
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