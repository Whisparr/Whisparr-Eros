import ModelBase from 'App/ModelBase';
import useApiQuery from 'Helpers/Hooks/useApiQuery';

export interface OrganizePreviewModel extends ModelBase {
  movieId: number;
  movieFileId: number;
  existingPath: string;
  newPath: string;
}

export type OrganizePreviewScope =
  | { movieId: number }
  | { performerForeignId: string }
  | { studioForeignId: string };

const DEFAULT_ORGANIZE_PREVIEW: OrganizePreviewModel[] = [];

const useOrganizePreview = (scope: OrganizePreviewScope) => {
  const { data, ...result } = useApiQuery<OrganizePreviewModel[]>({
    path: '/rename',
    queryParams: { ...scope },
  });

  return {
    items: data ?? DEFAULT_ORGANIZE_PREVIEW,
    ...result,
  };
};

export default useOrganizePreview;
