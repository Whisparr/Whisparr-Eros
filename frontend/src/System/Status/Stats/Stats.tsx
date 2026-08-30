import React, { useEffect } from 'react';
import DescriptionList from 'Components/DescriptionList/DescriptionList';
import DescriptionListItem from 'Components/DescriptionList/DescriptionListItem';
import FieldSet from 'Components/FieldSet';
import useSystemStatus from 'System/Status/useSystemStatus';
import formatNumber from 'Utilities/Number/formatNumber';
import translate from 'Utilities/String/translate';
import styles from './Stats.css';

function Stats() {
  const { data, refetch } = useSystemStatus();

  const { movieCount, sceneCount, studioCount, performerCount } = data;

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <FieldSet legend={translate('Stats')}>
      <DescriptionList className={styles.descriptionList}>
        <DescriptionListItem
          title={translate('SceneCount')}
          data={formatNumber(sceneCount)}
        />

        <DescriptionListItem
          title={translate('MovieCount')}
          data={formatNumber(movieCount)}
        />

        <DescriptionListItem
          title={translate('StudioCount')}
          data={formatNumber(studioCount)}
        />

        <DescriptionListItem
          title={translate('PerformerCount')}
          data={formatNumber(performerCount)}
        />
      </DescriptionList>
    </FieldSet>
  );
}

export default Stats;
