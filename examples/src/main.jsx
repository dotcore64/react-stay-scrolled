import { useState, useRef, useLayoutEffect } from 'react';
import { render } from 'react-dom';
import useInterval from 'use-interval';
import useStayScrolled from 'react-stay-scrolled';

const message = { text: 'foo' };

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
  display: 'inline-block',
  width: '100px',
  height: '250px',
  overflow: 'auto',
  border: '1px solid #000',
};

const App = () => {
  const divRef = useRef(null);
  const { stayScrolled } = useStayScrolled(divRef);
  const [messages, setMessages] = useState(initialMessages);

  useInterval(() => {
    setMessages((prevMessages) => prevMessages.concat([message]));
  }, 500);

  useLayoutEffect(() => {
    stayScrolled();
  }, [messages]);

  return (
    <div ref={divRef} style={style}>
      {/* eslint-disable-next-line react/no-array-index-key */}
      {messages.map(({ text }, i) => <div key={i}>{`${text} ${i}`}</div>)}
    </div>
  );
};

render(
  <App />,
  document.getElementById('demo'),
);
