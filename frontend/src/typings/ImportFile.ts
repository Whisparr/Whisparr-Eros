import ModelBase from 'App/ModelBase';

interface ImportFile extends ModelBase {
  id: number;
  rootFolderId: number;
  path: string;
  relativePath: string;
  name: string;
  foreignId: string;
  qualityProfileId: number;
}

export default ImportFile;
