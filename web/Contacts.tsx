import { Link } from "react-router";

function Contact({
  to,
  name,
  colour,
}: {
  to: string;
  name: string;
  colour: string;
}) {
  return (
    <Link to={to}>
      <div className="contact">
        <div className="profile-pic" style={{ backgroundColor: colour }}></div>
        <h2 className="chat-name">{name}</h2>
      </div>
    </Link>
  );
}

export default function Contacts() {
  const contacts = [
    { to: "/", name: "Chat Hackers HQ", colour: "red" },
    { to: "/faq", name: "FAQ", colour: "blue" },
    { to: "/privacy", name: "Privacy Policy", colour: "green" },
    { to: "/volunteer", name: "Volunteer", colour: "yellow" },
    { to: "/motivations", name: "Motivations", colour: "black" },
  ];

  return (
    <div id="contact-list">
      <h1 id="contact-title">Conversations</h1>
      {contacts.map((contact) => (
        <Contact to={contact.to} name={contact.name} colour={contact.colour} />
      ))}
    </div>
  );
}
