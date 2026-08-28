import DownloadProtocol from 'DownloadClient/DownloadProtocol';
import Provider from './Provider';

interface DownloadClient extends Provider {
  enable: boolean;
  protocol: DownloadProtocol;
  priority: number;
  removeCompletedDownloads: boolean;
  removeFailedDownloads: boolean;
  tags: number[];

  // Schema responses only: the canned configurations an implementation offers.
  presets?: DownloadClient[];
}

export default DownloadClient;
