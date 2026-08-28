import ModelBase from 'App/ModelBase';
import Field from './Field';

export interface QualityProfileFormatItem {
  format: number;
  name: string;
  score: number;
}

// `id` is not on the wire, for the same reason an auto tagging condition's is
// not: a condition belongs to its custom format rather than being a resource of
// its own, and `CustomFormatSpecificationSchema` leaves `Id` at its default,
// which the serialiser drops. `useManageCustomFormat` numbers them on the
// client so the cards can be keyed and the handlers can name one.
export interface CustomFormatSpecification {
  id: number;
  name: string;
  implementation: string;
  implementationName: string;
  infoLink?: string;
  negate: boolean;
  required: boolean;
  fields: Field[];

  // Schema-only. `/customformat/schema` hangs the six built-in presets plus
  // every existing format's conditions off the implementation they belong to,
  // and the server rejects the key on the way back up.
  presets?: CustomFormatSpecification[];
}

interface CustomFormat extends ModelBase {
  name: string;
  includeCustomFormatWhenRenaming: boolean;
  specifications: CustomFormatSpecification[];
}

export default CustomFormat;
