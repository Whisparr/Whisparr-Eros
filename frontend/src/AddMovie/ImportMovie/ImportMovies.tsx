import React from 'react';
import { Route } from 'react-router-dom';
import Switch from 'Components/Router/Switch';
import ImportMovie from './Import/ImportMovie';
import ImportMovieSelectFolder from './SelectFolder/ImportMovieSelectFolder';

function ImportMovies() {
  return (
    <Switch>
      <Route
        exact={true}
        path="/add/import/movies"
        component={ImportMovieSelectFolder}
      />

      <Route
        exact={true}
        path="/add/import/scenes"
        component={ImportMovieSelectFolder}
      />

      <Route path="/add/import/movies/:rootFolderId" component={ImportMovie} />

      <Route path="/add/import/scenes/:rootFolderId" component={ImportMovie} />

      <Route path="/add/import/:rootFolderId" component={ImportMovie} />
    </Switch>
  );
}

export default ImportMovies;
