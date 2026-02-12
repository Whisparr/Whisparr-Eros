import PropTypes from 'prop-types';
import React from 'react';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableRow from 'Components/Table/TableRow';
import { icons } from 'Helpers/Props';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import styles from './ImportMovieRootFolderRow.css';

function ImportMovieRootFolderRow(props) {
  const {
    id,
    path,
    freeSpace,
    importFiles,
    onRefreshPress,
    onDeletePress
  } = props;

  const importFilesCount = importFiles.length || '-';
  const linkProps = { to: `/add/import/${id}` };

  return (
    <TableRow>
      <TableRowCell>
        <Link
          className={styles.link}
          {...linkProps}
        >
          {path}
        </Link>
      </TableRowCell>

      <TableRowCell className={styles.freeSpace}>
        {formatBytes(freeSpace) || '-'}
      </TableRowCell>

      <TableRowCell className={styles.importFiles}>
        {importFilesCount}
      </TableRowCell>

      <TableRowCell className={styles.actions}>
        <IconButton
          title={translate('ScanImportFolder')}
          name={icons.REFRESH}
          onPress={onRefreshPress}
        />
        <IconButton
          title={translate('RemoveRootFolder')}
          name={icons.REMOVE}
          onPress={onDeletePress}
        />
      </TableRowCell>
    </TableRow>
  );
}

ImportMovieRootFolderRow.propTypes = {
  id: PropTypes.number.isRequired,
  path: PropTypes.string.isRequired,
  freeSpace: PropTypes.number.isRequired,
  importFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRefreshPress: PropTypes.func.isRequired,
  onDeletePress: PropTypes.func.isRequired
};

ImportMovieRootFolderRow.defaultProps = {
  freeSpace: 0,
  importFiles: []
};

export default ImportMovieRootFolderRow;
