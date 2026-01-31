import React from 'react';
import Scroller from 'Components/Scroller/Scroller';
import {
  NONE,
  ScrollDirection,
  VERTICAL,
} from 'Helpers/Props/scrollDirections';
import styles from './ModalBody.css';

interface ModalBodyProps {
  className?: string;
  innerClassName?: string;
  children?: React.ReactNode;
  scrollDirection?: ScrollDirection;
}

function ModalBody({
  innerClassName = styles.innerModalBody,
  scrollDirection = VERTICAL,
  children,
  ...otherProps
}: ModalBodyProps) {
  let className = otherProps.className;
  const hasScroller = scrollDirection !== NONE;

  if (!className) {
    className = hasScroller ? styles.modalScroller : styles.modalBody;
  }

  return (
    <Scroller
      {...otherProps}
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

export default ModalBody;
