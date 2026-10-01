import useApiQuery from 'Helpers/Hooks/useApiQuery';

interface ReviewStatus {
  count: number;
}

export default function useReviewStatus() {
  const { data } = useApiQuery<ReviewStatus>({
    path: '/review/status',
  });

  return data?.count ?? 0;
}
