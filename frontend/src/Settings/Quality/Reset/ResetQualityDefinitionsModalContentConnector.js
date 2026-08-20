import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import * as commandNames from 'Commands/commandNames';
import { useCommandExecuting, useExecuteCommand } from 'Commands/useCommands';
import ResetQualityDefinitionsModalContent from './ResetQualityDefinitionsModalContent';

function ResetQualityDefinitionsModalContentConnector(props) {
  const { onModalClose } = props;

  const executeCommand = useExecuteCommand();
  const isResettingQualityDefinitions = useCommandExecuting(
    commandNames.RESET_QUALITY_DEFINITIONS
  );

  const onResetQualityDefinitions = useCallback(
    (resetTitles) => {
      executeCommand({
        name: commandNames.RESET_QUALITY_DEFINITIONS,
        resetTitles,
      });

      onModalClose(true);
    },
    [executeCommand, onModalClose]
  );

  return (
    <ResetQualityDefinitionsModalContent
      {...props}
      isResettingQualityDefinitions={isResettingQualityDefinitions}
      onResetQualityDefinitions={onResetQualityDefinitions}
    />
  );
}

ResetQualityDefinitionsModalContentConnector.propTypes = {
  onModalClose: PropTypes.func.isRequired,
};

export default ResetQualityDefinitionsModalContentConnector;
