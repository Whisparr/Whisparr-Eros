import React from 'react';
import IconButton from 'Components/Link/IconButton';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableRow from 'Components/Table/TableRow';
import { icons } from 'Helpers/Props';
import titleCase from 'Utilities/String/titleCase';
import styles from './ExtraFileRow.css';

export interface ExtraFileRowProps {
  id: number;
  extension: string;
  type: string;
  relativePath: string;
  movieId: number;
}

function ExtraFileRow({ relativePath, extension, type }: ExtraFileRowProps) {
  return (
    <TableRow>
      <TableRowCell className={styles.relativePath} title={relativePath}>
        {relativePath}
      </TableRowCell>
      <TableRowCell className={styles.extension} title={extension}>
        {extension}
      </TableRowCell>
      <TableRowCell className={styles.type} title={type}>
        {titleCase(type)}
      </TableRowCell>
      <TableRowCell>
        <IconButton name={icons.INFO} />
      </TableRowCell>
    </TableRow>
  );
}

export default ExtraFileRow;
