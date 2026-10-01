import React, { useCallback, useMemo } from 'react';
import SelectInput, { SelectInputOption } from 'Components/Form/SelectInput';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import RelativeDateCell from 'Components/Table/Cells/RelativeDateCell';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableSelectCell from 'Components/Table/Cells/TableSelectCell';
import Column from 'Components/Table/Column';
import TableRow from 'Components/Table/TableRow';
import { icons, kinds } from 'Helpers/Props';
import MovieQuality from 'Movie/MovieQuality';
import { InputChanged } from 'typings/inputs';
import { SelectStateInputProps } from 'typings/props';
import Review, { MovieParseMatchType, ReviewCandidate } from 'typings/Review';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import styles from './ReviewRow.module.css';

export interface ReviewOverride {
  movieId?: number;
  qualityId?: number;
}

interface ReviewRowProps extends Review {
  isSelected: boolean;
  columns: Column[];
  qualityOptions: SelectInputOption[];
  override?: ReviewOverride;
  isApproving: boolean;
  onSelectedChange: (options: SelectStateInputProps) => void;
  onOverrideChange: (id: number, override: ReviewOverride) => void;
  onApprovePress: (id: number) => void;
  onRejectPress: (id: number) => void;
  onRemovePress: (id: number) => void;
}

function getMatchTypeLabel(matchType?: MovieParseMatchType) {
  if (!matchType) {
    return null;
  }

  const key = matchType.charAt(0).toUpperCase() + matchType.slice(1);

  return translate(`ReviewMatchType${key}`);
}

function getSceneTitle(candidate: ReviewCandidate) {
  if (!candidate.title) {
    return translate('ReviewSceneMissing');
  }

  return [candidate.studioTitle, candidate.releaseDate, candidate.title]
    .filter(Boolean)
    .join(' · ');
}

function ReviewRow(props: ReviewRowProps) {
  const {
    id,
    candidates,
    title,
    indexer,
    infoUrl,
    size,
    quality,
    reasons,
    publishDate,
    added,
    isSelected,
    columns,
    qualityOptions,
    override,
    isApproving,
    onSelectedChange,
    onOverrideChange,
    onApprovePress,
    onRejectPress,
    onRemovePress,
  } = props;

  const selectedMovieId = override?.movieId ?? candidates[0]?.movieId;

  const candidate = useMemo(() => {
    return (
      candidates.find((c) => c.movieId === selectedMovieId) ?? candidates[0]
    );
  }, [candidates, selectedMovieId]);

  const otherCandidates = useMemo(() => {
    return candidates.filter((c) => c.movieId !== candidate?.movieId);
  }, [candidates, candidate]);

  const isQualityUnknown = quality.quality.id === 0;

  const candidateOptions = useMemo<SelectInputOption[]>(() => {
    return candidates.map((c) => ({
      key: c.movieId,
      value: getSceneTitle(c),
    }));
  }, [candidates]);

  const handleCandidateChange = useCallback(
    ({ value }: InputChanged<string>) => {
      onOverrideChange(id, { ...override, movieId: Number(value) });
    },
    [id, override, onOverrideChange]
  );

  const handleQualityChange = useCallback(
    ({ value }: InputChanged<string>) => {
      const qualityId = Number(value);

      onOverrideChange(id, {
        ...override,
        qualityId: qualityId > 0 ? qualityId : undefined,
      });
    },
    [id, override, onOverrideChange]
  );

  const handleApprovePress = useCallback(() => {
    onApprovePress(id);
  }, [id, onApprovePress]);

  const handleRejectPress = useCallback(() => {
    onRejectPress(id);
  }, [id, onRejectPress]);

  const handleRemovePress = useCallback(() => {
    onRemovePress(id);
  }, [id, onRemovePress]);

  return (
    <TableRow>
      <TableSelectCell
        id={id}
        isSelected={isSelected}
        onSelectedChange={onSelectedChange}
      />

      {columns.map((column) => {
        const { name, isVisible } = column;

        if (!isVisible) {
          return null;
        }

        if (name === 'movieMetadata.sortTitle') {
          return (
            <TableRowCell key={name} className={styles.scene}>
              {candidate?.titleSlug ? (
                <Link to={`/movie/${candidate.titleSlug}`}>
                  {candidate.title}
                </Link>
              ) : (
                getSceneTitle(candidate)
              )}

              {candidate?.title ? (
                <div className={styles.sceneDetails}>
                  {[
                    candidate.studioTitle,
                    candidate.releaseDate,
                    candidate.code,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
              ) : null}
            </TableRowCell>
          );
        }

        if (name === 'title') {
          return (
            <TableRowCell key={name}>
              {infoUrl ? (
                <Link to={infoUrl} title={title}>
                  {title}
                </Link>
              ) : (
                title
              )}
            </TableRowCell>
          );
        }

        if (name === 'indexer') {
          return (
            <TableRowCell key={name} className={styles.indexer}>
              {indexer}
            </TableRowCell>
          );
        }

        if (name === 'size') {
          return (
            <TableRowCell key={name} className={styles.size}>
              {formatBytes(size)}
            </TableRowCell>
          );
        }

        if (name === 'quality') {
          return (
            <TableRowCell key={name} className={styles.quality}>
              {isQualityUnknown ? (
                <SelectInput
                  className={styles.select}
                  name={`quality-${id}`}
                  value={override?.qualityId ?? 0}
                  values={qualityOptions}
                  onChange={handleQualityChange}
                />
              ) : (
                <MovieQuality quality={quality} />
              )}
            </TableRowCell>
          );
        }

        if (name === 'match') {
          return (
            <TableRowCell key={name} className={styles.match}>
              <div className={styles.labels}>
                {candidate?.matchType ? (
                  <Label kind={kinds.INFO}>
                    {getMatchTypeLabel(candidate.matchType)}
                  </Label>
                ) : null}

                {reasons.includes('ambiguousMatch') ? (
                  <Label kind={kinds.WARNING}>
                    {translate('ReviewReasonAmbiguousMatch', {
                      count: candidates.length,
                    })}
                  </Label>
                ) : null}

                {reasons.includes('unknownQuality') ? (
                  <Label kind={kinds.WARNING}>
                    {translate('ReviewReasonUnknownQuality')}
                  </Label>
                ) : null}
              </div>

              {otherCandidates.length ? (
                <>
                  <div className={styles.alsoFits}>
                    {translate('ReviewAlsoFits', {
                      scenes: otherCandidates.map(getSceneTitle).join(', '),
                    })}
                  </div>

                  <SelectInput
                    className={styles.select}
                    name={`candidate-${id}`}
                    value={candidate?.movieId ?? 0}
                    values={candidateOptions}
                    onChange={handleCandidateChange}
                  />
                </>
              ) : null}
            </TableRowCell>
          );
        }

        if (name === 'publishDate') {
          return <RelativeDateCell key={name} date={publishDate} />;
        }

        if (name === 'added') {
          return <RelativeDateCell key={name} date={added} />;
        }

        if (name === 'actions') {
          return (
            <TableRowCell key={name} className={styles.actions}>
              <IconButton
                title={translate('ReviewApproveRelease')}
                name={icons.DOWNLOAD}
                kind={kinds.SUCCESS}
                isSpinning={isApproving}
                onPress={handleApprovePress}
              />

              <IconButton
                title={translate('ReviewRejectRelease')}
                name={icons.BLOCKLIST}
                kind={kinds.DANGER}
                onPress={handleRejectPress}
              />

              <IconButton
                title={translate('RemoveFromReview')}
                name={icons.REMOVE}
                onPress={handleRemovePress}
              />
            </TableRowCell>
          );
        }

        return null;
      })}
    </TableRow>
  );
}

export default ReviewRow;
