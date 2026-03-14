import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TextInput from 'Components/Form/TextInput';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import Scroller from 'Components/Scroller/Scroller';
import Column from 'Components/Table/Column';
import VirtualTableRowButton from 'Components/Table/VirtualTableRowButton';
import { NONE } from 'Helpers/Props/scrollDirections';
import Movie from 'Movie/Movie';
import { useSearchMovie } from 'Movie/useMovie';
import { InputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import SelectMovieModalTableHeader from './SelectMovieModalTableHeader';
import SelectMovieRow from './SelectMovieRow';
import styles from './SelectMovieModalContent.css';

const columns: Column[] = [
  { name: 'studioTitle', label: () => translate('Studio'), isVisible: true },
  { name: 'title', label: () => translate('Title'), isVisible: true },
  { name: 'performers', label: () => translate('Performers'), isVisible: true },
  {
    name: 'releaseDate',
    label: () => translate('ReleaseDate'),
    isVisible: true,
  },
];

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  borderTop: '1px solid #858585',
  justifyContent: 'space-between',
};

interface MovieRowItemProps {
  movie: Movie;
  onMovieSelect(movie: Movie): void;
}

function MovieRowItem({ movie, onMovieSelect }: Readonly<MovieRowItemProps>) {
  const handlePress = useCallback(() => {
    onMovieSelect(movie);
  }, [movie, onMovieSelect]);

  const joinedPerformers = useMemo(() => {
    if (!Array.isArray(movie.performerNames)) return '';
    return movie.performerNames
      .slice(0, 5)
      .filter((n): n is string => typeof n === 'string' && n.length > 0)
      .sort((a, b) => a.localeCompare(b))
      .join(', ');
  }, [movie.performerNames]);

  return (
    <VirtualTableRowButton style={rowStyle} onPress={handlePress}>
      <SelectMovieRow
        title={movie.title}
        performers={joinedPerformers}
        studioTitle={movie.studioTitle}
        releaseDate={movie.releaseDate}
      />
    </VirtualTableRowButton>
  );
}

interface SelectMovieModalContentProps {
  modalTitle: string;
  relativePath: string;
  onMovieSelect(movie: Movie): void;
  onModalClose(): void;
}

function SelectMovieModalContent(props: SelectMovieModalContentProps) {
  const { modalTitle, relativePath, onMovieSelect, onModalClose } = props;

  const [filter, setFilter] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const debouncedSetQuery = useMemo(
    () => debounce((val: string) => setDebouncedQuery(val), 250),
    []
  );

  const { data } = useSearchMovie(debouncedQuery, 25);

  // Force results to clear if the filter is cleared/reset
  const items = debouncedQuery.length > 2 ? (data ?? []) : [];

  const onFilterChange = useCallback(
    ({ value }: InputChanged<string>) => {
      setFilter(value);
      debouncedSetQuery(value);
    },
    [debouncedSetQuery]
  );

  useEffect(() => {
    return () => {
      debouncedSetQuery.cancel();
    };
  }, [debouncedSetQuery]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {translate('SelectMovieModalTitle', { modalTitle })}
      </ModalHeader>

      <ModalBody className={styles.modalBody} scrollDirection={NONE}>
        <TextInput
          className={styles.filterInput}
          placeholder={translate('FilterMoviePlaceholder')}
          name="filter"
          value={filter}
          autoFocus={true}
          onChange={onFilterChange}
        />

        {items.length > 0 ? (
          <SelectMovieModalTableHeader columns={columns} />
        ) : null}
        <Scroller className={styles.scroller} autoFocus={false}>
          {items.map((movie) => (
            <MovieRowItem
              key={movie.id}
              movie={movie}
              onMovieSelect={onMovieSelect}
            />
          ))}
        </Scroller>
      </ModalBody>

      <ModalFooter className={styles.footer}>
        <div className={styles.path}>{relativePath}</div>
        <Button onPress={onModalClose}>{translate('Cancel')}</Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default SelectMovieModalContent;
