import React from 'react';
import IconButton from 'Components/Link/IconButton';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import ExtraFileRow, { ExtraFileRowProps } from './ExtraFileRow';
import styles from './ExtraFileTableContent.css';

const columns = [
  {
    name: 'relativePath',
    label: () => translate('RelativePath'),
    isVisible: true,
  },
  {
    name: 'extension',
    label: () => translate('Extension'),
    isVisible: true,
  },
  {
    name: 'type',
    label: () => translate('Type'),
    isVisible: true,
  },
  {
    name: 'action',
    label: React.createElement(IconButton, { name: icons.ADVANCED_SETTINGS }),
    isVisible: true,
  },
];

interface ExtraFileTableContentProps {
  movieId?: number;
  items: readonly ExtraFileRowProps[];
}

function ExtraFileTableContent({ items }: ExtraFileTableContentProps) {
  return (
    <div>
      {!items.length && (
        <div className={styles.blankpad}>
          {translate('NoExtraFilesToManage')}
        </div>
      )}
      {!!items.length && (
        <Table columns={columns}>
          <TableBody>
            {items.map((item) => (
              <ExtraFileRow key={item.id} {...item} />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default ExtraFileTableContent;
