import _ from 'lodash';

export default function migrateMonitorToEnum(persistedState) {
  _.remove(persistedState, 'addMovie.movieDefaults.monitor');
  _.remove(persistedState, 'addMovie.performerDefaults.monitor');
  _.remove(persistedState, 'addMovie.studioDefaults.monitor');
}
