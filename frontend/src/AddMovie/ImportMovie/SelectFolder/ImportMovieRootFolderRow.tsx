import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableRow from 'Components/Table/TableRow';
import { icons } from 'Helpers/Props';
import { refreshRootFolder } from 'Store/Actions/rootFolderActions';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import styles from './ImportMovieRootFolderRow.css';

interface ImportFile {
  name: string;
}

interface ImportMovieRootFolderRowProps {
  id: number;
  path: string;
  freeSpace: number;
  importFiles: ImportFile[];
}

function ImportMovieRootFolderRow({
  id,
  path,
  freeSpace,
  importFiles,
}: Readonly<ImportMovieRootFolderRowProps>) {
  const dispatch = useDispatch();
  const location = useLocation();

  const isMovies = location.pathname === '/add/import/movies';
  const linkTo = isMovies
    ? `/add/import/movies/${id}`
    : `/add/import/scenes/${id}`;
  const importFilesCount = importFiles.length || '-';

  const onRefreshPress = useCallback(() => {
    dispatch(refreshRootFolder({ id }));
  }, [dispatch, id]);

  return (
    <TableRow>
      <TableRowCell>
        <Link className={styles.link} to={linkTo}>
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
      </TableRowCell>
    </TableRow>
  );
}

export default ImportMovieRootFolderRow;
