// TODO: Standardize the "when" on React Query Key invalidation to avoid rapid-fire reloads during bulk operations.
import * as signalR from '@microsoft/signalr';
import { useEffect, useRef } from 'react';
import { setAppValue, setVersion } from 'App/appStore';
import { queryClient } from 'App/queryClient';
import {
  COLLECTION_PATH,
  EXISTING_MOVIES_PATH,
} from 'Collection/useMovieCollections';
import Command from 'Commands/Command';
import { COMMANDS_QUERY_KEY, useUpdateCommand } from 'Commands/useCommands';
import { PagedQueryResponse } from 'Helpers/Hooks/usePagedApiQuery';
import { ROOT_FOLDERS_QUERY_KEY } from 'RootFolder/useRootFolders';
import { DOWNLOAD_CLIENTS_PATH } from 'Settings/DownloadClients/DownloadClients/useDownloadClients';
import { IMPORT_LISTS_PATH } from 'Settings/ImportLists/ImportLists/useImportLists';
import { INDEXERS_PATH } from 'Settings/Indexers/Indexers/useIndexers';
import { NOTIFICATIONS_PATH } from 'Settings/Notifications/useNotifications';
import { QUALITY_DEFINITIONS_PATH } from 'Settings/Quality/Definition/useQualityDefinitions';
import { TAG_DETAILS_QUERY_KEY } from 'Tags/useTagDetails';
import { TAGS_QUERY_KEY } from 'Tags/useTags';
import SignalRLogger from 'Utilities/SignalRLogger';

type SignalRAction = 'sync' | 'created' | 'updated' | 'deleted';

interface MovieResource {
  id: number;
  titleSlug: string;
  foreignId?: string;
  studioForeignId?: string;
}

interface ForeignResource {
  id: number;
  foreignId?: string;
}

interface SignalRBody {
  action?: SignalRAction;
  resource?: MovieResource & ForeignResource & Record<string, unknown>;
  resources?: (MovieResource & ForeignResource & Record<string, unknown>)[];
  version?: string;
}

interface SignalRMessage {
  name: string;
  body: SignalRBody;
}

// Helper to ensure updated data when a movie is updated in the background
function updateMovieDetailsQueryCache(updatedMovie: MovieResource) {
  const queryKey = `/movie/${updatedMovie.titleSlug}`;

  // Don't trigger a re-fetch, as this method can be called rapid-fire
  queryClient.invalidateQueries({
    queryKey: [queryKey],
    refetchType: 'none',
  });
}

// Helper to update a nested movie in performer.years[].movies[] in React Query cache
// Update Performer React Query cache helper
// The collections page asks `POST /movie/list` for the library movies behind the
// collection posters. Patched rather than invalidated so toggling monitored on a
// poster does not re-fetch every movie on the page.
function updateMovieInCollectionListQueryCache(updatedMovie: MovieResource) {
  queryClient
    .getQueryCache()
    .findAll({ queryKey: [EXISTING_MOVIES_PATH] })
    .forEach(({ queryKey }) => {
      queryClient.setQueryData(queryKey, (oldData: MovieResource[]) => {
        if (!Array.isArray(oldData)) {
          return oldData;
        }

        const idx = oldData.findIndex((movie) => movie.id === updatedMovie.id);

        if (idx === -1) {
          return oldData;
        }

        const newData = [...oldData];
        newData[idx] = { ...oldData[idx], ...updatedMovie };

        return newData;
      });
    });
}

function updateMovieInPerformerWorksQueryCache(updatedMovie: MovieResource) {
  // Find all queries for performer works
  const queryCache = queryClient.getQueryCache().findAll();
  queryCache.forEach(({ queryKey }) => {
    // Look for keys like "/performer/{performerId}/works"
    if (
      Array.isArray(queryKey) &&
      typeof queryKey[0] === 'string' &&
      /performer\/[^/]+\/works$/.test(queryKey[0])
    ) {
      queryClient.setQueryData(queryKey, (oldData: MovieResource[]) => {
        if (!Array.isArray(oldData)) {
          return oldData;
        }
        const idx = oldData.findIndex((movie) => movie.id === updatedMovie.id);
        if (idx === -1) {
          return oldData;
        }
        const newData = [...oldData];
        newData[idx] = { ...oldData[idx], ...updatedMovie };
        return newData;
      });
    }
  });
}

// Helper to update a nested movie in performer.years[].movies[] in React Query cache
// To avoid invalidating the entire list when a single movie is updated, we need to find the movie in the cache and update it directly.
function updateMovieInStudioWorksQueryCache(updatedMovie: MovieResource) {
  if (!updatedMovie?.studioForeignId) {
    return;
  }

  const studioKey = `/studio/${updatedMovie.studioForeignId}/works`;
  queryClient.setQueryData([studioKey], (oldData: MovieResource[]) => {
    if (!Array.isArray(oldData)) {
      return oldData;
    }
    const idx = oldData.findIndex((movie) => movie.id === updatedMovie.id);
    if (idx === -1) {
      return oldData;
    }
    const newData = [...oldData];
    newData[idx] = { ...oldData[idx], ...updatedMovie };
    return newData;
  });
}

// Merges updates in React Query cache instead of a re-fetch
function updatePerformerQueryCache(updatedPerformer: ForeignResource) {
  if (!updatedPerformer?.foreignId) {
    return;
  }

  const performerKey = `/performer/${updatedPerformer.foreignId}`;

  queryClient.setQueryData([performerKey], (oldData: object) => {
    if (!oldData || typeof oldData !== 'object') {
      return updatedPerformer;
    }
    return { ...oldData, ...updatedPerformer };
  });
}

// Merges updates in React Query cache instead of a re-fetch
function updateStudioQueryCache(updatedStudio: ForeignResource) {
  if (!updatedStudio?.foreignId) {
    return;
  }

  const studioKey = `/studio/${updatedStudio.foreignId}`;
  queryClient.setQueryData([studioKey], (oldData: object) => {
    if (!oldData || typeof oldData !== 'object') {
      return updatedStudio;
    }
    return { ...oldData, ...updatedStudio };
  });
}

function removeMovieQueryCache(updatedMovie: MovieResource & ForeignResource) {
  if (!updatedMovie?.foreignId) {
    return;
  }

  queryClient.removeQueries({
    queryKey: [`/movie/${updatedMovie.titleSlug}`],
  });
}

function removePerformerQueryCache(updatedPerformer: ForeignResource) {
  if (!updatedPerformer?.foreignId) {
    return;
  }

  queryClient.removeQueries({
    queryKey: [`/performer/${updatedPerformer.foreignId}`],
  });

  queryClient.removeQueries({
    queryKey: [`/performer/${updatedPerformer.foreignId}/works`],
  });
}

function removeStudioQueryCache(updatedStudio: ForeignResource) {
  if (!updatedStudio?.foreignId) {
    return;
  }

  queryClient.removeQueries({
    queryKey: [`/studio/${updatedStudio.foreignId}`],
  });

  queryClient.removeQueries({
    queryKey: [`/studio/${updatedStudio.foreignId}/works`],
  });
}

function invalidateMoviePagedQueryCache() {
  queryClient.invalidateQueries({
    queryKey: ['/movie/paged'],
  });
}

// The by-id list behind the tag details modal and the queued task rows. It is
// keyed on the requested ids, so a deleted movie changes which records come
// back, not just their contents, and patching in place would not cover it.
//
// `useAllMovies`'s `/movie` is left alone on purpose. It is the whole library in
// one response, and a scan emits a movie event per record -- invalidating it
// here would re-download the list once per event for as long as a filter row was
// open. It carries a stale time instead.
function invalidateMovieBulkQueryCache() {
  queryClient.invalidateQueries({ queryKey: ['/movie/bulk'] });
}

function invalidatePerformerPagedQueryCache() {
  queryClient.invalidateQueries({
    predicate: (query) => {
      return (
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === 'string' &&
        query.queryKey[0].startsWith('/performer/paged')
      );
    },
  });
}

function invalidateStudioPagedQueryCache() {
  queryClient.invalidateQueries({
    predicate: (query) => {
      return (
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === 'string' &&
        query.queryKey[0].startsWith('/studio/paged')
      );
    },
  });
}

// Both Wanted lists are derived: a movie's monitored state or file status decides
// whether it belongs on them at all, so a changed movie means refetching rather
// than patching. Invalidating stales every cached page, not just the visible one.
function invalidateWantedQueries() {
  queryClient.invalidateQueries({ queryKey: ['/wanted/missing'] });
  queryClient.invalidateQueries({ queryKey: ['/wanted/cutoff'] });
}

function invalidateFileDependentQueries() {
  invalidateWantedQueries();
  queryClient.invalidateQueries({ queryKey: ['/calendar'] });
}

// Patches one record across every cached page of a `usePagedApiQuery` list. The
// paged key is `[path, ...paging]`, so a prefix match hits every page and sort
// currently in the cache without refetching any of them.
function updatePagedItem(queryKey: string, updatedItem: MovieResource) {
  queryClient.setQueriesData(
    { queryKey: [queryKey] },
    (oldData: PagedQueryResponse<MovieResource> | undefined) => {
      if (!oldData?.records) {
        return oldData;
      }

      const index = oldData.records.findIndex(
        (record) => record.id === updatedItem.id
      );

      if (index === -1) {
        return oldData;
      }

      const records = [...oldData.records];
      records[index] = { ...records[index], ...updatedItem };

      return { ...oldData, records };
    }
  );
}

// The calendar is a plain list keyed by its fetched range. Patch the movie in
// place across every cached range rather than refetching -- matching the redux
// `updateOnly` behaviour this replaces, which never added unseen movies.
function updateCalendarQueryCache(updatedMovie: MovieResource) {
  queryClient
    .getQueryCache()
    .findAll()
    .forEach(({ queryKey }) => {
      if (!Array.isArray(queryKey) || queryKey[0] !== '/calendar') {
        return;
      }

      queryClient.setQueryData(queryKey, (oldData: MovieResource[]) => {
        if (!Array.isArray(oldData)) {
          return oldData;
        }

        const index = oldData.findIndex(
          (movie) => movie.id === updatedMovie.id
        );

        if (index === -1) {
          return oldData;
        }

        const newData = [...oldData];
        newData[index] = { ...oldData[index], ...updatedMovie };

        return newData;
      });
    });
}

function SignalRListener() {
  const updateCommand = useUpdateCommand();
  const connection = useRef<signalR.HubConnection | null>(null);

  const handleMessage = useRef((message: SignalRMessage) => {
    const { name, body } = message;

    if (name === 'calendar') {
      if (body.action === 'updated' && body.resource) {
        updateCalendarQueryCache(body.resource);
      }

      return;
    }

    if (name === 'command') {
      if (body.action === 'sync') {
        queryClient.invalidateQueries({ queryKey: COMMANDS_QUERY_KEY });
        return;
      }

      // One path for both: updateCommand writes the command to the cache and, when it
      // reports completed or failed, fires its finished callback. Failed commands need
      // that too, or their button spins until it times out.
      if (body.resource) {
        updateCommand(body.resource as unknown as Command);
      }

      return;
    }

    if (name === 'moviefile') {
      if (body.action === 'updated' || body.action === 'deleted') {
        queryClient.invalidateQueries({ queryKey: ['/moviefile'] });

        // Gaining or losing a file moves a movie on and off both Wanted lists
        // and changes its calendar row.
        invalidateFileDependentQueries();
      }

      return;
    }

    if (name === 'downloadclient') {
      queryClient.invalidateQueries({ queryKey: [DOWNLOAD_CLIENTS_PATH] });
      return;
    }

    if (name === 'health') {
      queryClient.invalidateQueries({ queryKey: ['/health'] });
      return;
    }

    if (name === 'importlist') {
      queryClient.invalidateQueries({ queryKey: [IMPORT_LISTS_PATH] });
      return;
    }

    if (name === 'indexer') {
      queryClient.invalidateQueries({ queryKey: [INDEXERS_PATH] });
      return;
    }

    if (name === 'notification') {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_PATH] });
      return;
    }

    if (name === 'movie') {
      // Support batch payloads (Resources) and single (resource)
      if (Array.isArray(body.resources) && body.resources.length > 0) {
        // Batched update
        if (body.action === 'updated') {
          body.resources.forEach(updateMovieInPerformerWorksQueryCache);
          body.resources.forEach(updateMovieInStudioWorksQueryCache);
          body.resources.forEach(updateMovieDetailsQueryCache);
          body.resources.forEach(updateMovieInCollectionListQueryCache);
        } else if (body.action === 'deleted') {
          body.resources.forEach(removeMovieQueryCache);
        }

        invalidateMoviePagedQueryCache();
        invalidateMovieBulkQueryCache();

        if (body.action === 'updated') {
          invalidateWantedQueries();
        }

        return;
      }

      // Fallback: single resource
      if (body.action === 'updated' && body.resource) {
        updateMovieInPerformerWorksQueryCache(body.resource);
        updateMovieInStudioWorksQueryCache(body.resource);
        updateMovieDetailsQueryCache(body.resource);
        updateMovieInCollectionListQueryCache(body.resource);
      } else if (body.action === 'deleted' && body.resource) {
        removeMovieQueryCache(body.resource);
      }

      invalidateMoviePagedQueryCache();
      invalidateMovieBulkQueryCache();

      if (body.action === 'updated') {
        invalidateWantedQueries();
      }

      return;
    }

    if (name === 'collection') {
      // Both the full list and the single-collection `?tmdbId=` lookup live
      // under this key, and `invalidateQueries` matches by prefix, so one call
      // covers the collections page and the label on movie details.
      queryClient.invalidateQueries({ queryKey: [COLLECTION_PATH] });

      return;
    }

    if (name === 'performer') {
      if (Array.isArray(body.resources) && body.resources.length > 0) {
        if (body.action === 'deleted') {
          body.resources.forEach(removePerformerQueryCache);
        } else {
          body.resources.forEach(updatePerformerQueryCache);
        }

        invalidatePerformerPagedQueryCache();
        return;
      }

      if (body.action === 'updated' && body.resource) {
        // Update individual performer query keys rather than re-fetch
        updatePerformerQueryCache(body.resource);
        // Force paged query re-fetch so updates are immediate
        invalidatePerformerPagedQueryCache();
      } else if (body.action === 'deleted' && body.resource) {
        // Remove individual performer query keys
        removePerformerQueryCache(body.resource);
        // Force paged query re-fetch so updates are immediate
        invalidatePerformerPagedQueryCache();
      }

      return;
    }

    if (name === 'qualitydefinition') {
      queryClient.invalidateQueries({
        queryKey: [QUALITY_DEFINITIONS_PATH],
      });
      return;
    }

    if (name === 'queue') {
      queryClient.invalidateQueries({ queryKey: ['/queue'] });
      return;
    }

    if (name === 'queue/details') {
      queryClient.invalidateQueries({ queryKey: ['/queue/details'] });
      return;
    }

    if (name === 'queue/status') {
      queryClient.setQueryData(['/queue/status'], body.resource);
      return;
    }

    if (name === 'studio') {
      if (Array.isArray(body.resources) && body.resources.length > 0) {
        if (body.action === 'deleted') {
          body.resources.forEach(removeStudioQueryCache);
        } else {
          body.resources.forEach(updateStudioQueryCache);
        }

        invalidateStudioPagedQueryCache();
        return;
      }

      if (body.action === 'updated' && body.resource) {
        updateStudioQueryCache(body.resource);
        invalidateStudioPagedQueryCache();
      } else if (body.action === 'deleted' && body.resource) {
        removeStudioQueryCache(body.resource);
        invalidateStudioPagedQueryCache();
      }

      return;
    }

    if (name === 'version') {
      if (body.version) {
        setVersion({ version: body.version });
      }

      return;
    }

    if (name === 'wanted/cutoff') {
      if (body.action === 'updated' && body.resource) {
        updatePagedItem('/wanted/cutoff', body.resource);
      }

      return;
    }

    if (name === 'wanted/missing') {
      if (body.action === 'updated' && body.resource) {
        updatePagedItem('/wanted/missing', body.resource);
      }

      return;
    }

    if (name === 'system/task') {
      queryClient.invalidateQueries({ queryKey: ['/system/task'] });
      return;
    }

    if (name === 'rootfolder') {
      queryClient.invalidateQueries({ queryKey: ROOT_FOLDERS_QUERY_KEY });
      return;
    }

    if (name === 'tag') {
      if (body.action === 'sync') {
        queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: TAG_DETAILS_QUERY_KEY });
      }

      return;
    }

    console.error(`signalR: Unable to find handler for ${name}`);
  });

  const handleReceiveMessage = useRef((message: SignalRMessage) => {
    console.debug('[signalR] received', message.name, message.body);

    handleMessage.current(message);
  });

  const handleStartFail = useRef((error: unknown) => {
    console.error('[signalR] failed to connect');
    console.error(error);

    setAppValue({
      isConnected: false,
      isReconnecting: false,
      isDisconnected: false,
      isRestarting: false,
    });
  });

  const handleStart = useRef(() => {
    console.debug('[signalR] connected');

    setAppValue({
      isConnected: true,
      isReconnecting: false,
      isDisconnected: false,
      isRestarting: false,
    });
  });

  const handleReconnecting = useRef(() => {
    setAppValue({ isReconnecting: true });
  });

  const handleReconnected = useRef(() => {
    setAppValue({
      isConnected: true,
      isReconnecting: false,
      isDisconnected: false,
      isRestarting: false,
    });

    // Any message at all could have been missed while the connection was down,
    // so stale the whole cache rather than guess at a list of keys. Only the
    // mounted page's queries have observers, so only those refetch now.
    queryClient.invalidateQueries();
  });

  const handleClose = useRef(() => {
    console.debug('[signalR] connection closed');
  });

  const handleDisconnected = useRef(() => {
    setAppValue({ isDisconnected: true });
  });

  useEffect(
    () => {
      console.log('[signalR] starting');

      const url = `${window.Whisparr.urlBase}/signalr/messages`;

      connection.current = new signalR.HubConnectionBuilder()
        .configureLogging(new SignalRLogger(signalR.LogLevel.Information))
        .withUrl(
          `${url}?access_token=${encodeURIComponent(window.Whisparr.apiKey)}`
        )
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (
            retryContext: signalR.RetryContext
          ) => {
            if (retryContext.elapsedMilliseconds > 180000) {
              handleDisconnected.current();
            }

            return Math.min(retryContext.previousRetryCount, 10) * 1000;
          },
        })
        .build();

      connection.current.onreconnecting(handleReconnecting.current);
      connection.current.onreconnected(handleReconnected.current);
      connection.current.onclose(handleClose.current);

      connection.current.on('receiveMessage', handleReceiveMessage.current);

      connection.current
        .start()
        .then(handleStart.current, handleStartFail.current);

      return () => {
        connection.current?.stop();
        connection.current = null;
      };
    },
    // Mount once, exactly as the class did in componentDidMount.

    []
  );

  return null;
}

export default SignalRListener;
