import React from 'react';
import PageSidebarStatus from 'Components/Page/Sidebar/PageSidebarStatus';
import translate from 'Utilities/String/translate';
import useReviewStatus from './useReviewStatus';

function ReviewStatus() {
  const count = useReviewStatus();

  return (
    <PageSidebarStatus
      aria-label={
        count === 1
          ? translate('ReviewItem')
          : translate('ReviewItems', { count })
      }
      count={count}
    />
  );
}

export default ReviewStatus;
