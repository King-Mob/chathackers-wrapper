import { useSearchParams, Link } from "react-router";
import { useEffect, useState } from "react";
import { type Room, Tool } from "../types";
import { getTools, getRoom, postToolActivation } from "./requests";

export default function Chat() {
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("roomId");
    const [tools, setTools] = useState<Tool[]>([]);
    const [room, setRoom] = useState<Room>();

    async function loadTools(roomId: string) {
        const tools = await getTools(roomId);
        console.log(tools)
        setTools(tools);
    }

    async function loadRoom(roomId: string) {
        const room = await getRoom(roomId);
        console.log(room)
        setRoom(room);
    }

    async function setToolActivation(roomId: string, toolId: string, activation: boolean) {
        await postToolActivation(roomId, toolId, activation);
        loadTools(roomId);
    }

    useEffect(() => {
        if (roomId) {
            loadTools(roomId);
            loadRoom(roomId);
        }
    }, [])

    const messageCount = room && room.timeline.filter(event => event.type === "m.room.message").length;
    const participants = {};
    room && room.timeline.filter(event => event.type === "m.room.member" && event.content.membership === "join").map(event => event.state_key).forEach(userId => participants[userId as string] = "join");

    return <div>
        <h1>{room ? room.title : "Room"}</h1>
        <p>{messageCount} messages with {Object.keys(participants).length} participants</p>
        <div id="tools-chat-container">
            <div id="tools-container">
                <h2>Tools</h2>
                {roomId && tools.map(tool => <div className="tool-container">
                    <h3>{tool.emoji} {tool.title}</h3>
                    <p>{tool.description}</p>
                    {tool.active ?
                        <>
                            <p>Active</p>
                            <Link to={`/tools/${tool.id}?roomId=${roomId}`}>
                                <p>Open tool dashboard</p>
                            </Link>
                            <button onClick={() => setToolActivation(roomId, tool.id, false)}>Turn Off</button>
                        </>
                        :
                        <button onClick={() => setToolActivation(roomId, tool.id, true)}>Turn On</button>
                    }
                </div>)}
            </div>
            <div id="chat-container">
                <h2>Chat (last 10 messages)</h2>
                {room && room.timeline.filter(event => event.type === "m.room.message").slice(0, 10).reverse().map(event =>
                    <p>{event.content.body} <span className="sender">{event.sender}</span></p>)}
            </div>
        </div>

    </div>
}