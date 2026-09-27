import React from 'react';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import ParseToolbarButton from 'Parse/ParseToolbarButton';
import SettingsToolbar from 'Settings/SettingsToolbar';
import translate from 'Utilities/String/translate';
import CustomFormats from './CustomFormats/CustomFormats';
import ManageCustomFormatsToolbarButton from './CustomFormats/Manage/ManageCustomFormatsToolbarButton';

function CustomFormatSettingsPage() {
  return (
    <PageContent title={translate('CustomFormatsSettings')}>
      <SettingsToolbar
        showSave={false}
        additionalButtons={
          <>
            <PageToolbarSeparator />

            <ParseToolbarButton />

            <ManageCustomFormatsToolbarButton />
          </>
        }
      />

      <PageContentBody>
        <CustomFormats />
      </PageContentBody>
    </PageContent>
  );
}

export default CustomFormatSettingsPage;
