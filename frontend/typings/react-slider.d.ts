// `react-slider` ships no types. Declared here rather than pulled in from
// DefinitelyTyped, the same way `jdu` is: the package is used by one component
// and only the props below are ever passed.
declare module 'react-slider' {
  import { Component, HTMLProps, ReactNode } from 'react';

  interface ReactSliderRenderState {
    index: number;
    value: number | number[];
    valueNow?: number;
  }

  interface ReactSliderProps {
    className?: string;
    min?: number;
    max?: number;
    step?: number;
    minDistance?: number;
    value?: number | number[];
    defaultValue?: number | number[];
    orientation?: 'horizontal' | 'vertical';
    withTracks?: boolean;
    pearling?: boolean;
    disabled?: boolean;
    snapDragDisabled?: boolean;
    allowCross?: boolean;
    invert?: boolean;
    marks?: boolean | number | number[];
    thumbClassName?: string;
    thumbActiveClassName?: string;
    trackClassName?: string;
    markClassName?: string;
    ariaLabel?: string | string[];
    renderThumb?: (
      props: HTMLProps<HTMLDivElement>,
      state: ReactSliderRenderState
    ) => ReactNode;
    renderTrack?: (
      props: HTMLProps<HTMLDivElement>,
      state: ReactSliderRenderState
    ) => ReactNode;
    renderMark?: (props: HTMLProps<HTMLSpanElement>) => ReactNode;
    onBeforeChange?: (value: number | number[], index: number) => void;
    onChange?: (value: number | number[], index: number) => void;
    onAfterChange?: (value: number | number[], index: number) => void;
    onSliderClick?: (value: number) => void;
  }

  export default class ReactSlider extends Component<ReactSliderProps> {}
}
