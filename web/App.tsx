import "./App.css";
import { useState, useEffect } from "react";
import { type ChatModule } from "../types";
import { BrowserRouter, Routes, Route, Link } from "react-router";
import Home from "./Home";
import Chat from "./Chat";
import Tools from "./Tools";
import FAQ from "./FAQ";
import Legal from "./Legal";
import Volunteer from "./Volunteer";
import { getRegistrations } from "./requests";

export default function App() {
  const [registrations, setRegistrations] = useState<ChatModule[]>([]);

  async function loadRegistrations() {
    const registrations = await getRegistrations();
    setRegistrations(registrations);
  }

  useEffect(() => {
    loadRegistrations();
  }, []);

  /*return (
    <BrowserRouter>
      <Link to="/" id="title-link">
        <h1 id="title" className="dashed-border">
          Chat Hackers
        </h1>
      </Link>
      <Routes>
        <Route path="" element={<Home />} />
        <Route path="chat" element={<Chat />} />
        <Route path="tools">
          <Route path="" element={<Tools registrations={registrations} />} />
        </Route>
        <Route path="faq" element={<FAQ />} />
        <Route path="legal" element={<Legal />} />
        <Route path="volunteer" element={<Volunteer />} />
      </Routes>
      <p id="footer">
        Chat Hackers is a collaboration of{" "}
        <Link to="https://campaignlab.uk">Campaign Lab</Link> and{" "}
        <Link to="https://john.spacetu.be">John Evans</Link>
      </p>
    </BrowserRouter>
  );*/
  return <Home />;
}
