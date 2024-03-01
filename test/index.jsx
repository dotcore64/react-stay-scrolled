import {
  StrictMode, useState, useRef, useEffect, useLayoutEffect, useMemo,
} from 'react';
import { render as reactDomRender, unmountComponentAtNode } from 'react-dom'; // eslint-disable-line react/no-deprecated
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

import PropTypes from 'prop-types';
import { expect } from 'chai';
import { spy } from 'sinon';

// https://github.com/import-js/eslint-plugin-import/issues/1649
// eslint-disable-next-line import/no-unresolved
import useStayScrolled from 'react-stay-scrolled';

import { maxScrollTop } from '../src/util.js'; // eslint-disable-line import/extensions

import {
  jqueryRunScroll,
  dynamicsRunScroll,
  velocityRunScroll,
  springRunScroll,
  SpringTestComponent,
} from './animation.jsx'; // eslint-disable-line import/extensions

import {
  duration,
  testHeight,
  testScrollHeight,
} from './constants.js'; // eslint-disable-line import/extensions

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const TestComponent = ({
  provideControllers = () => {},
  onScroll = () => {},
  getRunScroll,
  ...props
}) => {
  const ref = useRef(null);
  const runScroll = useMemo(() => (getRunScroll ? getRunScroll(ref) : undefined), [getRunScroll, ref]);
  provideControllers(useStayScrolled(ref, { ...props, runScroll }));

  const style = {
    height: testHeight,
    width: 100,
    overflow: 'auto',
  };

  return (
    <div ref={ref} style={style} onScroll={onScroll}>
      <div style={{ height: testScrollHeight, width: 100 }} />
    </div>
  );
};

TestComponent.propTypes = {
  onScroll: PropTypes.func,
  provideControllers: PropTypes.func,
  getRunScroll: PropTypes.func,
};

TestComponent.defaultProps = {
  onScroll: () => {},
  provideControllers: () => {},
  getRunScroll: undefined,
};

const isDomScrolled = (node) => node.scrollTop === maxScrollTop(node);

describe('react-stay-scrolled', () => {
  let container;
  let root;

  function render(element) {
    if (createRoot) {
      root = root || createRoot(container);
      act(() => {
        root.render(element);
      });
    } else {
      act(() => {
        reactDomRender(
          (
            <StrictMode>
              {element}
            </StrictMode>
          ), container,
        );
      });
    }
  }

  function unmount() {
    if (createRoot) {
      if (root) {
        act(() => {
          root.unmount();
        });
        root = undefined;
      }
    } else {
      unmountComponentAtNode(container);
    }
  }

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    unmount();
    container.remove();
  });

  describe('general', () => {
    it('should render single div', () => {
      render(<TestComponent />);
      expect(container.childNodes.length).to.equal(1);
      expect(container.firstChild.tagName).to.equal('DIV');
    });

    it('should start with scrolled element', () => {
      render(<TestComponent initialScroll={Number.POSITIVE_INFINITY} />);

      expect(container.firstChild.scrollHeight).to.equal(testScrollHeight);
      expect(isDomScrolled(container.firstChild)).to.equal(true);
    });

    it('should not start with scrolled element', () => {
      render(<TestComponent />);

      expect(container.firstChild.scrollTop).to.equal(0);
      expect(isDomScrolled(container.firstChild)).to.equal(false);
    });

    it('should scroll to bottom when calling scrollBottom', () => {
      let scrollBottom;
      const storeController = (controllers) => { ({ scrollBottom } = controllers); };

      render(<TestComponent provideControllers={storeController} />);

      expect(isDomScrolled(container.firstChild)).to.equal(false);
      scrollBottom();
      expect(isDomScrolled(container.firstChild)).to.equal(true);
    });

    it('should stay scrolled when calling stayScrolled and starting scrolled', async () => {
      let stayScrolled;
      let isScrolled;
      const storeController = (controllers) => { ({ stayScrolled, isScrolled } = controllers); };

      await new Promise((resolve) => {
        render(
          <TestComponent
            initialScroll={Number.POSITIVE_INFINITY}
            onScroll={() => {
              expect(isScrolled()).to.equal(true);
              resolve();
            }}
            provideControllers={storeController}
          />,
        );

        expect(stayScrolled()).to.equal(true);
      });

      expect(isDomScrolled(container.firstChild)).to.equal(true);
    });

    it('should not stay scrolled when calling stayScrolled and not starting scrolled', () => {
      let stayScrolled;
      let isScrolled;
      const storeController = (controllers) => { ({ stayScrolled, isScrolled } = controllers); };

      render(<TestComponent provideControllers={storeController} />);

      expect(stayScrolled()).to.equal(false);
      expect(isScrolled()).to.equal(false);
      expect(isDomScrolled(container.firstChild)).to.equal(false);
    });

    it('should memoize default runScroll', () => {
      // https://github.com/dotcore64/react-stay-scrolled/issues/107
      const cb = spy();

      const MemoizeTestComponent = ({ prop }) => {
        const ref = useRef(null);
        const { stayScrolled } = useStayScrolled(ref);

        useLayoutEffect(() => {
          cb();
        }, [stayScrolled]);

        return <div ref={ref}>{prop}</div>;
      };

      MemoizeTestComponent.propTypes = {
        prop: PropTypes.string.isRequired,
      };

      render(<MemoizeTestComponent prop="foo" />);
      // trigger rerender, stayScrolled should be unchanged
      render(<MemoizeTestComponent prop="bar" />);

      expect(cb.callCount).to.equal(1);
    });

    it('should stay scrolled when adding new elements', (done) => {
      const Messages = () => {
        const [messages, setMessages] = useState([]);
        const ref = useRef(null);

        const addMessage = () => {
          setMessages((prevMessages) => [...prevMessages, 'foo']);
        };

        const { stayScrolled } = useStayScrolled(ref);

        useEffect(() => { addMessage(); }, []);
        useLayoutEffect(() => {
          expect(stayScrolled()).to.equal(true);
          expect(isDomScrolled(ref.current)).to.equal(true);

          if (messages.length > 4) {
            done(); // After 5 messages stop
          } else {
            addMessage();
          }
        }, [messages]);

        const style = {
          height: testHeight,
          width: 100,
          overflow: 'auto',
        };

        return (
          <div ref={ref} style={style}>
            {messages.map((message, i) => (
              <div key={i} style={{ height: testScrollHeight, width: 100 }}>{message}</div> // eslint-disable-line react/no-array-index-key
            ))}
          </div>
        );
      };

      render(<Messages />);
    });
  });

  describe('accuracy', () => {
    it('should stay scrolled only when below inaccuracy', function (done) {
      this.timeout(5000);
      const inaccuracy = 5;

      const recursion = (i) => {
        let stayScrolled;
        const storeController = (controllers) => { ({ stayScrolled } = controllers); };

        const onScroll = () => {
          const dom = container.firstChild;
          const domMaxScrollTop = maxScrollTop(dom);
          const expectedResult = i >= domMaxScrollTop - inaccuracy;

          expect(stayScrolled()).to.equal(expectedResult);
          expect(isDomScrolled(dom)).to.equal(expectedResult);

          act(() => {
            unmount();
          });

          if (i < domMaxScrollTop) {
            recursion(i + 1);
          } else {
            done();
          }
        };

        render(<TestComponent
          initialScroll={i}
          inaccuracy={inaccuracy}
          onScroll={onScroll}
          provideControllers={storeController}
        />);
      };

      recursion(1);
    });
  });

  describe('invariant', () => {
    it('should throw when calling scrollBottom from mounted child', (done) => {
      const Child = ({ scrollBottom }) => {
        useLayoutEffect(() => {
          expect(scrollBottom).to.throw(Error, /hook finished mounting/);
          done();
        }, []);

        return null;
      };

      Child.propTypes = {
        scrollBottom: PropTypes.func.isRequired,
      };

      const Parent = () => {
        const ref = useRef(null);
        const { scrollBottom } = useStayScrolled(ref);

        return (
          <div ref={ref}>
            <Child scrollBottom={scrollBottom} />
          </div>
        );
      };

      render(<Parent />);
    });
  });

  describe('animation', () => {
    const testAnimation = (runScroll, Component = TestComponent) => {
      let scrollBottom;
      const storeController = (controllers) => { ({ scrollBottom } = controllers); };
      const onScroll = spy(() => {
        expect(container.firstChild.scrollTop).to.be.above(0);
        expect(container.firstChild.scrollTop).to.be.most(maxScrollTop(container.firstChild));
      });

      render(
        <Component
          onScroll={onScroll}
          provideControllers={storeController}
          getRunScroll={runScroll}
        />,
      );

      expect(isDomScrolled(container.firstChild)).to.equal(false);
      scrollBottom();

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(onScroll.callCount).to.be.above(4);
          expect(isDomScrolled(container.firstChild)).to.equal(true);
          resolve();
        }, duration * 1.5);
      });
    };

    const testAnimationOnScrolled = (runScroll, Component = TestComponent) => {
      let scrollBottom;
      let isScrolled;
      const storeController = (controllers) => { ({ scrollBottom, isScrolled } = controllers); };
      const onScroll = spy();

      render(
        <Component
          onScroll={onScroll}
          provideControllers={storeController}
          getRunScroll={runScroll}
        />,
      );

      expect(isScrolled()).to.equal(false);
      scrollBottom();

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(onScroll.callCount).to.be.above(4);
          expect(isScrolled()).to.equal(true);
          resolve();
        }, duration * 1.5); // jQuery needs extra time, guarantee completion with 1.5 times the duration
      });
    };

    it('should animate scrolling with react-spring', () => testAnimation(springRunScroll, SpringTestComponent));

    it('should report isScrolled correctly when using react-spring', () => testAnimationOnScrolled(springRunScroll, SpringTestComponent));

    it('should animate scrolling with dynamics.js', () => testAnimation(dynamicsRunScroll));

    it('should report isScrolled correctly when using dynamics.js', () => testAnimationOnScrolled(dynamicsRunScroll));

    it('should animate scrolling with velocity', () => testAnimation(velocityRunScroll));

    it('should report isScrolled correctly when using velocity', () => testAnimationOnScrolled(velocityRunScroll));

    it('should animate scrolling with jquery', () => testAnimation(jqueryRunScroll));

    it('should report isScrolled correctly when using jquery', () => testAnimationOnScrolled(jqueryRunScroll));
  });
});
