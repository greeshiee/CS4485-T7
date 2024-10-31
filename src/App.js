import React, { Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Splash from "./pages/splash";
import Usecase1 from "./pages/usecase1";
import AuthWrapper from "./components/authwrapper";
import Callback from "./pages/callback";
import Loading from "./components/loading";
import DataGeneration from "./pages/datageneration";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <AuthWrapper>
          <Suspense
            fallback={
              <div className="h-screen flex justify-center items-center">
                <Loading />
              </div>
            }
          >
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/callback" element={<Callback />} exact />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/splash" element={<Splash />} />
              <Route path="/usecase1" element={<Usecase1 />} />
              <Route path="/data-generation" element={<DataGeneration />} />
              <Route path="/" element={<Splash />} /> {/* Default route */}
            </Routes>
          </Suspense>
        </AuthWrapper>
      </div>
    </Router>
  );
}

export default App;
