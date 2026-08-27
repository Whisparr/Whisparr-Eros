import { InputChanged } from 'typings/inputs';
import { PendingSection } from 'typings/pending';
import General from 'typings/Settings/General';

// Each fieldset below renders a contiguous slice of one form, so they all take
// the same pair. Sonarr's equivalents take the fields they use as individual
// props -- forty-odd of them across the eight -- which types each fieldset's
// share of the form but is pure plumbing, since every one comes from this
// object and is passed straight to a `FormInputGroup`.
export interface GeneralSettingsSectionProps {
  settings: PendingSection<General>;
  onInputChange: (change: InputChanged) => void;
}
