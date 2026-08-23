import React from 'react';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';

interface QualityDefinitionLimitsProps {
  bytes: number | null;
  message: string;
}

function QualityDefinitionLimits({
  bytes,
  message,
}: Readonly<QualityDefinitionLimitsProps>) {
  if (!bytes) {
    return <div>{message}</div>;
  }

  const sixty = formatBytes(bytes * 60);
  const ninety = formatBytes(bytes * 90);
  const hundredTwenty = formatBytes(bytes * 120);

  return (
    <div>
      <div>{translate('MinutesSixty', { sixty })}</div>
      <div>{translate('MinutesNinety', { ninety })}</div>
      <div>{translate('MinutesHundredTwenty', { hundredTwenty })}</div>
    </div>
  );
}

export default QualityDefinitionLimits;
