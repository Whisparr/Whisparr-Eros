import React from 'react';
import PageSidebarStatus from 'Components/Page/Sidebar/PageSidebarStatus';
import useQueueStatus from './useQueueStatus';

function QueueStatus() {
  const { count, errors, warnings } = useQueueStatus();

  return (
    <PageSidebarStatus count={count} errors={errors} warnings={warnings} />
  );
}

export default QueueStatus;
