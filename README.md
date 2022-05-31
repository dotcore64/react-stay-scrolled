# react-stay-scrolled

[![Build Status][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coverage Status][coveralls-badge]][coveralls]

> Keep your component, such as message boxes, scrolled down

## Live demo

You can see the simplest demo here: [Live demo](https://codesandbox.io/s/6w5vx7yvwk)

## Install

```bash
$ npm install --save react-stay-scrolled
```

## Examples

Run examples:

```bash
$ npm ci
$ cd examples
$ npm ci
$ npm start
```

## Usage

```javascript
import { useRef, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import useStayScrolled from 'react-stay-scrolled';

const Messages = ({ messages }) => {
  const listRef = useRef();
  const { stayScrolled/*, scrollBottom*/ } = useStayScrolled(listRef);

  // Typically you will want to use stayScrolled or scrollBottom inside
  // useLayoutEffect, because it measures and changes DOM attributes (scrollTop) directly
  useLayoutEffect(() => {
    stayScrolled();
  }, [messages.length])

  return (
    <ul ref={listRef}>
      {messages.map((message, i) => <Message key={i} text={message} />)}
    </ul>
  );
};

Messages.propTypes = {
  messages = PropTypes.array,
}
```

Another use case is notifying users when there is a new message down the window that they haven't read:

```javascript
// messages.jsx
import { useState, useRef, useCallback, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import useStayScrolled from 'react-stay-scrolled';
import Message from './message.jsx';

const Messages = ({ messages }) => {
  const [notifyNewMessage, setNotifyNewMessage] = useState(false);
  const ref = useRef();

  const { stayScrolled, isScrolled } = useStayScrolled(ref);

    // The element just scrolled down - remove new messages notification, if any
  const onScroll = useCallback(() => {
    if (isScrolled()) setNotifyNewMessage(false);
  }, []);

  useLayoutEffect(() => {
    // Tell the user to scroll down to see the newest messages if the element wasn't scrolled down
    setNotifyNewMessage(!stayScrolled());
  }, [messages.length])

  return (
    <div ref={ref} onScroll={onScroll}>
      {messages.map((message, i) => <Message key={i} text={message} />)}
      {notifyNewMessage && <div>Scroll down to new message</div>}
    </div>
  );
};
```

You can use [react-spring](https://www.react-spring.io/) to animate the scroll:

```javascript
import { useRef, useCallback, useLayoutEffect } from 'react';
import useStayScrolled from 'react-stay-scrolled';
import { useSpring, animated } from '@react-spring/web';

const SpringStayScrolled = ({
  provideControllers,
  onScroll,
  getRunScroll,
}) => {
  const ref = useRef(null);
  const [{ scrollTop }, animateScroll] = useSpring(() => ({ scrollTop: 0 }), []);
  const runScroll = useCallback(offset => animateScroll.start({
    scrollTop: offset,
    from: { scrollTop: ref.current ? ref.current.scrollTop : 0 },
  }), [animateScroll])

  const { scrollBottom } = useStayScrolled(ref, { runScroll });

  useLayoutEffect(() => { scrollBottom(); }, []);

  return (
    <animated.div ref={ref} scrollTop={scrollTop}>
      {/* ... */}
    </animated.div>
  );
};
```

## Arguments

### ref

Type: a React `ref`, required

A `ref` to the DOM element whose scroll position you want to control

### options

Type: `object`, default:

```javascript
{
  initialScroll: null,
  inaccuracy: 0,
  runScroll: defaultRunScroll,
}
```

### options.initialScroll

Type: `number`, default: `null`

If provided, the scrolling element will mount scrolled with the provided value. If `Infinity` is provided, it will mount scrolled to the bottom.

### options.inaccuracy

Type: `number`, default: `0`

Defines an error margin, in pixels, under which `stayScrolled` will still scroll to the bottom

### options.runScroll

Type: `function: (offset) => undefined`, default: `(offset) => { ref.current.scrollTop = offset; }` where `ref` is the first value

Used for animating dom scrolling. You can use [dynamic.js](http://dynamicsjs.com/), [Velocity](https://github.com/julianshapiro/velocity), [jQuery](https://jquery.com/), or your favorite animation library. Here are examples of possible, tested `runScroll` values:

```js
const easing = 'linear';
const duration = 100;

const dynamicsRunScroll = (domRef) => (offset) => {
  dynamics.animate(domRef.current, {
    scrollTop: offset,
  }, {
    type: dynamics[easing],
    duration,
  });
};

const jqueryRunScroll = (domRef) => (offset) => {
  jQuery(domRef.current).animate({ scrollTop: offset }, duration, easing);
};

const velocityRunScroll = (domRef) => (offset) => {
  Velocity(
    domRef.current.firstChild,
    'scroll',
    {
      container: domRef.current,
      easing,
      duration,
      offset,
    }
  );
};
```

## Return value

Type: `object`, shape: `{ stayScrolled, scrollBottom, scroll, isScrolled }`

Four functions used for controlling scroll behavior.

### stayScrolled

Type: `function: () => bool`

Scrolls down the element if it was already scrolled down - useful for when a user is reading previous messages, and you don't want to interrupt. Returns true if it performed a scrolled down, false otherwise.

### scroll

Type: `function: (position: Integer) => void`

Scrolls down to the desired position. If given `Infinity`, it scrolls to the bottom

### scrollDown

Type: `function: () => void`

Scrolls down the wrapper element, regardless of current position. Equivalent to `() => scroll(Infinity)`.

### isScrolled

Type: `function: () => bool`

Returns true if the dom element is scrolled all the way down (within the inaccuracy provided).

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).

[build-badge]: https://img.shields.io/github/workflow/status/dotcore64/react-stay-scrolled/test/master?style=flat-square
[build]: https://github.com/dotcore64/react-stay-scrolled/actions

[npm-badge]: https://img.shields.io/npm/v/react-stay-scrolled.svg?style=flat-square
[npm]: https://www.npmjs.org/package/react-stay-scrolled

[coveralls-badge]: https://img.shields.io/coveralls/dotcore64/react-stay-scrolled/master.svg?style=flat-square
[coveralls]: https://coveralls.io/r/dotcore64/react-stay-scrolled
