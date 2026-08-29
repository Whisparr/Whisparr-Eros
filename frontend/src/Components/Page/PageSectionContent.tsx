import React from 'react';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import { kinds } from 'Helpers/Props';
import { ApiError } from 'Utilities/Fetch/fetchJson';

interface PageSectionContentProps {
  isFetching: boolean;
  isPopulated: boolean;
  // Sections still on redux hand over the slice's error shape; converted ones
  // hand over whatever the query threw. Only presence is read either way.
  error?: ApiError;
  errorMessage: string;
  children: React.ReactNode;
}

function PageSectionContent({
  isFetching,
  isPopulated,
  error,
  errorMessage,
  children,
}: PageSectionContentProps) {
  if (isFetching && !isPopulated) {
    return <LoadingIndicator />;
  }

  if (!isFetching && !!error) {
    return <Alert kind={kinds.DANGER}>{errorMessage}</Alert>;
  }

  if (isPopulated && !error) {
    return <div>{children}</div>;
  }

  return null;
}

export default PageSectionContent;
