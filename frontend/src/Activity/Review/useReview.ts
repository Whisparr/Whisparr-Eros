import { useQueryClient } from '@tanstack/react-query';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import usePage from 'Helpers/Hooks/usePage';
import usePagedApiQuery from 'Helpers/Hooks/usePagedApiQuery';
import Review, { ReviewActionResult } from 'typings/Review';
import { useReviewOptions } from './reviewOptionsStore';

export const REVIEW_PATH = '/review';

export interface ApproveReviewData {
  ids: number[];
  movieId?: number;
  qualityId?: number;
}

interface BulkReviewData {
  ids: number[];
}

const useReview = () => {
  const { page, goToPage } = usePage('review');
  const { pageSize, sortKey, sortDirection } = useReviewOptions();

  const query = usePagedApiQuery<Review>({
    path: REVIEW_PATH,
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

// `/review` is a prefix of `/review/status`, so one invalidation refreshes the
// page and the sidebar badge.
const useInvalidateReview = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: [REVIEW_PATH] });
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
