import React, { useEffect, useState } from 'react';
import Flag from 'react-world-flags';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import Link from 'Components/Link/Link';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons, kinds, sizes, tooltipPositions } from 'Helpers/Props';
import MovieHeadshot from 'Movie/MovieHeadshot';
import PerformerDetailsLinks from 'Performer/Details/PerformerDetailsLinks';
import Performer from 'Performer/Performer';
import PerformerGenderIcon from 'Performer/PerformerGenderIcon';
import countryCode from 'Utilities/String/countryCode';
import firstCharToUpper from 'Utilities/String/firstCharToUpper';
import translate from 'Utilities/String/translate';
import AddNewPerformerModal from './AddNewPerformerModal';
import { useAddNewPerformerSearchResult } from './useAddNewPerformer';
import styles from './AddNewPerformerSearchResult.css';

interface AddNewPerformerSearchResultProps {
  performer: Performer;
  isExistingPerformer: boolean;
}

function AddNewPerformerSearchResult({
  performer,
  isExistingPerformer,
}: AddNewPerformerSearchResultProps) {
  const {
    foreignId,
    tmdbId,
    tpdbId,
    fullName,
    gender,
    country,
    status,
    images,
  } = performer;
  const flagIconCode = country?.toLowerCase();
  const { isSmallScreen, safeForWorkMode } = useAddNewPerformerSearchResult();
  const [isNewAddPerformerModalOpen, setIsNewAddPerformerModalOpen] =
    useState(false);

  useEffect(() => {
    if (isExistingPerformer) {
      setIsNewAddPerformerModalOpen(false);
    }
  }, [isExistingPerformer]);

  function onPress() {
    setIsNewAddPerformerModalOpen(true);
  }

  function onAddPerformerModalClose() {
    setIsNewAddPerformerModalOpen(false);
  }

  const linkProps = isExistingPerformer
    ? { to: `/performer/${foreignId}` }
    : { onPress };

  return (
    <div className={styles.searchResult}>
      <Link className={styles.underlay} {...linkProps} />
      <div className={styles.overlay}>
        {isSmallScreen ? null : (
          <div>
            <div className={styles.posterContainer}>
              <MovieHeadshot
                safeForWorkMode={safeForWorkMode}
                className={styles.poster}
                images={images}
                size={250}
                overflow={true}
                lazy={true}
              />
            </div>
          </div>
        )}
        <div className={styles.content}>
          <div className={styles.titleRow}>
            <div className={styles.titleContainer}>
              <div className={styles.title}>{fullName}</div>
            </div>
            <PerformerGenderIcon gender={gender} size={36} />
            {!!country && (
              <Flag
                className={styles.country}
                code={flagIconCode}
                height={36}
                title={countryCode(country)}
              />
            )}
            <div className={styles.icons}>
              {isExistingPerformer && (
                <Icon
                  className={styles.alreadyExistsIcon}
                  name={icons.CHECK_CIRCLE}
                  size={36}
                  title={translate('AlreadyInYourLibrary')}
                />
              )}
            </div>
          </div>
          <div>
            <Label size={sizes.LARGE} kind={kinds.QUEUE}>
              {translate('Performer')}
            </Label>
            {!!gender && (
              <Label size={sizes.LARGE} kind={kinds.DEFAULT}>
                {firstCharToUpper(gender)}
              </Label>
            )}
            <Tooltip
              anchor={
                <Label size={sizes.LARGE}>
                  <Icon name={icons.EXTERNAL_LINK} size={13} />
                  <span className={styles.links}>Links</span>
                </Label>
              }
              tooltip={
                <PerformerDetailsLinks
                  foreignId={foreignId}
                  tmdbId={tmdbId}
                  tpdbId={tpdbId}
                />
              }
              canFlip={true}
              kind={kinds.INVERSE}
              position={tooltipPositions.BOTTOM}
            />
            {status === 'inactive' && (
              <Label size={sizes.LARGE} kind={kinds.DANGER}>
                {firstCharToUpper(status)}
              </Label>
            )}
          </div>
        </div>
      </div>
      <AddNewPerformerModal
        isOpen={isNewAddPerformerModalOpen && !isExistingPerformer}
        performer={performer}
        foreignId={foreignId}
        fullName={fullName}
        images={images || []}
        onModalClose={onAddPerformerModalClose}
      />
    </div>
  );
}

export default AddNewPerformerSearchResult;
