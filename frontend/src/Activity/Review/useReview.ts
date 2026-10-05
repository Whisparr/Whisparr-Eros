import { QueryClient, useQueryClient } from '@tanstack/react-query';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import usePage from 'Helpers/Hooks/usePage';
import usePagedApiQuery from 'Helpers/Hooks/usePagedApiQuery';
import Review, { ReviewActionResult, ReviewCandidate } from 'typings/Review';
import { useReviewOptions } from './reviewOptionsStore';

export const REVIEW_PATH = '/review';

export interface ApproveReviewItem {
  id: number;
  movieId?: number;
  foreignId?: string;
  manualMatch?: boolean;
  qualityId?: number;
}

export interface ApproveReviewData {
  ids?: number[];
  movieId?: number;
  manualMatch?: boolean;
  qualityId?: number;
  items?: ApproveReviewItem[];
}

interface BulkReviewData {
  ids: number[];
}

const useReview = () => {
  const { page, goToPage } = usePage('review');
  const { pageSize, sortKey, sortDirection } = useReviewOptions();

  // Paged by scene: all releases waiting for a scene come in one page, next to each other
  const query = usePagedApiQuery<Review>({
    path: REVIEW_PATH,
    queryParams: { groupByScene: true },
    page,
    pageSize,
    sortKey,
    sortDirection,
  });

  return {
    ...query,
    goToPage,
    page,
  };
};

export default useReview;

// Query keys are matched entry by entry, so `['/review']` would not match the
// sidebar badge's `['/review/status']`: every query whose path starts with
// `/review` is refreshed, the page and the badge alike.
export const invalidateReviewQueries = (queryClient: QueryClient) => {
  return queryClient.invalidateQueries({
    predicate: ({ queryKey }) =>
      typeof queryKey[0] === 'string' && queryKey[0].startsWith(REVIEW_PATH),
  });
};

const useInvalidateReview = () => {
  const queryClient = useQueryClient();

  return () => {
    invalidateReviewQueries(queryClient);
  };
};

export const useApproveReviewItems = () => {
  const invalidate = useInvalidateReview();

  const { mutate, isPending, error, data, reset } = useApiMutation<
    ReviewActionResult,
    ApproveReviewData
  >({
    path: `${REVIEW_PATH}/approve`,
    method: 'POST',
    mutationOptions: {
      onSettled: invalidate,
    },
  });

  return {
    approveReviewItems: mutate,
    isApproving: isPending,
    approveError: error,
    approveResult: data,
    resetApprove: reset,
  };
};

export const useRejectReviewItems = () => {
  const invalidate = useInvalidateReview();

  const { mutate, isPending } = useApiMutation<unknown, BulkReviewData>({
    path: `${REVIEW_PATH}/reject`,
    method: 'POST',
    mutationOptions: {
      onSuccess: invalidate,
    },
  });

  return { rejectReviewItems: mutate, isRejecting: isPending };
};

export const useRemoveReviewItems = () => {
  const invalidate = useInvalidateReview();

  const { mutate, isPending } = useApiMutation<unknown, BulkReviewData>({
    path: `${REVIEW_PATH}/bulk`,
    method: 'DELETE',
    mutationOptions: {
      onSuccess: invalidate,
    },
  });

  return { removeReviewItems: mutate, isRemoving: isPending };
};

// Scenes to choose from when the release belongs to a scene that isn't one of
// its candidates: the studio's scenes, or every scene matching the query.
export const useReviewScenes = (
  id: number,
  query: string,
  allStudios: boolean,
  enabled: boolean
) => {
  return useApiQuery<ReviewCandidate[]>({
    path: `${REVIEW_PATH}/${id}/scenes`,
    queryParams: { query, allStudios, limit: 200 },
    queryOptions: { enabled },
  });
};

// Scenes on the metadata source (StashDB), for a release whose scene isn't in
// the library yet. Without a term the server searches the release's studio and
// title.
export const useReviewLookup = (id: number, term: string, enabled: boolean) => {
  return useApiQuery<ReviewCandidate[]>({
    path: `${REVIEW_PATH}/${id}/lookup`,
    queryParams: { term },
    queryOptions: { enabled, retry: false },
  });
};
