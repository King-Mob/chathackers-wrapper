import { useState } from "react";
import { Link } from "react-router";
import Header from "./Header";

export function Message({
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

type Option = {
  question: string;
  reply: {
    text: string;
    link?: string;
    linkText?: string;
  }[];
};

const options: Option[] = [
  {
    question: "What is chat hackers?",
    reply: [
      {
        text: "chat hackers is a set of tools you can add to your group chat to make it easier to take political action",
      },
    ],
  },
  {
    question: "who makes chat hackers?",
    reply: [
      {
        text: "chat hackers is a collaboration between:",
      },
      {
        text: "- ",
        link: "https://campaignlab.uk",
        linkText: "Campaign Lab",
      },
      {
        text: "- ",
        link: "https://john.spacetu.be",
        linkText: "John Evans",
      },
      {
        text: "- our ",
        link: "/volunteer",
        linkText: "hackday volunteers",
      },
    ],
  },
  {
    question: "I have some FAQs",
    reply: [
      {
        text: "cool, here's a link to our ",
        link: "faq",
        linkText: "FAQ page",
      },
    ],
  },
  {
    question: "Do you have a privacy policy?",
    reply: [
      {
        text: "yes, here's a link to our ",
        link: "privacy",
        linkText: "privacy policy",
      },
    ],
  },
  {
    question: "Why have you made this?",
    reply: [
      {
        text: "The group chat has become the first tool that people pick up when it's time to organise for political action. We want to make it easy to customise your chat to meet the needs of democratic groups",
      },
    ],
  },
  {
    question: "Sounds great, let's go!",
    reply: [
      {
        text: "Ok, great. Just add +44 7724 736427 to your whatsapp group and then interact with the tool from there!",
      },
    ],
  },
];

export default function Home() {
  const [usedOptions, setUsedOptions] = useState<string[]>([]);
  const [messages, setMessages] = useState<
    { text: string; side: string; link?: string; linkText?: string }[]
  >([
    { text: "hello, nice to meet you, this is chat hackers HQ", side: "left" },
  ]);

  return (
    <>
      <Header name="Chat Hackers HQ" colour="red" />
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
                  messages
                    .concat([{ text: option.question, side: "right" }])
                    .concat(
                      option.reply.map((reply) => ({
                        text: reply.text,
                        side: "left",
                        link: reply.link,
                        linkText: reply.linkText,
                      })),
                    ),
                );
              }}
            >
              {" "}
              <Option text={option.question} />
            </button>
          ))}
      </div>
    </>
  );
}
