import ModelBase from 'App/ModelBase';

interface RootFolder extends ModelBase {
  id: number;
  path: string;
  accessible: boolean;
  freeSpace?: number;
  importFiles: object[];
}

export default RootFolder;
