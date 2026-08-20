import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableRow from 'Components/Table/TableRow';
import { icons } from 'Helpers/Props';
import { useRefreshRootFolder } from 'RootFolder/useRootFolders';
import createSettingsSectionSelector from 'Store/Selectors/createSettingsSectionSelector';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import styles from './ImportMovieRootFolderRow.css';

const namingSelector = createSettingsSectionSelector('naming');

interface ImportFile {
  name: string;
}

interface ImportMovieRootFolderRowProps {
  id: number;
  path: string;
  freeSpace?: number;
  importFiles: ImportFile[];
}

function ImportMovieRootFolderRow({
  id,
  path,
  freeSpace,
  importFiles,
}: Readonly<ImportMovieRootFolderRowProps>) {
  const location = useLocation();
  const { refreshRootFolder } = useRefreshRootFolder();
  const { settings } = useSelector(namingSelector);

  const isMovies = location.pathname === '/add/import/movies';
  const linkTo = isMovies
    ? `/add/import/movies/${id}`
    : `/add/import/scenes/${id}`;
  const importFilesCount = importFiles.length || '-';

  const handleRefreshPress = useCallback(() => {
    refreshRootFolder({ id });
  }, [refreshRootFolder, id]);

  const sep = path.includes('\\') ? '\\' : '/';
  const importFormatValue = settings.sceneImportFolderFormat?.value;
  const importPath = importFormatValue ? sep + importFormatValue : undefined;

  return (
    <TableRow>
      <TableRowCell>
        <div className={styles.pathCell}>
          <Link className={styles.link} to={linkTo}>
            {path}
          </Link>
          {importPath ? (
            <span className={styles.importFormat}>{importPath}</span>
          ) : null}
        </div>
      </TableRowCell>

      <TableRowCell className={styles.freeSpace}>
        {freeSpace == null ? '-' : formatBytes(freeSpace) || '-'}
      </TableRowCell>

      <TableRowCell className={styles.importFiles}>
        {importFilesCount}
      </TableRowCell>

      <TableRowCell className={styles.actions}>
        <IconButton
          title={translate('ScanImportFolder')}
          name={icons.REFRESH}
          onPress={handleRefreshPress}
        />
      </TableRowCell>
    </TableRow>
  );
}

export default ImportMovieRootFolderRow;
