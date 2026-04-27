import { useState } from "react";
import { Link } from "react-router";

function Message({
  text,
  side,
  link,
  linkText,
}: {
  text: string;
  side: string;
  link?: string;
  linkText?: string;
}) {
  return (
    <p className={`message ${side}`}>
      {text}
      {link && (
        <Link to={`${link}`}>
          <span>{linkText}</span>
        </Link>
      )}
    </p>
  );
}

function Option({ text }: { text: string }) {
  return <p className="option">{text}</p>;
}

export default function Home() {
  /* return (
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
  );*/
  type Option = {
    question: string;
    reply: string;
    link?: string;
    linkText?: string;
  };

  const options: Option[] = [
    {
      question: "What is chat hackers?",
      reply:
        "chat hackers is a set of tools you can add to your group chat to make it easier to take political action",
    },
    {
      question: "who makes chat hackers?",
      reply:
        "chat hackers is a collaboration between campaign lab and john evans",
    },
    {
      question: "I have some FAQs",
      reply: "cool, here's a link to our ",
      link: "faq",
      linkText: "FAQ page",
    },
    {
      question: "Do you have a privacy policy?",
      reply: "yes, here's a link to our ",
      link: "privacy",
      linkText: "privacy policy",
    },
    {
      question: "Why have you made this?",
      reply:
        "The group chat has become the first tool that people pick up when it's time to organise for political action. We want to make it easy to customise your chat to meet the needs of democratic groups",
    },
    {
      question: "Sounds great, let's go!",
      reply:
        "Ok, great. Just add +44 7724 736427 to your whatsapp group and then interact with the tool from there!",
    },
  ];

  const [usedOptions, setUsedOptions] = useState<string[]>([]);
  const [messages, setMessages] = useState<
    { text: string; side: string; link?: string; linkText?: string }[]
  >([
    { text: "hello, nice to meet you, this is chat hackers HQ", side: "left" },
  ]);

  console.log(messages);

  return (
    <div id="phone">
      {messages.map((message) => (
        <Message
          text={message.text}
          side={message.side}
          link={message.link}
          linkText={message.linkText}
        />
      ))}
      <div id="message-options">
        {options
          .filter((option) => !usedOptions.includes(option.question))
          .map((option) => (
            <button
              className="option-container"
              onClick={() => {
                setUsedOptions(usedOptions.concat(option.question));
                setMessages(
                  messages.concat([
                    { text: option.question, side: "right" },
                    {
                      text: option.reply,
                      side: "left",
                      link: option.link,
                      linkText: option.linkText,
                    },
                  ]),
                );
              }}
            >
              {" "}
              <Option text={option.question} />
            </button>
          ))}
      </div>
    </div>
  );
}
