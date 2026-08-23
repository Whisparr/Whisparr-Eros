import React, { useCallback, useState } from 'react';
import Card from 'Components/Card';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { icons } from 'Helpers/Props';
import sortByProp from 'Utilities/Array/sortByProp';
import translate from 'Utilities/String/translate';
import EditQualityProfileModal from './EditQualityProfileModal';
import QualityProfile from './QualityProfile';
import { useQualityProfiles } from './useQualityProfiles';
import styles from './QualityProfiles.css';

function QualityProfiles() {
  const { data, isFetching, isFetched, error } = useQualityProfiles();

  const [isQualityProfileModalOpen, setIsQualityProfileModalOpen] =
    useState(false);
  const [cloneId, setCloneId] = useState<number | undefined>(undefined);

  const sortedProfiles = [...data].sort(sortByProp('name'));

  const handleAddQualityProfilePress = useCallback(() => {
    setCloneId(undefined);
    setIsQualityProfileModalOpen(true);
  }, []);

  const handleCloneQualityProfilePress = useCallback((id: number) => {
    setCloneId(id);
    setIsQualityProfileModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setCloneId(undefined);
    setIsQualityProfileModalOpen(false);
  }, []);

  return (
    <FieldSet legend={translate('QualityProfiles')}>
      <PageSectionContent
        errorMessage={translate('QualityProfilesLoadError')}
        isFetching={isFetching}
        isPopulated={isFetched}
        error={error ?? undefined}
      >
        <div className={styles.qualityProfiles}>
          {sortedProfiles.map((item) => {
            return (
              <QualityProfile
                key={item.id}
                {...item}
                onCloneQualityProfilePress={handleCloneQualityProfilePress}
              />
            );
          })}

          <Card
            className={styles.addQualityProfile}
            onPress={handleAddQualityProfilePress}
          >
            <div className={styles.center}>
              <Icon name={icons.ADD} size={45} />
            </div>
          </Card>
        </div>

        <EditQualityProfileModal
          cloneId={cloneId}
          isOpen={isQualityProfileModalOpen}
          onModalClose={handleModalClose}
        />
      </PageSectionContent>
    </FieldSet>
  );
}

export default QualityProfiles;
