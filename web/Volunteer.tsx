import Markdown from "react-markdown";

const content = `Join the testing group
Join one of the development teams:
- wrapper team
- welcome module team
- admin module team`

export default function Volunteer() {
    return <div><Markdown>{content}</Markdown></div>
}