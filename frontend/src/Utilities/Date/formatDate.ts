import moment from 'moment';

function formatDate(date?: string | Date | null, dateFormat?: string) {
  if (!date) {
    return '';
  }

  return moment(date).format(dateFormat);
}

export default formatDate;
