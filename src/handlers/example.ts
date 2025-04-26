import { v4 as uuidv4 } from "uuid";
import { sendMessage, getEvent } from "../matrixClientRequests";
import { PERSON_NAME, ROLE_NAME, PSEUDO_STATE_EVENT_TYPE } from "../constants";
import { getPseudoState, setPseudoState } from "../pseudoState";
import { registerTool } from "../handlers";

const { userId } = process.env;

// ===== SHARED FUNCTIONS =====

const assignRole = async (
  personName: string,
  roomId: string,
  roleName: string
) => {
  let roleState = await getPseudoState(roomId, PSEUDO_STATE_EVENT_TYPE);

  if (!roleState) {
    roleState = {
      content: {
        assignedRoles: [],
      },
    };
  }

  const { assignedRoles } = roleState.content;
  assignedRoles.push({
    id: uuidv4(),
    person: {
      name: personName,
    },
    role: {
      name: roleName,
    },
  });

  setPseudoState(roomId, PSEUDO_STATE_EVENT_TYPE, { assignedRoles });

  sendMessage(roomId, `You've assigned ${personName} the role ${roleName}.`);
};

const showAssignedRoles = async (roomId: string) => {
  sendMessage(roomId, "Here are the current people with roles:");

  const roleState = await getPseudoState(roomId, PSEUDO_STATE_EVENT_TYPE);

  if (!roleState) {
    sendMessage(roomId, "There are no roles currently assigned.");
    return;
  }

  roleState.content.assignedRoles.forEach((assignedRole) => {
    sendMessage(
      roomId,
      `${assignedRole.person.name} has the role ${assignedRole.role.name}. React with 🙏 to remove this role`,
      {
        ...assignedRole,
      }
    );
  });
};

// ===== MESSAGE HANDLING =====

const hello = async (roomId: string) => {
  sendMessage(
    roomId,
    `🤖Example Tool🤖: Hello I'm the matrix example tool. 
    I track who has been assigned roles in this group. 
    React to this message with:\n
    ❤️ to see the current assigned roles\n
    👍 to assign a role to someone`
  );
};

const sendPersonRequest = (roomId: string, replyText: string) => {
  sendMessage(
    roomId,
    `Quote-reply to this message with the name of the role you want to assign to ${replyText}.`,
    {
      person: {
        name: replyText,
      },
      expecting: ROLE_NAME,
    }
  );
};

const handleReply = async (event) => {
  const roomId = event.event.room_id;
  const message = event.event.content.body;
  const replyText = message.split("\n\n")[1] || message;
  const prevEventId =
    event.event.content["m.relates_to"]["m.in_reply_to"].event_id;

  const prevEvent = (await getEvent(roomId, prevEventId)) as any;

  if (prevEvent.sender !== userId) return;

  const { expecting } = prevEvent.content.context;

  if (expecting === PERSON_NAME) {
    sendPersonRequest(roomId, replyText);
  }
  if (expecting === ROLE_NAME) {
    const personName = prevEvent.content.context.person.name;
    assignRole(personName, roomId, replyText);
  }
};

const handleMessage = async (event) => {
  const message = event.event.content.body.toLowerCase();
  const { room_id } = event.event;

  //if message is a reply, handle reply
  if (event.event.content["m.relates_to"]) {
    handleReply(event);
    return;
  }

  //if message has the tool's wake word, say hello
  if (message.includes("example")) {
    hello(room_id);
    return;
  }
};

// ===== REACTION HANDLING =====

const assignNewRole = async (roomId: string) => {
  sendMessage(
    roomId,
    "You're assigning a role. Quote-reply to this message with the name of the person receiving the role.",
    {
      expecting: PERSON_NAME,
    }
  );
};

const removeRole = async (event) => {
  const roomId = event.room_id;
  const roleToRemove = event.content.context;

  if (!roleToRemove) {
    return;
  }

  const roleState = await getPseudoState(roomId, PSEUDO_STATE_EVENT_TYPE);

  if (!roleState) {
    return;
  }

  const remainingRoles = roleState.content.assignedRoles.filter(
    (assignedRole) => assignedRole.id !== roleToRemove.id
  );

  sendMessage(
    roomId,
    `You have removed the role ${roleToRemove.role.name} from ${roleToRemove.person.name}`
  );

  setPseudoState(roomId, PSEUDO_STATE_EVENT_TYPE, {
    assignedRoles: remainingRoles,
  });
};

const handleReaction = async (event) => {
  const reactionInfo = event.event.content["m.relates_to"];
  const eventFromReaction = (await getEvent(
    event.event.room_id,
    reactionInfo.event_id
  )) as any;

  if (eventFromReaction.sender !== userId) return;

  const reactionEmoji = reactionInfo.key.trim();

  //match the reaction to the outcome
  if (reactionEmoji.includes("❤️")) {
    showAssignedRoles(event.event.room_id);
    return;
  }
  if (reactionEmoji.includes("👍")) {
    assignNewRole(event.event.room_id);
    return;
  }
  if (reactionEmoji.includes("🙏")) {
    removeRole(eventFromReaction);
    return;
  }

  //reaction not recognised
  sendMessage(
    event.event.room_id,
    "🤖Example Tool🤖: Sorry, I don't know that reaction."
  );
  return;
};

// ===== REGISTER HANDLERS =====

registerTool(
  "example",
  "Example Tool",
  [
    {
      type: "m.room.message",
      handle: handleMessage
    },
    {
      type: "m.reaction",
      handle: handleReaction
    }
  ]
);
