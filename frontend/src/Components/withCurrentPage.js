import React from 'react';
import { useNavigationType } from 'react-router-dom';

function withCurrentPage(WrappedComponent) {
  function CurrentPage(props) {
    const navigationType = useNavigationType();

    return (
      <WrappedComponent {...props} useCurrentPage={navigationType === 'POP'} />
    );
  }

  return CurrentPage;
}

export default withCurrentPage;
