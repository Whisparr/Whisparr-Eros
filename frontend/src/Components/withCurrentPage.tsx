import React, { ComponentType } from 'react';
import { useNavigationType } from 'react-router-dom';

function withCurrentPage<P extends object>(
  WrappedComponent: ComponentType<P & { useCurrentPage: boolean }>
) {
  function CurrentPage(props: P) {
    const navigationType = useNavigationType();

    return (
      <WrappedComponent {...props} useCurrentPage={navigationType === 'POP'} />
    );
  }

  return CurrentPage;
}

export default withCurrentPage;
