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
import Performer from 'Performer/Performer';
import useLibrarySearch from 'Search/useLibrarySearch';
import Studio from 'Studio/Studio';
import translate from 'Utilities/String/translate';
import MovieSearchResult from './MovieSearchResult';
import PerformerSearchResult from './PerformerSearchResult';
import StudioSearchResult from './StudioSearchResult';
import styles from './MovieSearchInput.css';

const ADD_NEW_MOVIE = 'addNewMovie';
const ADD_NEW_SCENE = 'addNewScene';

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
  type: 'movie';
  title: string;
  item: SuggestedMovie;
}

interface PerformerSuggestion {
  type: 'performer';
  title: string;
  item: Performer;
}

interface StudioSuggestion {
  type: 'studio';
  title: string;
  item: Studio;
}

type Suggestion =
  | AddNewMovieSuggestion
  | MovieSuggestion
  | PerformerSuggestion
  | StudioSuggestion;

interface Section {
  title: string;
  loading?: boolean;
  suggestions: Suggestion[];
}

function moviesToSuggestions(movies: readonly Movie[]): MovieSuggestion[] {
  return movies.map((m) => ({
    type: 'movie',
    title: m.title,
    item: {
      ...m,
      firstCharacter: m.title.charAt(0).toLowerCase(),
      tags: m.tags || [],
    },
  }));
}

function performersToSuggestions(
  performers: readonly Performer[]
): PerformerSuggestion[] {
  return performers.map((p) => ({
    type: 'performer',
    title: p.fullName || p.name,
    item: p,
  }));
}

function studiosToSuggestions(studios: readonly Studio[]): StudioSuggestion[] {
  return studios.map((s) => ({ type: 'studio', title: s.title, item: s }));
}

function getSuggestionPath(suggestion: Suggestion, term: string) {
  switch (suggestion.type) {
    case ADD_NEW_MOVIE:
      return `/add/new/movie?term=${encodeURIComponent(term)}`;
    case ADD_NEW_SCENE:
      return `/add/new/scene?term=${encodeURIComponent(term)}`;
    case 'performer':
      return `/performer/${suggestion.item.foreignId}`;
    case 'studio':
      return `/studio/${suggestion.item.foreignId}`;
    default:
      return `/movie/${suggestion.item.titleSlug}`;
  }
}

function MovieSearchInput() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [debouncedValue] = useDebounce(value, 250);

  const { data, isLoading } = useLibrarySearch(debouncedValue);

  const { bindShortcut, unbindShortcut } = useKeyboardShortcuts();
  const autosuggestRef = useRef<Autosuggest>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resultSections = useMemo(() => {
    const sections: Section[] = [
      {
        title: translate('Performers'),
        suggestions: performersToSuggestions(data?.performers.records ?? []),
      },
      {
        title: translate('Studios'),
        suggestions: studiosToSuggestions(data?.studios.records ?? []),
      },
      {
        title: translate('Scenes'),
        suggestions: moviesToSuggestions(data?.scenes.records ?? []),
      },
      {
        title: translate('Movies'),
        suggestions: moviesToSuggestions(data?.movies.records ?? []),
      },
    ];

    return sections.filter((section) => section.suggestions.length);
  }, [data]);

  const suggestionGroups = useMemo(() => {
    const result: Section[] = [...resultSections];

    if (isLoading) {
      result.unshift({
        title: translate('Existing'),
        loading: true,
        suggestions: [],
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
  }, [resultSections, value, isLoading]);

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
    (item: Suggestion, { query }: { query: string }) => {
      switch (item.type) {
        case ADD_NEW_MOVIE:
          return (
            <div className={styles.addNewMovieSuggestion}>
              {`Add new movie: "${query}"`}
            </div>
          );
        case ADD_NEW_SCENE:
          return (
            <div className={styles.addNewMovieSuggestion}>
              {`Add new scene: "${query}"`}
            </div>
          );
        case 'performer':
          return <PerformerSearchResult {...item.item} />;
        case 'studio':
          return <StudioSearchResult {...item.item} />;
        default:
          return <MovieSearchResult {...item.item} />;
      }
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

      const selectedSuggestion =
        highlightedSectionIndex == null || highlightedSuggestionIndex == null
          ? resultSections[0]?.suggestions[0]
          : suggestionGroups[highlightedSectionIndex]?.suggestions[
              highlightedSuggestionIndex
            ];

      navigate(
        getSuggestionPath(
          selectedSuggestion ?? { type: ADD_NEW_MOVIE, title: value },
          value
        )
      );
      inputRef.current?.blur();
    },
    [value, resultSections, suggestionGroups, navigate]
  );

  const handleSuggestionSelected = useCallback(
    (_event: SyntheticEvent, { suggestion }: { suggestion: Suggestion }) => {
      if (
        suggestion.type !== ADD_NEW_MOVIE &&
        suggestion.type !== ADD_NEW_SCENE
      ) {
        setValue('');
      }

      navigate(getSuggestionPath(suggestion, value));
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
