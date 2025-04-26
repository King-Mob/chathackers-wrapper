import { sendMessage, findDirectMessageRoom } from "../matrixClientRequests";
import { registerTool } from "../handlers";
import { tools } from "../handlers"; // You'll need to export tools from handlers.ts

// Function to send welcome message to user in 1:1 chat
const sendWelcomeMessage = async (userId: string) => {
  try {
    // Find the 1:1 room with this user
    // This would need to be implemented in matrixClientRequests.ts
    const dmRoomId = await findDirectMessageRoom(userId);
    
    if (!dmRoomId) {
      console.log(`No DM room found with user ${userId}`);
      return;
    }
    
    // Send welcome message
    sendMessage(
      dmRoomId,
      "👋 Thanks for adding me to a group! Here are the tools I can provide:"
    );
    
    // Send each tool as a separate message
    for (const tool of tools) {
      sendMessage(
        dmRoomId,
        `**${tool.name}**: ${tool.description}`
      );
    }
    
    sendMessage(
      dmRoomId,
      "To use a tool, just mention its name in the group chat."
    );
  } catch (error) {
    console.error("Error sending welcome message:", error);
  }
};

// Handler for when bot is added to a room
const handleBotAdded = async (event) => {
  // Check if this is a membership event for the bot
  if (
    event.event.type === "m.room.member" && 
    event.event.state_key === process.env.userId
  ) {
    console.log("Bot added to room");

    // Get the user who added the bot
    const inviterId = event.event.sender;
    console.log("Inviter ID: ", inviterId);
    // Send welcome message to the user who added the bot
    await sendWelcomeMessage(inviterId);
  }
};

// Register the tool
registerTool(
  "welcome",
  "Sends welcome messages when added to a group",
  [
    {
      type: "m.room.member",
      handle: handleBotAdded
    }
  ]
); 