import { useState, useRef, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
// eslint-disable-next-line import/no-named-as-default -- default export is the intended hook
import useInterval from "use-interval";
import useStayScrolled from "react-stay-scrolled";

const message = { text: "foo" };

const initialMessages = [
  message,
  message,
  message,
  message,
  message,
  message,
  message,
];

const style = {
  display: "inline-block",
  width: "100px",
  height: "250px",
  overflow: "auto",
  border: "1px solid #000",
};

const App = () => {
  const divRef = useRef(null);
  const { stayScrolled } = useStayScrolled(divRef);
  const [messages, setMessages] = useState(initialMessages);

  useInterval(() => {
    setMessages((prevMessages) => [...prevMessages, message]);
  }, 500);

  useLayoutEffect(() => {
    stayScrolled();
  }, [messages, stayScrolled]);

  return (
    <div ref={divRef} style={style}>
      {}
      {messages.map(({ text }, i) => (
        <div key={i}>{`${text} ${i}`}</div>
      ))}
    </div>
  );
};

createRoot(document.querySelector("#demo")).render(<App />);
