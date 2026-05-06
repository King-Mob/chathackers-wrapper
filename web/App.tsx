import "./App.css";
import { useState, useEffect } from "react";
import { type ChatModule } from "../types";
import { BrowserRouter, Routes, Route, Link } from "react-router";
import Home from "./Home";
import Contacts from "./Contacts";
import Chat from "./Chat";
import Tools from "./Tools";
import FAQ from "./FAQ";
import Privacy from "./Privacy";
import Volunteer from "./Volunteer";
import { getRegistrations } from "./requests";
import Motivations from "./Motivations";

export default function App() {
  const [registrations, setRegistrations] = useState<ChatModule[]>([]);

  async function loadRegistrations() {
    const registrations = await getRegistrations();
    setRegistrations(registrations);
  }

  useEffect(() => {
    loadRegistrations();
  }, []);

  return (
    <BrowserRouter>
      <div id="phone">
        <Routes>
          <Route path="" element={<Home />} />
          <Route path="conversations" element={<Contacts />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="volunteer" element={<Volunteer />} />
          <Route path="motivations" element={<Motivations />} />
          <Route
            path="tools"
            element={<Tools registrations={registrations} />}
          />
        </Routes>
      </div>
      <Routes>
        <Route path="chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}
