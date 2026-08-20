import ModelBase from 'App/ModelBase';
import useApiQuery from 'Helpers/Hooks/useApiQuery';

export interface TagDetail extends ModelBase {
  label: string;
  autoTagIds: number[];
  delayProfileIds: number[];
  downloadClientIds: number[];
  importListIds: number[];
  indexerIds: number[];
  movieIds: number[];
  notificationIds: number[];
  releaseProfileIds: number[];
}

export const TAG_DETAILS_QUERY_KEY = ['/tag/detail'];

const DEFAULT_TAG_DETAILS: TagDetail[] = [];

// Unlike the tag list, this is derived data: every settings section that can
// carry a tag feeds it, so it goes stale for reasons this app cannot see. It
// keeps the default staleTime and is invalidated by SignalR and by deletes.
const useTagDetails = () => {
  const result = useApiQuery<TagDetail[]>({ path: '/tag/detail' });

  return {
    ...result,
    data: result.data ?? DEFAULT_TAG_DETAILS,
  };
};

export default useTagDetails;

const NO_LINKS = {
  autoTagIds: [],
  delayProfileIds: [],
  downloadClientIds: [],
  importListIds: [],
  indexerIds: [],
  movieIds: [],
  notificationIds: [],
  releaseProfileIds: [],
};

export const useTagDetail = (id: number) => {
  const { data } = useTagDetails();

  // A tag added in this session has no detail row until the list refetches, so
  // callers get the empty shape rather than having to default every field.
  return data.find((tagDetail) => tagDetail.id === id) ?? NO_LINKS;
};
