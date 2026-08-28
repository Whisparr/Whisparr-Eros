import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueueDetails } from 'Activity/Queue/Details/useQueueDetails';
import * as commandNames from 'Commands/commandNames';
import useCommands, {
  useCommandExecuting,
  useExecuteCommand,
  useExecuteCommandAsync,
} from 'Commands/useCommands';
import FilterMenu from 'Components/Menu/FilterMenu';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import { Filter as AppStateFilter } from 'Filters/Filter';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import useMeasure from 'Helpers/Hooks/useMeasure';
import { align, icons } from 'Helpers/Props';
import { useMovieStats } from 'Movie/Index/useMovieStats';
import NoMovie from 'Movie/NoMovie';
import { useSceneStats } from 'Scene/Index/useSceneStats';
import { isCommandExecuting } from 'Utilities/Command';
import isBefore from 'Utilities/Date/isBefore';
import translate from 'Utilities/String/translate';
import Calendar from './Calendar';
import CalendarFilterModal from './CalendarFilterModal';
import { setCalendarOption, useCalendarOption } from './calendarOptionsStore';
import CalendarLinkModal from './iCal/CalendarLinkModal';
import Legend from './Legend/Legend';
import CalendarOptionsModal from './Options/CalendarOptionsModal';
import useCalendar, {
  FILTERS,
  setCalendarDayCount,
  setCalendarSearchMissingCommandId,
  useCalendarPage,
  useCalendarRange,
  useCalendarSearchMissingCommandId,
} from './useCalendar';
import styles from './CalendarPage.css';

const MINIMUM_DAY_WIDTH = 120;

function useMissingMovieIds() {
  const { start, end } = useCalendarRange();
  const { data: items } = useCalendar();
  const queueDetails = useQueueDetails();

  return useMemo(() => {
    return items.reduce<number[]>((acc, movie) => {
      const { releaseDate } = movie;

      if (
        !movie.movieFileId &&
        moment(releaseDate).isAfter(start) &&
        moment(releaseDate).isBefore(end) &&
        isBefore(movie.releaseDate) &&
        !queueDetails.some(
          (details) => !!details.movie && details.movie.id === movie.id
        )
      ) {
        acc.push(movie.id);
      }

      return acc;
    }, []);
  }, [start, end, items, queueDetails]);
}

function useIsSearchingForMissing() {
  const searchMissingCommandId = useCalendarSearchMissingCommandId();
  const commands = useCommands().data;

  if (searchMissingCommandId == null) {
    return false;
  }

  return isCommandExecuting(
    commands.find((command) => command.id === searchMissingCommandId)
  );
}

function CalendarPage() {
  const executeCommand = useExecuteCommand();
  const executeCommandAsync = useExecuteCommandAsync();

  useCalendarPage();

  const selectedFilterKey = useCalendarOption('selectedFilterKey');
  const missingMovieIds = useMissingMovieIds();
  const isSearchingForMissing = useIsSearchingForMissing();
  const isRssSyncExecuting = useCommandExecuting(commandNames.RSS_SYNC);
  const customFilters = useCustomFiltersList('calendar');
  const { data: movieStats } = useMovieStats();
  const { data: sceneStats } = useSceneStats();
  const hasMovies = movieStats === undefined || movieStats.totalCount > 0;
  const hasScenes = sceneStats === undefined || sceneStats.totalCount > 0;

  const [pageContentRef, { width }] = useMeasure();
  const [isCalendarLinkModalOpen, setIsCalendarLinkModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  const isMeasured = width > 0;
  const PageComponent = hasMovies || hasScenes ? Calendar : NoMovie;

  const handleGetCalendarLinkPress = useCallback(() => {
    setIsCalendarLinkModalOpen(true);
  }, []);

  const handleGetCalendarLinkModalClose = useCallback(() => {
    setIsCalendarLinkModalOpen(false);
  }, []);

  const handleOptionsPress = useCallback(() => {
    setIsOptionsModalOpen(true);
  }, []);

  const handleOptionsModalClose = useCallback(() => {
    setIsOptionsModalOpen(false);
  }, []);

  const handleRssSyncPress = useCallback(() => {
    executeCommand({
      name: commandNames.RSS_SYNC,
    });
  }, [executeCommand]);

  const handleSearchMissingPress = useCallback(async () => {
    const command = await executeCommandAsync({
      name: commandNames.MOVIE_SEARCH,
      movieIds: missingMovieIds,
    });

    if (command) {
      setCalendarSearchMissingCommandId(command.id);
    }
  }, [missingMovieIds, executeCommandAsync]);

  const handleFilterSelect = useCallback((key: string | number) => {
    setCalendarOption('selectedFilterKey', key);
  }, []);

  useEffect(() => {
    if (width === 0) {
      return;
    }

    setCalendarDayCount(
      Math.max(3, Math.min(7, Math.floor(width / MINIMUM_DAY_WIDTH)))
    );
  }, [width]);

  return (
    <PageContent title={translate('Calendar')}>
      <PageToolbar>
        <PageToolbarSection>
          <PageToolbarButton
            label={translate('ICalLink')}
            iconName={icons.CALENDAR}
            onPress={handleGetCalendarLinkPress}
          />

          <PageToolbarSeparator />

          <PageToolbarButton
            label={translate('RssSync')}
            iconName={icons.RSS}
            isSpinning={isRssSyncExecuting}
            onPress={handleRssSyncPress}
          />

          <PageToolbarButton
            label={translate('SearchForMissing')}
            iconName={icons.SEARCH}
            isDisabled={!missingMovieIds.length}
            isSpinning={isSearchingForMissing}
            onPress={handleSearchMissingPress}
          />
        </PageToolbarSection>

        <PageToolbarSection alignContent={align.RIGHT}>
          <PageToolbarButton
            label={translate('Options')}
            iconName={icons.POSTER}
            onPress={handleOptionsPress}
          />

          <FilterMenu
            alignMenu={align.RIGHT}
            isDisabled={!hasMovies && !hasScenes}
            selectedFilterKey={selectedFilterKey}
            filters={FILTERS as unknown as AppStateFilter[]}
            customFilters={customFilters}
            filterModalConnectorComponent={CalendarFilterModal}
            onFilterSelect={handleFilterSelect}
          />
        </PageToolbarSection>
      </PageToolbar>

      <PageContentBody
        ref={pageContentRef}
        className={styles.calendarPageBody}
        innerClassName={styles.calendarInnerPageBody}
      >
        {isMeasured ? <PageComponent totalItems={0} /> : <div />}
        {(hasMovies || hasScenes) && <Legend />}
      </PageContentBody>

      <CalendarLinkModal
        isOpen={isCalendarLinkModalOpen}
        onModalClose={handleGetCalendarLinkModalClose}
      />

      <CalendarOptionsModal
        isOpen={isOptionsModalOpen}
        onModalClose={handleOptionsModalClose}
      />
    </PageContent>
  );
}

export default CalendarPage;
