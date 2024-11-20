import React, {Suspense} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AddTilePage from './components/AddTilePage.js';
import Landing from './components/Landing.js'
import SingleDashboard from './components/SingleDashboard.js'; 
import Read_OnlyDash from './components/Read_OnlyDash.js';
import './UC3.css';
import AuthWrapper from "../../components/authwrapper.js";
import Loading from "../../components/loading.js";

function UC3() {
  return (
    <AuthWrapper>
      <Suspense
        fallback={
          <div className="h-screen flex justify-center items-center">
            <Loading />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Landing/>}/>
          <Route path="/add-tile/:dashboardId" element={<AddTilePage/>} />
          <Route path="/:dashboardId" element={<SingleDashboard/>} />
          <Route path="/read_only/:dashboardId" element={<Read_OnlyDash/>} />
        </Routes>
      </Suspense>
    </AuthWrapper>
  );
}

export default UC3;
