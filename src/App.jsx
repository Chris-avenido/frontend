import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ProjectProcess from './pages/Project-process';
import ProjectView from './pages/Project-view';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ssoToken = urlParams.get('sso_token');
    if (ssoToken) {
      try {
        // 1. Decode the JWT payload containing the user object
        const payloadBase64 = ssoToken.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        // 2. Set the expected localStorage keys for the Finance session
        localStorage.setItem('authUser', JSON.stringify(decodedPayload));
        localStorage.setItem('user', decodedPayload.uid);
        localStorage.setItem('role', decodedPayload.role);
        localStorage.setItem('expiryTime', (decodedPayload.exp * 1000).toString());
        localStorage.setItem('division', decodedPayload.division || '');
        // 3. Clean the sso_token query parameter from the URL address bar
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // 4. Redirect the user to the logged-in home page
        window.location.href = '/home';
      } catch (error) {
        console.error('SSO login parsing failed:', error);
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/projects-list" element={<ProjectProcess />} />
          <Route path="/project-view/:projectToken" element={<ProjectView />} />
          <Route path="/project-process/:projectToken" element={<ProjectView />} />
          <Route path="/test" element={<ProjectView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
