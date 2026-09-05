import React from 'react';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import translate from 'Utilities/String/translate';
import styles from './QueuedTaskRowNameCell.css';

export interface QueuedTaskRowNameCellProps {
  commandName: string;
  message?: string;
  clientUserAgent?: string;
}

export default function QueuedTaskRowNameCell(
  props: Readonly<QueuedTaskRowNameCellProps>
) {
  const { commandName, message, clientUserAgent } = props;

  return (
    <TableRowCell>
      <span className={styles.commandName}>
        {commandName}
        {message ? <span> - {message}</span> : null}
      </span>

      {clientUserAgent ? (
        <span
          className={styles.userAgent}
          title={translate('TaskUserAgentTooltip')}
        >
          {translate('From')}: {clientUserAgent}
        </span>
      ) : null}
    </TableRowCell>
  );
}
