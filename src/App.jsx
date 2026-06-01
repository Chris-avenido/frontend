import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ProjectProcess from './pages/Project-process';
import ProjectView from './pages/Project-view';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/projects-list" element={<ProjectProcess />} />
        <Route path="/test" element={<ProjectView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
