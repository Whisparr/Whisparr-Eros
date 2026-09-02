import { useMemo } from 'react';
import {
  SelectedSchema,
  useProviderSchema,
  useSelectedSchema,
} from 'Settings/useProviderSchema';
import {
  useDeleteProvider,
  useManageProviderSettings,
  useProviderSettings,
} from 'Settings/useProviderSettings';
import Notification from 'typings/Notification';
import sortByProp from 'Utilities/Array/sortByProp';

export const NOTIFICATIONS_PATH = '/notification';

const NO_NOTIFICATION = {} as Notification;

export const useNotifications = () => {
  return useProviderSettings<Notification>(NOTIFICATIONS_PATH);
};

export const useSortedNotifications = () => {
  const { data } = useNotifications();

  return useMemo(() => [...data].sort(sortByProp('name')), [data]);
};

export const useNotificationsWithIds = (ids: number[]) => {
  const { data } = useNotifications();

  return useMemo(
    () => data.filter((notification) => ids.includes(notification.id)),
    [data, ids]
  );
};

export const useNotificationSchema = (enabled = true) => {
  return useProviderSchema<Notification>(NOTIFICATIONS_PATH, enabled);
};

export const useDeleteNotification = (id: number) => {
  const { deleteProvider, ...result } = useDeleteProvider<Notification>(
    id,
    NOTIFICATIONS_PATH
  );

  return {
    ...result,
    deleteNotification: deleteProvider,
  };
};

// Editing an existing connection needs nothing but its id; adding one starts
// from the schema for the implementation the user picked, with the triggers it
// supports switched on. That seeding is the whole reason the schema is copied
// rather than used in place -- it is what `SELECT_NOTIFICATION_SCHEMA` did.
export const useManageNotification = (
  id: number,
  selectedSchema?: SelectedSchema
) => {
  const isAdding = id === 0;

  const schema = useSelectedSchema<Notification>(
    NOTIFICATIONS_PATH,
    selectedSchema
  );

  // Same query key as the lookup inside `useSelectedSchema`, so this reads the
  // one request rather than making a second.
  const { isSchemaLoading, isSchemaFetched, schemaError } =
    useNotificationSchema(isAdding);

  const defaultNotification = useMemo(() => {
    if (!schema) {
      return NO_NOTIFICATION;
    }

    return {
      ...schema,
      name: schema.implementationName,
      onGrab: schema.supportsOnGrab,
      onDownload: schema.supportsOnDownload,
      onUpgrade: schema.supportsOnUpgrade,
      onRename: schema.supportsOnRename,
      onMovieAdded: schema.supportsOnMovieAdded,
      onMovieDelete: schema.supportsOnMovieDelete,
      onMovieFileDelete: schema.supportsOnMovieFileDelete,
      onMovieFileDeleteForUpgrade: schema.supportsOnMovieFileDeleteForUpgrade,
      onApplicationUpdate: schema.supportsOnApplicationUpdate,
      onManualInteractionRequired: schema.supportsOnManualInteractionRequired,
    };
  }, [schema]);

  const manage = useManageProviderSettings<Notification>(
    id,
    defaultNotification,
    NOTIFICATIONS_PATH
  );

  return {
    ...manage,

    // Only the add case has anything to wait for -- an existing connection
    // comes from the list the page already loaded.
    isFetching: isAdding && isSchemaLoading,
    isFetched: isAdding ? isSchemaFetched : true,
    error: isAdding ? schemaError : null,
  };
};
