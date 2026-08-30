import React, { useCallback, useState } from 'react';
import Icon from 'Components/Icon';
import RelativeDateCell from 'Components/Table/Cells/RelativeDateCell';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import Column from 'Components/Table/Column';
import TableRowButton from 'Components/Table/TableRowButton';
import { icons } from 'Helpers/Props';
import { LogEventLevel } from 'typings/LogEvent';
import LogsTableDetailsModal from './LogsTableDetailsModal';
import styles from './LogsTableRow.css';

function getIconName(level: LogEventLevel) {
  switch (level) {
    case 'trace':
    case 'debug':
    case 'info':
      return icons.INFO;
    case 'warn':
      return icons.DANGER;
    case 'error':
      return icons.BUG;
    case 'fatal':
      return icons.FATAL;
    default:
      return icons.UNKNOWN;
  }
}

interface LogsTableRowProps {
  level: LogEventLevel;
  time: string;
  logger: string;
  message: string;
  exception?: string;
  columns: Column[];
}

function LogsTableRow({
  level,
  time,
  logger,
  message,
  exception,
  columns,
}: LogsTableRowProps) {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handlePress = useCallback(() => {
    setIsDetailsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsDetailsModalOpen(false);
  }, []);

  return (
    <TableRowButton overlayContent={true} onPress={handlePress}>
      {columns.map((column) => {
        const { name, isVisible } = column;

        if (!isVisible) {
          return null;
        }

        if (name === 'level') {
          return (
            <TableRowCell key={name} className={styles.level}>
              <Icon
                className={styles[level]}
                name={getIconName(level)}
                title={level}
              />
            </TableRowCell>
          );
        }

        if (name === 'time') {
          return <RelativeDateCell key={name} date={time} />;
        }

        if (name === 'logger') {
          return <TableRowCell key={name}>{logger}</TableRowCell>;
        }

        if (name === 'message') {
          return <TableRowCell key={name}>{message}</TableRowCell>;
        }

        if (name === 'actions') {
          return <TableRowCell key={name} className={styles.actions} />;
        }

        return null;
      })}

      <LogsTableDetailsModal
        isOpen={isDetailsModalOpen}
        message={message}
        exception={exception}
        onModalClose={handleModalClose}
      />
    </TableRowButton>
  );
}

export default LogsTableRow;
