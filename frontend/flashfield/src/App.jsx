import { Routes, Route } from 'react-router-dom' 
import MainLayout from './components/MainLayout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login' 
import Register from './pages/Register'
import HomePage from './pages/HomePage'
import Experiments from './pages/Experiments';
import ExperimentDetail from './pages/ExperimentDetail';
import Submission from './pages/Submission';
import Kontribusi from './pages/Kontribusi';
import Profile from './pages/Profile';
import CreateExperiment from './pages/CreateExperiment';
import DashboardPage from './pages/DashboardPage';
import AdminUserManagement from './pages/AdminUserManagement';
import './index.css';
import AdminExperimentManagement from './pages/AdminExperimentManagement';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<MainLayout />}>
        <Route path="/dashboardrole" element={<DashboardPage />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/experiments" element={<Experiments />} />
        <Route path="/experiments/:id" element={<ExperimentDetail />} />
        <Route path="/experiments/:id/submit" element={<Submission />} />
        <Route path="/kontribusi" element={<Kontribusi />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/admin/usermanagement" element={<AdminUserManagement />} />
        <Route path="/admin/experimentmanagement" element={<AdminExperimentManagement />} />

        <Route path="/experiments/create" element={<CreateExperiment />} />
      </Route>
    </Routes>
    </>
  )
}

export default App