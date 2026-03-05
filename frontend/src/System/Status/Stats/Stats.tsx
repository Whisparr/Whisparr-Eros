import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import DescriptionList from 'Components/DescriptionList/DescriptionList';
import DescriptionListItem from 'Components/DescriptionList/DescriptionListItem';
import FieldSet from 'Components/FieldSet';
import { fetchStatus } from 'Store/Actions/systemActions';
import formatNumber from 'Utilities/Number/formatNumber';
import translate from 'Utilities/String/translate';
import styles from './Stats.css';

function Stats() {
  const dispatch = useDispatch();
  const { item } = useSelector((state: AppState) => state.system.status);

  const { movieCount, sceneCount, studioCount, performerCount } = item;

  useEffect(() => {
    dispatch(fetchStatus());
  }, [dispatch]);

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
