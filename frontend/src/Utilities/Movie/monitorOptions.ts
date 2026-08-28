import { EnhancedSelectInputValue } from 'Components/Form/Select/EnhancedSelectInput';
import translate from 'Utilities/String/translate';

const monitorOptions: EnhancedSelectInputValue<string>[] = [
  {
    key: 'movieOnly',
    get value() {
      return translate('Monitor');
    },
  },
  {
    key: 'none',
    get value() {
      return translate('None');
    },
  },
];

export default monitorOptions;
