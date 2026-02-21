import React from 'react';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import translate from 'Utilities/String/translate';
import useExtraFile from '../useExtraFile';
import ExtraFileTableContent from './ExtraFileTableContent';

interface ExtraFileTableContentConnectorProps {
  movieId: number;
}

type Props = ExtraFileTableContentConnectorProps;

function ExtraFileTableContentConnector(props: Props) {
  const {
    data: extraFiles,
    isLoading,
    isError,
    error,
  } = useExtraFile(props.movieId);

  if (isError) {
    return (
      <Alert kind="danger">{`${translate('LoadingMovieExtraFilesFailed')}: ${
        error?.message
      }`}</Alert>
    );
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <ExtraFileTableContent movieId={props.movieId} items={extraFiles || []} />
  );
}

export default ExtraFileTableContentConnector;
