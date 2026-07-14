import * as React from "react";

export interface UseStayScrolled {
  scroll: (position: number) => void;
  stayScrolled: () => void;
  scrollBottom: () => void;
  isScrolled: () => boolean;
}

export interface UseStayScrolledOptions {
  initialScroll: number | null;
  inaccuracy: number;
  runScroll?: (offset: number) => void;
}

export default function useStayScrolled(
  domRef: React.RefObject<HTMLElement>,
  options?: UseStayScrolledOptions,
): UseStayScrolled;
