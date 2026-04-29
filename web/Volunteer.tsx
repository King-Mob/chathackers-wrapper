import Header from "./Header";
import { Message } from "./Home";

export default function Volunteer() {
  return (
    <div>
      <Header name="Volunteer" colour="yellow" />
      <Message
        side="left"
        text="We run hack days to support building more tools on Chat Hackers."
      />
      <Message
        side="left"
        text="You can see a list of resources on our "
        link="https://docs.google.com/document/d/1l9cKnD9ARi3vWhuGrtl0LeNDMZhtmh_EOUXycR3WOkk/edit?tab=t.0#heading=h.fqq0cp7l9a73"
        linkText="google doc"
      />
    </div>
  );
}
