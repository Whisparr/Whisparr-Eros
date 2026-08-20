// TODO: Standardize the "when" on React Query Key invalidation to avoid rapid-fire reloads during bulk operations.
import * as signalR from '@microsoft/signalr';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { queryClient } from 'App/queryClient';
import Command from 'Commands/Command';
import { COMMANDS_QUERY_KEY, useUpdateCommand } from 'Commands/useCommands';
import { ROOT_FOLDERS_QUERY_KEY } from 'RootFolder/useRootFolders';
import { setAppValue, setVersion } from 'Store/Actions/appActions';
import { removeItem, updateItem } from 'Store/Actions/baseActions';
import { fetchQualityDefinitions } from 'Store/Actions/settingsActions';
import { TAG_DETAILS_QUERY_KEY } from 'Tags/useTagDetails';
import { TAGS_QUERY_KEY } from 'Tags/useTags';
import { repopulatePage } from 'Utilities/pagePopulator';
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
  const dispatch = useDispatch();
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
      }

      return;
    }

    if (name === 'downloadclient') {
      const section = 'settings.downloadClients';

      if (body.action === 'created' || body.action === 'updated') {
        dispatch(updateItem({ section, ...body.resource }));
      } else if (body.action === 'deleted') {
        dispatch(removeItem({ section, id: body.resource?.id }));
      }

      return;
    }

    if (name === 'health') {
      queryClient.invalidateQueries({ queryKey: ['/health'] });
      return;
    }

    if (name === 'importlist') {
      const section = 'settings.importLists';

      if (body.action === 'created' || body.action === 'updated') {
        dispatch(updateItem({ section, ...body.resource }));
      } else if (body.action === 'deleted') {
        dispatch(removeItem({ section, id: body.resource?.id }));
      }

      return;
    }

    if (name === 'indexer') {
      const section = 'settings.indexers';

      if (body.action === 'created' || body.action === 'updated') {
        dispatch(updateItem({ section, ...body.resource }));
      } else if (body.action === 'deleted') {
        dispatch(removeItem({ section, id: body.resource?.id }));
      }

      return;
    }

    if (name === 'notification') {
      const section = 'settings.notifications';

      if (body.action === 'created' || body.action === 'updated') {
        dispatch(updateItem({ section, ...body.resource }));
      } else if (body.action === 'deleted') {
        dispatch(removeItem({ section, id: body.resource?.id }));
      }

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
        } else if (body.action === 'deleted') {
          body.resources.forEach(removeMovieQueryCache);
        }

        invalidateMoviePagedQueryCache();
        return;
      }

      // Fallback: single resource
      if (body.action === 'updated' && body.resource) {
        updateMovieInPerformerWorksQueryCache(body.resource);
        updateMovieInStudioWorksQueryCache(body.resource);
        updateMovieDetailsQueryCache(body.resource);
      } else if (body.action === 'deleted' && body.resource) {
        removeMovieQueryCache(body.resource);
      }

      invalidateMoviePagedQueryCache();
      return;
    }

    if (name === 'collection') {
      const section = 'movieCollections';

      if (body.action === 'updated') {
        dispatch(updateItem({ section, ...body.resource }));
      } else if (body.action === 'deleted') {
        dispatch(removeItem({ section, id: body.resource?.id }));
      }

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
      dispatch(fetchQualityDefinitions());
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
      dispatch(setVersion({ version: body.version }));
      return;
    }

    if (name === 'wanted/cutoff') {
      if (body.action === 'updated') {
        dispatch(
          updateItem({
            section: 'wanted.cutoffUnmet',
            updateOnly: true,
            ...body.resource,
          })
        );
      }

      return;
    }

    if (name === 'wanted/missing') {
      if (body.action === 'updated') {
        dispatch(
          updateItem({
            section: 'wanted.missing',
            updateOnly: true,
            ...body.resource,
          })
        );
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

    dispatch(
      setAppValue({
        isConnected: false,
        isReconnecting: false,
        isDisconnected: false,
        isRestarting: false,
      })
    );
  });

  const handleStart = useRef(() => {
    console.debug('[signalR] connected');

    dispatch(
      setAppValue({
        isConnected: true,
        isReconnecting: false,
        isDisconnected: false,
        isRestarting: false,
      })
    );
  });

  const handleReconnecting = useRef(() => {
    dispatch(setAppValue({ isReconnecting: true }));
  });

  const handleReconnected = useRef(() => {
    dispatch(
      setAppValue({
        isConnected: true,
        isReconnecting: false,
        isDisconnected: false,
        isRestarting: false,
      })
    );

    // Repopulate the page (if a repopulator is set) to ensure things
    // are in sync after reconnecting.
    queryClient.invalidateQueries({ queryKey: ['/movie/paged'] });
    queryClient.invalidateQueries({ queryKey: ['/movie/stats'] });
    // The sidebar badge misses every queue/status message while the connection
    // is down. QueueStatus used to refetch itself on reconnect; now that it is
    // a query, the refresh belongs here with the others.
    queryClient.invalidateQueries({ queryKey: ['/queue/status'] });
    queryClient.invalidateQueries({ queryKey: COMMANDS_QUERY_KEY });
    repopulatePage();
  });

  const handleClose = useRef(() => {
    console.debug('[signalR] connection closed');
  });

  const handleDisconnected = useRef(() => {
    dispatch(setAppValue({ isDisconnected: true }));
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
