import translate from 'Utilities/String/translate';

const monitorOptions = [
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
