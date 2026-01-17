import ModelBase from 'App/ModelBase';

export default interface ImportListExclusion extends ModelBase {
  foreignId: string;
  movieTitle: string;
  type: string;
}
