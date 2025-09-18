import { Link } from "react-router";

export default function Home() {
  return (
    <div>
      <p>
        To determine how we communicate is a foundational democratic right.
        Privately owned chat platforms have become the de facto site of
        communication.
      </p>
      <p>With Chat Hackers you can adapt your chat to suit your needs.</p>
      <h2 className="dashed-border">Get Started</h2>
      <p>WhatsApp: add +44 7724 736427 to your group</p>
      <p>Then use emoji reacts and replies to select tools and use them.</p>
      <Link to="tools">
        <p>See available tools</p>
      </Link>
      <Link to="faq">
        <p>FAQ</p>
      </Link>
      <Link to="legal">
        <p>Legal</p>
      </Link>
      <Link to="volunteer">
        <p>Volunteer</p>
      </Link>
    </div>
  );
}
