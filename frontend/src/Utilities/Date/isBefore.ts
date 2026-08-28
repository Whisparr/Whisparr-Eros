import moment, { unitOfTime } from 'moment';

export type DateOffsets = Partial<
  Record<unitOfTime.DurationConstructor, number>
>;

function isBefore(date?: string | Date | null, offsets: DateOffsets = {}) {
  if (!date) {
    return false;
  }

  const offsetTime = moment();

  (Object.keys(offsets) as unitOfTime.DurationConstructor[]).forEach((key) => {
    offsetTime.add(offsets[key], key);
  });

  return moment(date).isBefore(offsetTime);
}

export default isBefore;
