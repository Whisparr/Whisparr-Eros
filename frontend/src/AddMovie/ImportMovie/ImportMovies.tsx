import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ImportMovie from './Import/ImportMovie';
import ImportMovieSelectFolder from './SelectFolder/ImportMovieSelectFolder';

function ImportMovies() {
  return (
    <Routes>
      <Route path="movies" element={<ImportMovieSelectFolder />} />

      <Route path="scenes" element={<ImportMovieSelectFolder />} />

      <Route path="movies/:rootFolderId" element={<ImportMovie />} />

      <Route path="scenes/:rootFolderId" element={<ImportMovie />} />

      <Route path=":rootFolderId" element={<ImportMovie />} />
    </Routes>
  );
}

export default ImportMovies;
