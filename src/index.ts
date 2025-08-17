import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { getEvent, getSync, joinRoom, sendMessage } from "./matrixClientRequests";
import { MatrixEvent } from "./types";
import { startDuckDB, getActiveModulesForRoomId } from "./duckdb";

const { userId } = process.env;

const scriptStart = Date.now();
const handledEventIds = [];
const modules = [];

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
    // if gear react, list the modules and descriptions
    // which can be a loop through the modules array
    // but we also need to know which have already been installed
    // so also do a call to get the active modules from duckdb

    // if it's a heart, turn a module on
    // which is a duckdb call
    // and a message saying we just turned a module on

    // if it's a prayer, turn a module off
    // also a duckdb call
    // and a message saying module is off
}

async function handleModuleEvent(event: MatrixEvent) {
    const activeModuleIds = await getActiveModulesForRoomId(event.room_id);

    modules
        .filter(module => activeModuleIds.includes(module.id))
        .forEach(async (module) => {
            if (module.event_types.includes(event.type)) {
                console.log(event)
                const forwardResponse = await forwardEvent(module, event);
                const forwardResult: any = await forwardResponse.json();
                console.log(forwardResult);
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
            sendMessage(roomId, "Hi, I'm the chathackers bot. I can add modules to this chat. Gear react (⚙️) to this message to add or remove modules.", {
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
                    event.room_id = roomId;
                    console.log("handling event", event)
                    if (event.content["m.relates_to"]) {
                        const prevEventId = event.content["m.relates_to"].event_id || event.content["m.relates_to"]["m.in_reply_to"].event_id;
                        const prevEvent = await getEvent(roomId, prevEventId);
                        event.prevEvent = prevEvent;
                    }

                    if (event.prevEvent && event.prevEvent.content.context.wrapperEvent)
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
