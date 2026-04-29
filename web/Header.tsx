import { Link } from "react-router";

export default function Header({
  name,
  colour,
}: {
  name: string;
  colour: string;
}) {
  return (
    <div className="header">
      <Link to="/conversations">
        <p id="back-arrow">←</p>
      </Link>
      <div className="profile-container">
        <div className="profile-pic" style={{ backgroundColor: colour }}></div>
        <p className="chat-name">{name}</p>
      </div>
    </div>
  );
}
