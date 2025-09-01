import { ChatModule } from "../types";

export default function Tools({ registrations }: { registrations: ChatModule[] }) {
    return <div>
        <h1>Tools</h1>
        {registrations.map(registration => <div>
            <h2>{registration.emoji} {registration.title}</h2>
            <p>{registration.description}</p>
        </div>)}
    </div>
}