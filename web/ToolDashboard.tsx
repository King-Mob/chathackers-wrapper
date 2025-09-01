import { useParams, useSearchParams, Link } from "react-router";

export default function ToolDashboard({ registrations }) {
    const { toolId } = useParams();
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("roomId");

    const module = registrations.find(registration => registration.id === toolId);

    return <div id="tool-dashboard-container">
        <Link to={`/chat?roomId=${roomId}`}><p>Back</p></Link>
        <iframe src={`${module.url}/?roomId=${roomId}`} />
    </div>
}