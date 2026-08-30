import { PropertyFilter } from 'Filters/Filter';

// Reads the `monitored` value out of the filters the selected filter key
// resolved to, which is what decides whether the toolbar offers to monitor or
// unmonitor the selection.
//
// `PropertyFilter` only allows array values, so the boolean arrives wrapped as
// `[true]` / `[false]` and has to be unwrapped before being tested -- a plain
// truthiness check reads `[false]` as monitored and labels the button
// backwards on the unmonitored filter.
export default function getMonitoredValue(filters: PropertyFilter[]): boolean {
  const value = filters.find((filter) => filter.key === 'monitored')?.value;

  return Array.isArray(value) && value[0] === true;
}
