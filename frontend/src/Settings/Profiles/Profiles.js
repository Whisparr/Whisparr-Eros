import React, { Component } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider, HTML5DragTransition, TouchTransition } from 'react-dnd-multi-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

const HTML5toTouch = {
  backends: [
    { id: 'html5', backend: HTML5Backend, transition: HTML5DragTransition },
    { id: 'touch', backend: TouchBackend, options: { enableMouseEvents: true }, preview: true, transition: TouchTransition },
  ],
};
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import SettingsToolbar from 'Settings/SettingsToolbar';
import translate from 'Utilities/String/translate';
import DelayProfiles from './Delay/DelayProfiles';
import QualityProfiles from './Quality/QualityProfiles';
import ReleaseProfiles from './Release/ReleaseProfiles';

// Only a single DragDrop Context can exist so it's done here to allow editing
// quality profiles and reordering delay profiles to work.

class Profiles extends Component {
  //
  // Render

  render() {
    return (
      <PageContent title={translate('Profiles')}>
        <SettingsToolbar showSave={false} />

        <PageContentBody>
          <DndProvider options={HTML5toTouch}>
            <QualityProfiles />
            <DelayProfiles />
            <ReleaseProfiles />
          </DndProvider>
        </PageContentBody>
      </PageContent>
    );
  }
}

export default Profiles;
