import "dotenv/config";
import * as sdk from "matrix-js-sdk";
import { RoomEvent, ClientEvent } from "matrix-js-sdk";
import { env } from "process";
import * as fs from "fs";
import * as path from "path";
// Import the handler registry
import { getHandlers, getHandlersForType } from "./handlers";

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

const { homeserver, access_token, userId, whatsAppRoomId } = env;

const client = sdk.createClient({
  baseUrl: homeserver,
  accessToken: access_token,
  userId,
});

const start = async () => {
  await client.startClient();

  client.once(ClientEvent.Sync, async (state, prevState, res) => {
    // state will be 'PREPARED' when the client is ready to use
    console.log(state);
  });

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

      if (event.event.room_id !== whatsAppRoomId) {
        return; // don't activate unless in the active room
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
