import React from 'react';
import QueueStatus from 'Activity/Queue/Status/QueueStatus';
import useQueueStatus from 'Activity/Queue/Status/useQueueStatus';
import ReviewStatus from 'Activity/Review/Status/ReviewStatus';
import useReviewStatus from 'Activity/Review/Status/useReviewStatus';
import styles from './ActivityStatus.module.css';

// The collapsed Activity item shows the queue and the review queue side by side, "queue | review", rather than one number for both
function ActivityStatus() {
  const { count: queueCount } = useQueueStatus();
  const reviewCount = useReviewStatus();

  if (!queueCount && !reviewCount) {
    return null;
  }

  return (
    <span className={styles.status}>
      <QueueStatus />

      {queueCount && reviewCount ? (
        <span className={styles.separator}>|</span>
      ) : null}

      <ReviewStatus />
    </span>
  );
}

export default ActivityStatus;
