import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import Link from 'Components/Link/Link';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons, kinds, sizes, tooltipPositions } from 'Helpers/Props';
import StudioDetailsLinks from 'Studio/Details/StudioDetailsLinks';
import Studio from 'Studio/Studio';
import StudioLogo from 'Studio/StudioLogo';
import firstCharToUpper from 'Utilities/String/firstCharToUpper';
import translate from 'Utilities/String/translate';
import AddNewStudioModal from './AddNewStudioModal';
import { useAddNewStudioSearchResult } from './useAddNewStudio';
import styles from './AddNewStudioSearchResult.css';

interface AddNewStudioSearchResultProps {
  studio: Studio;
  isExistingStudio: boolean;
  colorImpairedMode?: boolean;
}

function AddNewStudioSearchResult({
  studio,
  isExistingStudio,
  colorImpairedMode: _colorImpairedMode,
}: Readonly<AddNewStudioSearchResultProps>) {
  const { foreignId, tmdbId, tpdbId, website, title, network, images } = studio;

  const [isNewAddStudioModalOpen, setIsNewAddStudioModalOpen] = useState(false);
  const navigate = useNavigate();

  const { isSmallScreen, safeForWorkMode } = useAddNewStudioSearchResult();

  const onPress = useCallback(() => {
    if (isExistingStudio) {
      navigate(`/studio/${foreignId}`);
    } else {
      setIsNewAddStudioModalOpen(true);
    }
  }, [isExistingStudio, foreignId, navigate]);

  const onAddStudioModalClose = useCallback(() => {
    setIsNewAddStudioModalOpen(false);
  }, []);

  const linkProps = useMemo(
    () => ({
      onClick: onPress,
      style: { cursor: 'pointer' },
    }),
    [onPress]
  );

  return (
    <div className={styles.searchResult}>
      <Link className={styles.underlay} {...linkProps} />

      <div className={styles.overlay}>
        {!isSmallScreen && (
          <div>
            <div className={styles.posterContainer}>
              <StudioLogo
                safeForWorkMode={safeForWorkMode}
                className={styles.poster}
                images={images}
                size={250}
                overflow={true}
                title={title}
              />
            </div>
          </div>
        )}

        <div className={styles.content}>
          <div className={styles.titleRow}>
            <div className={styles.titleContainer}>
              <div className={styles.title}>{title}</div>
            </div>

            <div className={styles.icons}>
              {isExistingStudio && (
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
            <Label size={sizes.LARGE} kind={kinds.DEFAULT}>
              <Icon name={icons.STUDIO} size={17} />
              <span className={styles.studio}>{translate('Studio')}</span>
            </Label>

            {!!network && (
              <Label size={sizes.LARGE} kind={kinds.DEFAULT}>
                <Icon name={icons.NETWORK} size={17} />
                {firstCharToUpper(network)}
              </Label>
            )}

            <Tooltip
              anchor={
                <Label size={sizes.LARGE}>
                  <Icon name={icons.EXTERNAL_LINK} size={17} />

                  <span className={styles.links}>Links</span>
                </Label>
              }
              tooltip={
                <StudioDetailsLinks
                  website={website}
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

      <AddNewStudioModal
        isOpen={isNewAddStudioModalOpen && !isExistingStudio}
        studio={studio}
        foreignId={foreignId}
        title={title}
        images={images}
        onModalClose={onAddStudioModalClose}
      />
    </div>
  );
}

export default AddNewStudioSearchResult;
