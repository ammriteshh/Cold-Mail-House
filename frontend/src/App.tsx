
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <>
              <SignedIn>
                <Navigate to="/" />
              </SignedIn>
              <SignedOut>
                <Login />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/"
          element={
            <>
              <SignedIn>
                <Dashboard />
              </SignedIn>
              <SignedOut>
                <Navigate to="/login" />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
