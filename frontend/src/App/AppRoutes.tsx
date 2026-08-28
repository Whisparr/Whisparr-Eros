import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Blocklist from 'Activity/Blocklist/Blocklist';
import History from 'Activity/History/History';
import Queue from 'Activity/Queue/Queue';
import AddNewMovie from 'AddMovie/AddNewMovie/AddNewMovie';
import AddNewScene from 'AddMovie/AddNewMovie/AddNewScene';
import ImportMovies from 'AddMovie/ImportMovie/ImportMovies';
import CalendarPage from 'Calendar/CalendarPage';
import Collection from 'Collection/Collection';
import NotFound from 'Components/NotFound';
import MovieDetails from 'Movie/Details/MovieDetails';
import MovieIndex from 'Movie/Index/MovieIndex';
import AddNewPerformer from 'Performer/AddPerformer/AddNewPerformer';
import PerformerDetails from 'Performer/Details/PerformerDetails';
import PerformerIndex from 'Performer/Index/PerformerIndex';
import SceneIndex from 'Scene/Index/SceneIndex';
import CustomFormatSettingsPage from 'Settings/CustomFormats/CustomFormatSettingsPage';
import DownloadClientSettings from 'Settings/DownloadClients/DownloadClientSettings';
import GeneralSettings from 'Settings/General/GeneralSettings';
import ImportListSettings from 'Settings/ImportLists/ImportListSettings';
import IndexerSettings from 'Settings/Indexers/IndexerSettings';
import MediaManagement from 'Settings/MediaManagement/MediaManagement';
import MetadataSettings from 'Settings/Metadata/MetadataSettings';
import NotificationSettings from 'Settings/Notifications/NotificationSettings';
import Profiles from 'Settings/Profiles/Profiles';
import Quality from 'Settings/Quality/Quality';
import Settings from 'Settings/Settings';
import TagSettings from 'Settings/Tags/TagSettings';
import UISettings from 'Settings/UI/UISettings';
import AddNewStudio from 'Studio/AddNewStudio/AddNewStudio';
import StudioDetails from 'Studio/Details/StudioDetails';
import StudioIndex from 'Studio/Index/StudioIndex';
import Backups from 'System/Backup/Backups';
import LogsTable from 'System/Events/LogsTable';
import Logs from 'System/Logs/Logs';
import Status from 'System/Status/Status';
import Tasks from 'System/Tasks/Tasks';
import Updates from 'System/Updates/Updates';
import UnmappedFilesTableConnector from 'UnmappedFiles/UnmappedFilesTableConnector';
import CutoffUnmet from 'Wanted/CutoffUnmet/CutoffUnmet';
import Missing from 'Wanted/Missing/Missing';

function AppRoutes() {
  return (
    <Routes>
      {/*
        Movies
      */}

      <Route path="/" element={<SceneIndex />} />

      <Route path="/movies" element={<MovieIndex />} />

      <Route path="/collections" element={<Collection />} />

      <Route path="/scenes" element={<SceneIndex />} />

      <Route path="/performers" element={<PerformerIndex />} />

      <Route path="/studios" element={<StudioIndex />} />

      <Route path="/add/new/movie" element={<AddNewMovie />} />

      <Route path="/add/new/scene" element={<AddNewScene />} />

      <Route path="/add/new/studio" element={<AddNewStudio />} />

      <Route path="/add/new/performer" element={<AddNewPerformer />} />

      <Route path="/add/import/*" element={<ImportMovies />} />

      <Route path="/movie/:id" element={<MovieDetails />} />

      <Route
        path="/performer/:performerForeignId"
        element={<PerformerDetails />}
      />

      <Route path="/studio/:studioForeignId" element={<StudioDetails />} />

      <Route path="/unmapped" element={<UnmappedFilesTableConnector />} />

      {/*
        Calendar
      */}

      <Route path="/calendar" element={<CalendarPage />} />

      {/*
        Activity
      */}

      <Route path="/activity/history" element={<History />} />

      <Route path="/activity/queue" element={<Queue />} />

      <Route path="/activity/blocklist" element={<Blocklist />} />

      {/*
        Wanted
      */}

      <Route path="/wanted/missing" element={<Missing />} />

      <Route path="/wanted/cutoffunmet" element={<CutoffUnmet />} />

      {/*
        Settings
      */}

      <Route path="/settings" element={<Settings />} />

      <Route path="/settings/mediamanagement" element={<MediaManagement />} />

      <Route path="/settings/profiles" element={<Profiles />} />

      <Route path="/settings/quality" element={<Quality />} />

      <Route
        path="/settings/customformats"
        element={<CustomFormatSettingsPage />}
      />

      <Route path="/settings/indexers" element={<IndexerSettings />} />

      <Route
        path="/settings/downloadclients"
        element={<DownloadClientSettings />}
      />

      <Route path="/settings/importlists" element={<ImportListSettings />} />

      <Route path="/settings/connect" element={<NotificationSettings />} />

      <Route path="/settings/metadata" element={<MetadataSettings />} />

      <Route path="/settings/tags" element={<TagSettings />} />

      <Route path="/settings/general" element={<GeneralSettings />} />

      <Route path="/settings/ui" element={<UISettings />} />

      {/*
        System
      */}

      <Route path="/system/status" element={<Status />} />

      <Route path="/system/tasks" element={<Tasks />} />

      <Route path="/system/backup" element={<Backups />} />

      <Route path="/system/updates" element={<Updates />} />

      <Route path="/system/events" element={<LogsTable />} />

      <Route path="/system/logs/files/*" element={<Logs />} />

      {/*
        Not Found
      */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
