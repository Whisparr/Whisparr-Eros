import { MovieMonitor } from 'Movie/Movie';
import Provider from './Provider';

interface ImportList extends Provider {
  enable: boolean;
  enabled: boolean;
  enableAuto: boolean;
  qualityProfileId: number;
  minimumAvailability: string;
  rootFolderPath: string;
  monitor: MovieMonitor;
  searchOnAdd: boolean;
  lastInfoSync: string;
  listType: string;
  listOrder: number;
  minRefreshInterval: string;
  name: string;
  tags: number[];
  tagExisting: boolean;
}

export default ImportList;
