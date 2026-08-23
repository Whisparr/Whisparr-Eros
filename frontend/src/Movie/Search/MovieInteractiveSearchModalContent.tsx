import React from 'react';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { BOTH } from 'Helpers/Props/scrollDirections';
import InteractiveSearch from 'InteractiveSearch/InteractiveSearch';
import { useMovie } from 'Movie/useMovie';
import { useUiSettingsValues } from 'Settings/UI/useUiSettings';
import getRelativeDate from 'Utilities/Date/getRelativeDate';
import translate from 'Utilities/String/translate';

export interface MovieInteractiveSearchModalContentProps {
  movieId: number;
  onModalClose(): void;
}

function MovieInteractiveSearchModalContent({
  movieId,
  onModalClose,
}: MovieInteractiveSearchModalContentProps) {
  const movie = useMovie(movieId).data;

  const { showRelativeDates, shortDateFormat } = useUiSettingsValues();

  if (!movie) {
    return null;
  }

  const date = getRelativeDate({
    date: movie.releaseDate,
    shortDateFormat,
    showRelativeDates,
  });

  const movieTitle = `${movie.title}${date ? ` (${date})` : ''}`;

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {movieTitle
          ? translate('InteractiveSearchModalHeaderTitle', {
              title: movieTitle,
            })
          : translate('InteractiveSearchModalHeader')}
      </ModalHeader>

      <ModalBody scrollDirection={BOTH}>
        <InteractiveSearch searchPayload={{ movieId }} />
      </ModalBody>

      <ModalFooter>
        <Button onPress={onModalClose}>{translate('Close')}</Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default MovieInteractiveSearchModalContent;
