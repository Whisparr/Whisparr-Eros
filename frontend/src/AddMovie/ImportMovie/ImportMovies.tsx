import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ImportMovie from './Import/ImportMovie';
import ImportMovieSelectFolder from './SelectFolder/ImportMovieSelectFolder';

function ImportMovies() {
  return (
    <Routes>
      <Route index={true} element={<Navigate to="scenes" replace={true} />} />

      <Route
        path="movies"
        element={<ImportMovieSelectFolder itemType="movie" />}
      />

      <Route
        path="scenes"
        element={<ImportMovieSelectFolder itemType="scene" />}
      />

      <Route
        path="movies/:rootFolderId"
        element={<ImportMovie itemType="movie" />}
      />

      <Route
        path="scenes/:rootFolderId"
        element={<ImportMovie itemType="scene" />}
      />

      {/* Reached from Settings > Media Management, where the root folder
          carries no type — the server infers movie vs scene per file. */}
      <Route path=":rootFolderId" element={<ImportMovie />} />
    </Routes>
  );
}

export default ImportMovies;
