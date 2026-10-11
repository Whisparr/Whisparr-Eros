import React from 'react';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import SettingsToolbar from 'Settings/SettingsToolbar';
import translate from 'Utilities/String/translate';
import DelayProfiles from './Delay/DelayProfiles';
import QualityProfiles from './Quality/QualityProfiles';
import ReleaseProfiles from './Release/ReleaseProfiles';

function Profiles() {
  return (
    <PageContent title={translate('Profiles')}>
      <SettingsToolbar showSave={false} />

      <PageContentBody>
        <QualityProfiles />
        <DelayProfiles />
        <ReleaseProfiles />
      </PageContentBody>
    </PageContent>
  );
}

export default Profiles;
