import DownloadProtocol from 'DownloadClient/DownloadProtocol';
import Provider from './Provider';

// `supportsRss` / `supportsSearch` are what the implementation can deliver and
// `enableRss` / `enableAutomaticSearch` / `enableInteractiveSearch` are what
// the user asked for, so the UI disables the checkbox rather than hiding it and
// an indexer that loses a capability keeps the stored answer.
interface Indexer extends Provider {
  enableRss: boolean;
  enableAutomaticSearch: boolean;
  enableInteractiveSearch: boolean;
  supportsRss: boolean;
  supportsSearch: boolean;
  protocol: DownloadProtocol;
  priority: number;
  downloadClientId: number;
  tags: number[];

  // Schema responses only: the canned configurations an implementation offers.
  presets?: Indexer[];
}

export default Indexer;
