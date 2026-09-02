import React from 'react';
import IconButton from 'Components/Link/IconButton';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableRow from 'Components/Table/TableRow';
import { icons } from 'Helpers/Props';
import { ExtraFile } from 'MovieFile/ExtraFile';
import titleCase from 'Utilities/String/titleCase';
import translate from 'Utilities/String/translate';
import styles from './ExtraFileRow.css';

export type ExtraFileRowProps = Omit<ExtraFile, 'movieFileId'>;

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
        <IconButton name={icons.INFO} aria-label={translate('Details')} />
      </TableRowCell>
    </TableRow>
  );
}

export default ExtraFileRow;
