import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router";
import Home from "./Home";
import Chat from "./Chat";
import Tools from "./Tools";
import registrations from "./registrations";
import FAQ from "./FAQ";
import Legal from "./Legal";
import Volunteer from "./Volunteer";

export default function App() {
  return (
    <BrowserRouter>
      <Link to="/">
        <h1 id="title">Chat Hackers</h1>
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
    </BrowserRouter>
  );
}
