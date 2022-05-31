import {
  useEffect, useLayoutEffect, useRef, useCallback,
} from 'react';
import invariant from 'tiny-invariant';
import memoize from 'memoize-one';

import { maxScrollTop } from './util.js'; // eslint-disable-line import/extensions

// eslint-disable-next-line no-param-reassign
const defaultRunScroll = memoize((domRef) => (offset) => { domRef.current.scrollTop = offset; });
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default (domRef, {
  initialScroll = null,
  inaccuracy = 0,
  runScroll = defaultRunScroll(domRef),
} = {}) => {
  const wasScrolled = useRef(null);

  const isScrolled = useCallback(
    () => (domRef.current === null ? false : Math.ceil(domRef.current.scrollTop) >= maxScrollTop(domRef.current) - inaccuracy),
    [inaccuracy],
  );

  useEffect(() => {
    const onScroll = () => { wasScrolled.current = isScrolled(); };

    domRef.current.addEventListener('scroll', onScroll);
    // in react 17 the cleanup can happen after the element gets unmounted
    return () => domRef.current?.removeEventListener('scroll', onScroll);
  }, []);

  const scroll = useCallback((position) => {
    invariant(domRef.current !== null, `Trying to scroll to the bottom, but no element was found.
      Did you call this scrollBottom before the component with this hook finished mounting?`);

    const offset = Math.min(maxScrollTop(domRef.current), position);
    runScroll(offset);
  }, [runScroll]);

  const scrollBottom = useCallback(() => {
    scroll(Number.POSITIVE_INFINITY);
  }, [scroll]);

  const stayScrolled = useCallback(() => {
    if (wasScrolled.current) scrollBottom();

    return wasScrolled.current;
  }, [scrollBottom]);

  useIsomorphicLayoutEffect(() => {
    if (initialScroll !== null) {
      scroll(initialScroll);
    }

    wasScrolled.current = isScrolled();
  }, []);

  return {
    scroll,
    stayScrolled,
    scrollBottom,
    isScrolled,
  };
};
