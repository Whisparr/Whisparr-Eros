import React from 'react';
import * as commandNames from 'Commands/commandNames';
import { useCommandExecuting } from 'Commands/useCommands';
import Quality from './Quality';

// Quality is a class component, so it cannot read the command itself.
function QualityConnector() {
  const isResettingQualityDefinitions = useCommandExecuting(
    commandNames.RESET_QUALITY_DEFINITIONS
  );

  return (
    <Quality isResettingQualityDefinitions={isResettingQualityDefinitions} />
  );
}

export default QualityConnector;
