const { access_token, homeserver } = process.env;

export const getSync = async (batch: string | null) => {
  const syncResponse = await fetch(`${homeserver}/_matrix/client/v3/sync?timeout=30000${batch ? `&since=${batch}` : ""}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
  const syncResult = await syncResponse.json();

  return syncResult;
}

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

export const joinRoom = async (roomId: string) => {
  return fetch(
    `${homeserver}/_matrix/client/v3/rooms/${roomId}/join`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
}

/*
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
}*/

export const getProfile = async (userId: string) => {
  return fetch(`${homeserver}/_matrix/client/v3/profile/${userId}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};