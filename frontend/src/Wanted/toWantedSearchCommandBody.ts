import { PropertyFilter } from 'Filters/Filter';

export interface WantedSearchCommandBody {
  name: string;
  movieIds?: number[];
  qualityProfileIds?: number[];
  movieTags?: number[];
  quality?: number[];
}

const FILTER_KEYS = [
  'movieIds',
  'qualityProfileIds',
  'movieTags',
  'quality',
] as const;

// "Search All" runs against the same filter the page is showing, so the active
// filter has to travel to the command as well as to the paged query.
const toWantedSearchCommandBody = (
  name: string,
  filters: PropertyFilter[]
): WantedSearchCommandBody => {
  const body: WantedSearchCommandBody = { name };

  filters.forEach((filter) => {
    const key = FILTER_KEYS.find((k) => k === filter.key);

    if (!key) {
      return;
    }

    body[key] = (
      Array.isArray(filter.value) ? filter.value : [filter.value]
    ) as number[];
  });

  return body;
};

export default toWantedSearchCommandBody;
