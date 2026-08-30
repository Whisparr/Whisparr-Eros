import React from 'react';
import { useNavigationType } from 'react-router-dom';
import scrollPositions from 'Helpers/scrollPositions';

interface WrappedComponentProps {
  initialScrollTop: number;
}

function withScrollPosition(
  WrappedComponent: React.FC<WrappedComponentProps>,
  scrollPositionKey: string
) {
  function ScrollPosition(props: object) {
    const navigationType = useNavigationType();

    const initialScrollTop =
      navigationType === 'POP' ? scrollPositions[scrollPositionKey] : 0;

    return (
      <WrappedComponent
        {...(props as WrappedComponentProps)}
        initialScrollTop={initialScrollTop}
      />
    );
  }

  return ScrollPosition;
}

export default withScrollPosition;
