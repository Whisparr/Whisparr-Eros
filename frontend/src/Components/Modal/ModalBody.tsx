import React, { forwardRef } from 'react';
import Scroller from 'Components/Scroller/Scroller';
import {
  NONE,
  ScrollDirection,
  VERTICAL,
} from 'Helpers/Props/scrollDirections';
import styles from './ModalBody.module.css';

interface ModalBodyProps {
  className?: string;
  innerClassName?: string;
  children?: React.ReactNode;
  scrollDirection?: ScrollDirection;
}

const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  (
    {
      innerClassName = styles.innerModalBody,
      scrollDirection = VERTICAL,
      children,
      ...otherProps
    },
    ref
  ) => {
    let className = otherProps.className;
    const hasScroller = scrollDirection !== NONE;

    if (!className) {
      className = hasScroller ? styles.modalScroller : styles.modalBody;
    }

    return (
      <Scroller
        {...otherProps}
        ref={ref}
        className={className}
        scrollDirection={scrollDirection}
        scrollTop={0}
      >
        {hasScroller ? (
          <div className={innerClassName}>{children}</div>
        ) : (
          children
        )}
      </Scroller>
    );
  }
);

ModalBody.displayName = 'ModalBody';

export default ModalBody;
