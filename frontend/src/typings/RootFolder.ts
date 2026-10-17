import ModelBase from 'App/ModelBase';
import ImportFile from './ImportFile';

interface RootFolder extends ModelBase {
  id: number;
  path: string;
  accessible: boolean;
  freeSpace?: number;
  importFileCount: number;
  importFiles?: ImportFile[];
}

export default RootFolder;
