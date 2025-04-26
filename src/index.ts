import "dotenv/config";
import { RoomEvent } from "matrix-js-sdk";
import { env } from "process";
import * as fs from "fs";
import * as path from "path";
// Import the handler registry
import { getHandlers, getHandlersForType } from "./handlers";
import { client, initClient } from "./matrixClientRequests";

// Dynamically import all handlers from the handlers directory
const handlersDir = path.join(__dirname, 'handlers');
if (fs.existsSync(handlersDir)) {
  fs.readdirSync(handlersDir)
    .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
    .forEach(file => {
      // This will execute the handler files, which will register themselves
      require(path.join(handlersDir, file));
      console.log(`Loaded handler: ${file}`);
    });
}

const { userId } = env;

const start = async () => {
  // Initialize the Matrix client
  await initClient();

  const scriptStart = Date.now();

  client.on(
    RoomEvent.Timeline,
    async function (event, room, toStartOfTimeline) {
      const eventTime = event.event.origin_server_ts;

      if (scriptStart > eventTime) {
        return; //don't run commands for old messages
      }

      if (event.event.sender === userId) {
        return; // don't reply to messages sent by the tool
      }

      // Get the appropriate handler for this event type
      const handlers = getHandlersForType(event.event.type);
      if (handlers) {
        console.log(`Found ${handlers.length} handlers for event type ${event.event.type}`);
        for (const handler of handlers) {
          console.log(handler.type);
          await handler.handle(event);
        }
      }
    }
  );
};

start().catch(err => {
  console.error("Error starting client:", err);
});
