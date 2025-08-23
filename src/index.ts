import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { getEvent, getSync, joinRoom, sendMessage, sendEvent } from "./matrixClientRequests";
import { MatrixEvent, ChatModule } from "./types";
import { startDuckDB, getActiveModulesForRoomId, insertActiveModule, updateModuleActivation } from "./duckdb";

const { userId } = process.env;

const scriptStart = Date.now();
const handledEventIds: string[] = [];
const modules: ChatModule[] = [];

async function forwardEvent(module, event) {
    return fetch(module.url, {
        method: "POST",
        body: JSON.stringify({ event, botUserId: userId }),
        headers: {
            "Content-type": "application/json"
        }
    })
}

async function handleWrapperEvent(event: MatrixEvent) {
    console.log("wrapper event", event)

    const roomId = event.room_id;
    const emoji = event.content?.["m.relates_to"]?.key;
    const { context } = event.prevEvent.content;

    if (!emoji)
        return;

    const moduleActivations = await getActiveModulesForRoomId(roomId);

    if (emoji.includes("⚙️")) {
        await sendMessage(roomId, "Here are the available tools for this room. Use the ❤️ react to add a tool and the 🙏 react to remove a tool.", {
            moduleEvent: false,
            wrapperEvent: true
        })

        modules.forEach(module => {
            const moduleActive = moduleActivations.find(moduleActivation => moduleActivation.module_id === module.id);
            const moduleMessage = `${module.emoji} ${module.title} - ${module.description} ${moduleActive ? "- Added" : ""}`;

            sendMessage(roomId, moduleMessage, {
                moduleEvent: false,
                wrapperEvent: true,
                moduleId: module.id
            })
        })
        return;
    }

    const module = modules.find(possibleModule => possibleModule.id === context.moduleId);
    if (!module) {
        sendMessage(roomId, "Sorry, this message has no interactive component.", {
            moduleEvent: false,
            wrapperEvent: true,
        })
        return;
    }

    if (emoji.includes("❤️")) {
        const moduleActive = moduleActivations.find(moduleActivation => moduleActivation.module_id === module.id);

        if (!moduleActive) {
            await insertActiveModule(module.id, roomId, event.sender);
            sendMessage(roomId, `Turning on ${module.title}. Send ${module.wake_word} to start`, {
                moduleEvent: false,
                wrapperEvent: true,
            });
        } else {
            sendMessage(roomId, `${module.title} is already active. Send ${module.wake_word} to start`, {
                moduleEvent: false,
                wrapperEvent: true,
            });
        }
        return;
    }

    if (emoji.includes("🙏")) {
        const moduleActive = moduleActivations.find(moduleActivation => moduleActivation.module_id === module.id);

        if (moduleActive) {
            await updateModuleActivation(moduleActive.module_id, moduleActive.room_id, false);
            sendMessage(roomId, `${module.title} has been deactivated.`, {
                moduleEvent: false,
                wrapperEvent: true,
            });
        }
        else {
            sendMessage(roomId, `${module.title} has already been deactivated.`, {
                moduleEvent: false,
                wrapperEvent: true,
            });
        }
        return;
    }
}

async function handleModuleEvent(event: MatrixEvent) {
    const moduleActivations = await getActiveModulesForRoomId(event.room_id);

    modules
        .filter(module => moduleActivations.find(moduleActivation => moduleActivation.module_id === module.id))
        .forEach(async (module) => {
            if (module.event_types.includes(event.type)) {
                const forwardResponse = await forwardEvent(module, event);
                const forwardResult: any = await forwardResponse.json();
                if (forwardResult.response) {
                    if (forwardResult.response.message) {
                        sendMessage(event.room_id, forwardResult.response.message, {
                            moduleEvent: true,
                            wrapperEvent: false,
                            ...forwardResult.response.context
                        });
                    }
                    else {
                        forwardResult.response.forEach(response => {
                            sendMessage(event.room_id, response.message, {
                                moduleEvent: true,
                                wrapperEvent: false,
                                ...response.context
                            })
                        })
                    }
                }
            }
        })
}

async function loadModules() {
    const registrationPath = path.resolve("./registrations");
    const registrationFiles = fs.readdirSync(registrationPath);

    registrationFiles.forEach(fileName => {
        const filePath = path.resolve(`./registrations/${fileName}`);
        const registrationBuffer = fs.readFileSync(filePath);
        const registration = JSON.parse(registrationBuffer.toString());
        modules.push(registration);
    })
}

async function sync(batch = null) {
    const result: any = await getSync(batch);

    if (result.rooms && result.rooms.invite) {
        for (const roomId in result.rooms.invite) {
            joinRoom(roomId);
            sendMessage(roomId, "Hi, I'm the chathackers bot. I can add tools to this chat. Gear react (⚙️) to this message see what tools you have added, and to add or remove tools.", {
                moduleEvent: false,
                wrapperEvent: true
            })
        }
    }

    if (result.rooms && result.rooms.join) {
        for (const roomId in result.rooms.join) {
            const room = result.rooms.join[roomId];
            const timeline: MatrixEvent[] = room.timeline.events;
            timeline.forEach(async event => {
                if (!handledEventIds.includes(event.event_id) && event.origin_server_ts > scriptStart && event.sender !== userId) {
                    if (event.content && event.content.body && event.content.body.includes("!wa accept")) {
                        const replyEvent = {
                            body: "!wa accept",
                            "m.mentions": { user_ids: [event.sender] },
                            user_ids: [event.sender],
                            "m.relates_to": {
                                "m.in_reply_to": { event_id: event.event_id }
                            },
                            "m.in_reply_to": { event_id: event.event_id },
                            msgtype: "m.text"
                        }
                        sendEvent(roomId, replyEvent, "m.room.message")
                        return;
                    }

                    event.room_id = roomId;
                    if (event.content["m.relates_to"]) {
                        const prevEventId = event.content["m.relates_to"].event_id || event.content["m.relates_to"]["m.in_reply_to"].event_id;
                        const prevEvent = await getEvent(roomId, prevEventId);
                        event.prevEvent = prevEvent;
                    }

                    if (event.prevEvent &&
                        event.prevEvent.content.context &&
                        event.prevEvent.content.context.wrapperEvent &&
                        event.prevEvent.sender === userId)
                        handleWrapperEvent(event);
                    else
                        handleModuleEvent(event);

                    handledEventIds.push(event.event_id);
                }
            })
        }
    }

    sync(result.next_batch);
}

const start = async () => {
    await startDuckDB()
    // load modules
    await loadModules();
    // start listening for events
    sync();
};

start().catch((err) => {
    console.error("Error starting client:", err);
});
