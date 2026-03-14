import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AppLogFiles from './App/AppLogFiles';
import UpdateLogFiles from './Update/UpdateLogFiles';

function Logs() {
  return (
    <Routes>
      <Route index={true} element={<AppLogFiles />} />

      <Route path="update" element={<UpdateLogFiles />} />
    </Routes>
  );
}

export default Logs;
