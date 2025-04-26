import * as sdk from "matrix-js-sdk";
import { ClientEvent, Preset } from "matrix-js-sdk";
const { access_token, homeserver, userId } = process.env;

// Create a Matrix client instance
export const client = sdk.createClient({
  baseUrl: homeserver,
  accessToken: access_token,
  userId,
});

// Initialize the client (call this once at startup)
export const initClient = async () => {
  await client.startClient();

  return new Promise<void>((resolve) => {
    client.once(ClientEvent.Sync, (state, prevState, res) => {
      console.log(state);
      if (state === 'PREPARED') {
        resolve();
      }
    });
  });
};

export const sendEvent = (roomId: string, content: any, type: string) => {
  return fetch(`${homeserver}/_matrix/client/v3/rooms/${roomId}/send/${type}`, {
    method: "POST",
    body: JSON.stringify(content),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });
};

export const sendMessage = (roomId: string, message: string, context = {}) => {
  return sendEvent(
    roomId,
    {
      body: message,
      msgtype: "m.text",
      context,
    },
    "m.room.message"
  );
};

export const getEvent = async (roomId: string, eventId: string) => {
  const response = await fetch(
    `${homeserver}/_matrix/client/v3/rooms/${roomId}/event/${eventId}`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return response.json();
};

export const getRoomEvents = (roomId: string) => {
  return fetch(
    `${homeserver}/_matrix/client/v3/rooms/${roomId}/messages?limit=10000&dir=b`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
};

export const redactEvent = async (
  roomId: string,
  eventId: string,
  redactionReason: string
) => {
  const txn = Date.now();

  return fetch(
    `${homeserver}/_matrix/client/v3/rooms/${roomId}/redact/${eventId}/${txn}`,
    {
      method: "PUT",
      body: JSON.stringify({
        reason: redactionReason,
      }),
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
};

export const createRoom = async (name: string, recipients: string[]): Promise<string> => {
  const response = await fetch(`${homeserver}/_matrix/client/v3/createRoom`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`
    },
    body: JSON.stringify({
      preset: Preset.TrustedPrivateChat,
      invite: recipients,
      is_direct: true,
      initial_state: [
        {
          type: "m.room.name",
          content: {
            name: name
          }
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to create room: ${response.statusText}`);
  }

  //return (await response.json())?.room_id;
  return "room_id"; // TODO: fixup
};

export async function findDirectMessageRoom(userId: string): Promise<string | null> {
  // Get all rooms the bot is in
  const rooms = client.getRooms();
  console.log("Rooms: ", rooms);
  
  // Find a direct message room with this user
  for (const room of rooms) {
    // Check if this is a direct message room
    const isDM = true; //const isDM = room.getMembers().length === 2;
    
    if (isDM && room.getMember(userId)) {
      return room.roomId;
    }
  }
  
  // If no existing DM room found, create one
  try {
    const dmRoom = await client.createRoom({
      preset: Preset.TrustedPrivateChat,
      invite: [userId],
      is_direct: true
    });
    return dmRoom.room_id;
  } catch (error) {
    console.error("Error creating DM room:", error);
    return null;
  }
}