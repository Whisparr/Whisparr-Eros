import React from 'react';
import { ParseModel } from 'App/State/ParseAppState';
import FieldSet from 'Components/FieldSet';
import MovieFormats from 'Movie/MovieFormats';
import MovieTitleLink from 'Movie/MovieTitleLink';
import translate from 'Utilities/String/translate';
import ParseResultItem from './ParseResultItem';
import styles from './ParseResult.css';

interface ParseResultProps {
  item: ParseModel;
}

function ParseResult(props: ParseResultProps) {
  const { item } = props;
  const {
    customFormats,
    customFormatScore,
    languages,
    parsedMovieInfo,
    movie,
  } = item;

  const {
    releaseTitle,
    isScene,
    episode,
    releaseTokens,
    movieTitle,
    movieTitles,
    studioTitle,
    releaseDate,
    year,
    edition,
    releaseGroup,
    releaseHash,
    quality,
    tmdbId,
  } = parsedMovieInfo;

  const finalLanguages = languages ?? parsedMovieInfo.languages;

  return (
    <div>
      <FieldSet legend={translate('Release')}>
        <ParseResultItem
          title={translate('ReleaseTitle')}
          data={releaseTitle}
        />

        <ParseResultItem
          title={translate('ReleaseType')}
          data={isScene ? 'Scene' : 'Movie'}
        />

        {isScene ? (
          <ParseResultItem
            title={translate('StudioTitle')}
            data={studioTitle}
          />
        ) : (
          <ParseResultItem title={translate('MovieTitle')} data={movieTitle} />
        )}

        {isScene ? (
          <ParseResultItem
            title={translate('ReleaseDate')}
            data={releaseDate}
          />
        ) : (
          <ParseResultItem
            title={translate('Year')}
            data={year > 0 ? year : '-'}
          />
        )}

        {episode ? (
          <ParseResultItem title={translate('Episode')} data={episode} />
        ) : null}

        {edition ? (
          <ParseResultItem
            title={translate('Edition')}
            data={edition ? edition : '-'}
          />
        ) : null}

        <ParseResultItem
          title={translate('ReleaseToken')}
          data={releaseTokens}
        />

        {movieTitles?.length > 0 ? (
          <ParseResultItem
            title={translate('AllTitles')}
            data={movieTitles.join(', ')}
          />
        ) : null}

        {releaseGroup ? (
          <ParseResultItem
            title={translate('ReleaseGroup')}
            data={releaseGroup ?? '-'}
          />
        ) : null}

        {releaseHash ? (
          <ParseResultItem
            title={translate('ReleaseHash')}
            data={releaseHash ? releaseHash : '-'}
          />
        ) : null}

        {tmdbId ? (
          <ParseResultItem title={translate('TMDBId')} data={tmdbId} />
        ) : null}
      </FieldSet>

      <FieldSet legend={translate('Details')}>
        <ParseResultItem
          title={translate('MatchedToMovie')}
          data={
            movie ? (
              <MovieTitleLink
                titleSlug={movie.titleSlug}
                title={movie.title}
                year={movie.year}
              />
            ) : (
              '-'
            )
          }
        />

        {customFormats?.length ? (
          <ParseResultItem
            title={translate('CustomFormats')}
            data={
              customFormats?.length ? (
                <MovieFormats formats={customFormats} />
              ) : (
                '-'
              )
            }
          />
        ) : null}

        {customFormatScore ? (
          <ParseResultItem
            title={translate('CustomFormatScore')}
            data={customFormatScore}
          />
        ) : null}
      </FieldSet>

      <FieldSet legend={translate('Quality')}>
        <div className={styles.container}>
          <div className={styles.column}>
            <ParseResultItem
              title={translate('Quality')}
              data={quality.quality.name}
            />

            {quality.revision.version > 1 && !quality.revision.isRepack ? (
              <ParseResultItem
                title={translate('Proper')}
                data={
                  quality.revision.version > 1 && !quality.revision.isRepack
                    ? 'True'
                    : '-'
                }
              />
            ) : null}

            {quality.revision.isRepack ? (
              <ParseResultItem
                title={translate('Repack')}
                data={quality.revision.isRepack ? translate('True') : '-'}
              />
            ) : null}
          </div>

          <div className={styles.column}>
            {quality.revision.version > 1 ? (
              <ParseResultItem
                title={translate('Version')}
                data={
                  quality.revision.version > 1 ? quality.revision.version : '-'
                }
              />
            ) : null}

            {quality.revision.real ? (
              <ParseResultItem
                title={translate('Real')}
                data={quality.revision.real ? translate('True') : '-'}
              />
            ) : null}
          </div>
        </div>
      </FieldSet>

      <FieldSet legend={translate('Languages')}>
        <ParseResultItem
          title={translate('Languages')}
          data={finalLanguages.map((l) => l.name).join(', ')}
        />

        {movie && movie.originalLanguage ? (
          <ParseResultItem
            title={translate('OriginalLanguage')}
            data={movie.originalLanguage.name}
          />
        ) : null}
      </FieldSet>
    </div>
  );
}

export default ParseResult;
