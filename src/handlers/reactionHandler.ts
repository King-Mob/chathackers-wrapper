import { PERSON_NAME, PSEUDO_STATE_EVENT_TYPE } from "../constants";
import { sendMessage, getEvent } from "../matrixClientRequests";
import { getPseudoState, setPseudoState } from "../pseudoState";
import { registerHandler } from "../handlers";

const { userId } = process.env;

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
};

// Register the handler for reactions
registerHandler("m.reaction", handleReaction);

// Export the handler for direct use if needed
export default handleReaction; 