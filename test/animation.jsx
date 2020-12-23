import React, { useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated } from 'react-spring';

import Velocity from 'velocity-animate';
import jQuery from 'jquery';
import dynamics from 'dynamics.js';

import useStayScrolled from '../src';

import {
  easing,
  duration,
  testHeight,
  testScrollHeight,
} from './constants';

export const dynamicsRunScroll = (dom) => (offset) => {
  dynamics.animate(dom.current, {
    scrollTop: offset,
  }, {
    type: dynamics[easing],
    duration,
  });
};

export const jqueryRunScroll = (dom) => (offset) => {
  jQuery(dom.current).animate({ scrollTop: offset }, duration, easing);
};

export const velocityRunScroll = (dom) => (offset) => {
  Velocity(
    dom.current.firstChild,
    'scroll',
    {
      container: dom.current,
      easing,
      duration,
      offset,
    },
  );
};

export const springRunScroll = (updateScroll, dom) => (offset) => updateScroll({
  scrollTop: offset,
  from: { scrollTop: dom.current ? dom.current.scrollTop : 0 },
  reset: true,
  config: { duration },
});

export const SpringTestComponent = ({
  provideControllers,
  onScroll,
  getRunScroll,
}) => {
  const ref = useRef(null);
  const [{ scrollTop }, updateScroll] = useSpring(() => ({ scrollTop: 0 }));
  const runScroll = useMemo(
    () => (getRunScroll ? getRunScroll(updateScroll, ref) : undefined),
    [getRunScroll, updateScroll, ref],
  );

  provideControllers(useStayScrolled(ref, { runScroll }));

  const style = {
    height: testHeight,
    width: 100,
    overflow: 'auto',
  };

  return (
    <animated.div ref={ref} style={style} onScroll={onScroll} scrollTop={scrollTop}>
      <div style={{ height: testScrollHeight, width: 100 }} />
    </animated.div>
  );
};

SpringTestComponent.propTypes = {
  onScroll: PropTypes.func.isRequired,
  provideControllers: PropTypes.func.isRequired,
  getRunScroll: PropTypes.func.isRequired,
};
