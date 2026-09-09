import { ExtendedKeyboardEvent } from 'mousetrap';
import React, {
  FormEvent,
  KeyboardEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Autosuggest from 'react-autosuggest';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import Icon from 'Components/Icon';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import useKeyboardShortcuts from 'Helpers/Hooks/useKeyboardShortcuts';
import { icons } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import { useSearchMovieUncached } from 'Movie/useMovie';
import translate from 'Utilities/String/translate';
import MovieSearchResult from './MovieSearchResult';
import styles from './MovieSearchInput.css';

const ADD_NEW_MOVIE = 'addNewMovie';
const ADD_NEW_SCENE = 'addNewScene';

interface Match {
  key: string;
  refIndex: number;
}

interface AddNewMovieSuggestion {
  type: 'addNewMovie' | 'addNewScene';
  title: string;
}

// prettier-ignore
export interface SuggestedMovie extends Pick<
  Movie,
  | 'title'
  | 'year'
  | 'titleSlug'
  | 'sortTitle'
  | 'images'
  | 'tmdbId'
  | 'itemType'
  | 'studioTitle'
  | 'genres'
  | 'performerNames'
  | 'runtime'
  | 'releaseDate'
> {
  firstCharacter: string;
  tags: number[];
}

interface MovieSuggestion {
  title: string;
  indices: number[];
  item: SuggestedMovie;
  matches: Match[];
  refIndex: number;
}

interface Section {
  title: string;
  loading?: boolean;
  suggestions: MovieSuggestion[] | AddNewMovieSuggestion[];
}

function moviesToSuggestions(movies: readonly Movie[]): MovieSuggestion[] {
  return movies.map((m, i) => ({
    key: m.id,
    title: m.title,
    indices: [],
    item: {
      ...m,
      firstCharacter: m.title.charAt(0).toLowerCase(),
      tags: m.tags || [],
    },
    matches: [],
    refIndex: i,
  }));
}

function MovieSearchInput() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [debouncedValue] = useDebounce(value, 250);

  const { data: movies = [], isLoading } =
    useSearchMovieUncached(debouncedValue);

  const { bindShortcut, unbindShortcut } = useKeyboardShortcuts();
  const autosuggestRef = useRef<Autosuggest>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => moviesToSuggestions(movies), [movies]);

  const suggestionGroups = useMemo(() => {
    const result: Section[] = [];
    if (suggestions.length || isLoading) {
      result.push({
        title: translate('Existing'),
        loading: isLoading,
        suggestions,
      });
    }
    result.push({
      title: translate('Add'),
      suggestions: [
        { type: ADD_NEW_MOVIE, title: value },
        { type: ADD_NEW_SCENE, title: value },
      ],
    });
    return result;
  }, [suggestions, value, isLoading]);

  const focusInput = useCallback((event: ExtendedKeyboardEvent) => {
    event.preventDefault();
    inputRef.current?.focus();
  }, []);

  const getSectionSuggestions = useCallback((section: Section) => {
    return section.suggestions;
  }, []);

  const renderSectionTitle = useCallback((section: Section) => {
    return (
      <div className={styles.sectionTitle}>
        {section.title}

        {section.loading && (
          <LoadingIndicator
            className={styles.loading}
            rippleClassName={styles.ripple}
            size={20}
          />
        )}
      </div>
    );
  }, []);

  const getSuggestionValue = useCallback(({ title }: { title: string }) => {
    return title;
  }, []);

  const renderSuggestion = useCallback(
    (
      item: AddNewMovieSuggestion | MovieSuggestion,
      { query }: { query: string }
    ) => {
      if ('type' in item) {
        if (item.type === ADD_NEW_MOVIE) {
          return (
            <div className={styles.addNewMovieSuggestion}>
              {`Add new movie: "${query}"`}
            </div>
          );
        }
        if (item.type === ADD_NEW_SCENE) {
          return (
            <div className={styles.addNewMovieSuggestion}>
              {`Add new scene: "${query}"`}
            </div>
          );
        }
      }
      const movieItem = item as MovieSuggestion;
      return (
        <MovieSearchResult {...movieItem.item} match={movieItem.matches[0]} />
      );
    },
    []
  );

  const handleChange = useCallback(
    (
      _event: FormEvent<HTMLElement>,
      {
        newValue,
        method,
      }: {
        newValue: string;
        method: 'down' | 'up' | 'escape' | 'enter' | 'click' | 'type';
      }
    ) => {
      if (method === 'up' || method === 'down') return;
      setValue(newValue);
    },
    []
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.shiftKey || event.altKey || event.ctrlKey) return;
      if (event.key === 'Escape') {
        setValue('');
        return;
      }
      if (event.key !== 'Tab' && event.key !== 'Enter') return;
      if (!autosuggestRef.current) return;

      // Tab in an empty box should move focus, not run a search for nothing.
      if (!inputRef.current?.value) return;

      const { highlightedSectionIndex, highlightedSuggestionIndex } =
        autosuggestRef.current.state;
      if (!suggestions.length || highlightedSectionIndex) {
        navigate(`/add/new/movie?term=${encodeURIComponent(value)}`);
        inputRef.current?.blur();
        return;
      }
      const selectedSuggestion =
        highlightedSuggestionIndex == null
          ? suggestions[0]
          : suggestions[highlightedSuggestionIndex];
      navigate(`/movie/${selectedSuggestion.item.titleSlug}`);
      inputRef.current?.blur();
    },
    [value, suggestions, navigate]
  );

  const handleSuggestionSelected = useCallback(
    (
      _event: SyntheticEvent,
      { suggestion }: { suggestion: MovieSuggestion | AddNewMovieSuggestion }
    ) => {
      if ('type' in suggestion) {
        if (suggestion.type === ADD_NEW_MOVIE) {
          navigate(`/add/new/movie?term=${encodeURIComponent(value)}`);
        } else if (suggestion.type === ADD_NEW_SCENE) {
          navigate(`/add/new/scene?term=${encodeURIComponent(value)}`);
        }
      } else {
        setValue('');
        navigate(`/movie/${suggestion.item.titleSlug}`);
      }
    },
    [value, navigate]
  );

  const inputProps = {
    ref: inputRef,
    className: styles.input,
    name: 'movieSearch',
    value,
    placeholder: translate('Search'),
    autoComplete: 'off',
    spellCheck: false,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
  };

  const theme = {
    container: styles.container,
    containerOpen: styles.containerOpen,
    suggestionsContainer: styles.movieContainer,
    suggestionsList: styles.list,
    suggestion: styles.listItem,
    suggestionHighlighted: styles.highlighted,
  };

  useEffect(() => {
    bindShortcut('focusMovieSearchInput', focusInput);
    return () => {
      unbindShortcut('focusMovieSearchInput');
    };
  }, [bindShortcut, unbindShortcut, focusInput]);

  // Dummy handlers for Autosuggest (required)
  const handleSuggestionsFetchRequested = useCallback(() => {}, []);
  const handleSuggestionsClearRequested = useCallback(() => {}, []);

  return (
    <div className={styles.wrapper}>
      <Icon name={icons.SEARCH} />
      <Autosuggest
        ref={autosuggestRef}
        inputProps={inputProps}
        theme={theme}
        focusInputOnSuggestionClick={false}
        multiSection={true}
        suggestions={suggestionGroups}
        getSectionSuggestions={getSectionSuggestions}
        renderSectionTitle={renderSectionTitle}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        onSuggestionSelected={handleSuggestionSelected}
        onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
        onSuggestionsClearRequested={handleSuggestionsClearRequested}
      />
    </div>
  );
}

export default MovieSearchInput;
