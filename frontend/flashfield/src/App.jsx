import { Routes, Route } from 'react-router-dom' 
import MainLayout from './components/MainLayout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login' 
import Register from './pages/Register'
import HomePage from './pages/HomePage'
import Experiments from './pages/Experiments';
import ExperimentDetail from './pages/ExperimentDetail';
import Submission from './pages/Submission';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import './index.css';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<MainLayout />}>
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/experiments" element={<Experiments />} />
        <Route path="/experiments/:id" element={<ExperimentDetail />} />
        <Route path="/experiments/:id/submit" element={<Submission />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
    </>
  )
}

export default App