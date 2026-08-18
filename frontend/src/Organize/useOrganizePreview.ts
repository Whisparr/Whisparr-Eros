import ModelBase from 'App/ModelBase';
import useApiQuery from 'Helpers/Hooks/useApiQuery';

export interface OrganizePreviewModel extends ModelBase {
  movieId: number;
  movieFileId: number;
  existingPath: string;
  newPath: string;
}

const DEFAULT_ORGANIZE_PREVIEW: OrganizePreviewModel[] = [];

const useOrganizePreview = (movieId: number) => {
  const { data, ...result } = useApiQuery<OrganizePreviewModel[]>({
    path: '/rename',
    queryParams: { movieId },
  });

  return {
    items: data ?? DEFAULT_ORGANIZE_PREVIEW,
    ...result,
  };
};

export default useOrganizePreview;
