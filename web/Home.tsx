import { Link } from "react-router"

export default function Home() {
    return <div>
        <p>To determine how we communicate is a foundational democratic right.
            Huge chat platforms have become the de facto public square.
            Now you can adapt how the square works to suit your needs.</p>
        <h2>Get Started</h2>
        <p>WhatsApp: add +44 7724 736427 to your group</p>
        <p>Then use emoji reacts and replies to select tools and use them.</p>
        <Link to="tools"><p>See available tools</p></Link>
        <Link to="faq"><p>FAQ</p></Link>
        <Link to="legal"><p>Legal</p></Link>
        <Link to="volunteer"><p>Volunteer</p></Link>
        <p>Chat Hackers is a collaboration of Campaign Lab and John Evans.</p>
    </div>
}