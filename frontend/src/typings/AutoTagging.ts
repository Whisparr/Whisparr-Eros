import ModelBase from 'App/ModelBase';
import Field from './Field';

// `id` is not on the wire. A condition is part of its auto tag, never a
// resource of its own, and `AutoTaggingSpecificationSchema` leaves `Id` at its
// default, which the serialiser drops. `useManageAutoTagging` assigns one on
// the client so the cards can be keyed and named; it goes back up unread.
export interface AutoTaggingSpecification {
  id: number;
  name: string;
  implementation: string;
  implementationName: string;
  negate: boolean;
  required: boolean;
  fields: Field[];
}

interface AutoTagging extends ModelBase {
  name: string;
  removeTagsAutomatically: boolean;
  tags: number[];
  specifications: AutoTaggingSpecification[];
}

export default AutoTagging;
