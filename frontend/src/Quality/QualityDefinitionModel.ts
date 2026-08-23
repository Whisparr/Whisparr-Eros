import ModelBase from 'App/ModelBase';
import Quality from './Quality';

export default interface QualityDefinitionModel extends ModelBase {
  quality: Quality;
  title: string;
  weight: number;
  // All three are nullable on the resource. A null max or preferred size means
  // "unlimited", which is what the slider's top position sends back.
  minSize: number | null;
  maxSize: number | null;
  preferredSize: number | null;
}
