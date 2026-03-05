import React from 'react';
import {
  useMarkHistoryFailed,
  useMovieHistory,
} from 'Activity/History/useHistory';
import Alert from 'Components/Alert';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import Column from 'Components/Table/Column';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import { icons, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import MovieHistoryRow from './MovieHistoryRow';

const columns: Column[] = [
  {
    name: 'eventType',
    label: '',
    isVisible: true,
  },
  {
    name: 'sourceTitle',
    label: () => translate('SourceTitle'),
    isVisible: true,
  },
  {
    name: 'languages',
    label: () => translate('Languages'),
    isVisible: true,
  },
  {
    name: 'quality',
    label: () => translate('Quality'),
    isVisible: true,
  },
  {
    name: 'customFormats',
    label: () => translate('CustomFormats'),
    isSortable: false,
    isVisible: true,
  },
  {
    name: 'customFormatScore',
    label: React.createElement(Icon, {
      name: icons.SCORE,
      title: () => translate('CustomFormatScore'),
    }),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'date',
    label: () => translate('Date'),
    isVisible: true,
  },
  {
    name: 'actions',
    label: '',
    isVisible: true,
  },
];

export interface MovieHistoryModalContentProps {
  movieId: number;
  onModalClose: () => void;
}

function MovieHistoryModalContent({
  movieId,
  onModalClose,
}: MovieHistoryModalContentProps) {
  const { data: items, isFetching, error } = useMovieHistory(movieId);
  const { mutate: markHistoryFailed } = useMarkHistoryFailed();

  function handleMarkAsFailedPress(historyId: number) {
    markHistoryFailed(historyId);
  }

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('History')}</ModalHeader>

      <ModalBody>
        {isFetching && !items ? <LoadingIndicator /> : null}

        {!isFetching && !!error ? (
          <Alert kind={kinds.DANGER}>{translate('HistoryLoadError')}</Alert>
        ) : null}

        {!isFetching && !items && !error ? (
          <div>{translate('NoHistory')}</div>
        ) : null}

        {!isFetching && items && !error && (
          <Table columns={columns}>
            <TableBody>
              {items.map((item) => {
                return (
                  <MovieHistoryRow
                    key={item.id}
                    id={item.id}
                    eventType={item.eventType}
                    sourceTitle={item.sourceTitle}
                    languages={item.languages}
                    quality={item.quality}
                    qualityCutoffNotMet={item.qualityCutoffNotMet}
                    customFormats={item.customFormats}
                    customFormatScore={item.customFormatScore}
                    date={item.date}
                    // `item.data` can be various history payload shapes.
                    // Narrowing to `any` here to match `MovieHistoryRow`'s
                    // usage; the row component handles the shape at runtime.
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data={item.data as any}
                    downloadId={item.downloadId}
                    onMarkAsFailedPress={handleMarkAsFailedPress}
                  />
                );
              })}
            </TableBody>
          </Table>
        )}
      </ModalBody>

      <ModalFooter>
        <Button onPress={onModalClose}>{translate('Close')}</Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default MovieHistoryModalContent;
