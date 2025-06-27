import { Routes, Route } from 'react-router-dom' 
import MainLayout from './components/MainLayout';
import { NotFound, Unauthorized } from './components/ErrorPages';
import { 
    ProtectedRoute, 
    PublicRoute, 
    AdminRoute, 
    ResearcherRoute, 
    ResearcherAdminRoute,
    VolunteerAdminRoute,
    VolunteerOnlyRoute
} from './components/ProtectedRoute';
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
import ManageSubmissionsPage from './pages/ManageSubmissionsPage';
import AdminStatsAndHeatmapPage from './pages/AdminStatsAndHeatmapPage';
import ResearcherDashboard from './pages/ResearcherDashboard';
import ManageExperimentPage from './pages/ManageExperimentPage';
import EditExperimentPage from './pages/EditExperimentPage';

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes - Accessible to everyone */}
        <Route path="/" element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        {/* Protected Routes - Require authentication */}
        <Route path="/dashboardrole" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />

        {/* Researcher Only Routes */}
        <Route path="/experiments/create" element={
          <ResearcherRoute>
            <CreateExperiment />
          </ResearcherRoute>
        } />
        <Route path="/experiments/create/:id" element={
          <ResearcherAdminRoute>
            <ManageExperimentPage />
          </ResearcherAdminRoute>
        } />
        <Route path="/experiments/edit/:id" element={
          <ResearcherRoute>
            <EditExperimentPage />
          </ResearcherRoute>
        } />

        {/* Routes with Navbar - Protected */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          {/* Volunteer Only routes */}
          <Route path="/homepage" element={
            <VolunteerOnlyRoute>
              <HomePage />
            </VolunteerOnlyRoute>
          } />
          <Route path="/experiments" element={
            <VolunteerOnlyRoute>
              <Experiments />
            </VolunteerOnlyRoute>
          } />
          <Route path="/experiments/:id" element={
            <VolunteerOnlyRoute>
              <ExperimentDetail />
            </VolunteerOnlyRoute>
          } />
          <Route path="/experiments/:id/submit" element={
            <VolunteerOnlyRoute>
              <Submission />
            </VolunteerOnlyRoute>
          } />
          <Route path="/kontribusi" element={
            <VolunteerOnlyRoute>
              <Kontribusi />
            </VolunteerOnlyRoute>
          } />
          
          {/* Profile bisa diakses semua role yang sudah login */}
          <Route path="/profile" element={<Profile />} />

          {/* Admin Only Routes */}
          <Route path="/admin/usermanagement" element={
            <AdminRoute>
              <AdminUserManagement />
            </AdminRoute>
          } />
          <Route path="/admin/experimentmanagement" element={
            <AdminRoute>
              <AdminExperimentManagement />
            </AdminRoute>
          } />
          <Route path="/admin/experiments" element={
            <AdminRoute>
              <Experiments />
            </AdminRoute>
          } />
          <Route path="/admin/experiments/:id" element={
            <AdminRoute>
              <ExperimentDetail />
            </AdminRoute>
          } />
          <Route path="/admin/experiments/:id/manage" element={
            <AdminRoute>
              <ManageSubmissionsPage />
            </AdminRoute>
          } />
          <Route path="/admin/stats" element={
            <AdminRoute>
              <AdminStatsAndHeatmapPage />
            </AdminRoute>
          } />

          {/* Researcher Only Routes */}
          <Route path="/researcher/dashboard" element={
            <ResearcherRoute>
              <ResearcherDashboard />
            </ResearcherRoute>
          } />
          <Route path="/researcher/experiments" element={
            <ResearcherRoute>
              <Experiments />
            </ResearcherRoute>
          } />
          <Route path="/researcher/experiments/:id" element={
            <ResearcherRoute>
              <ExperimentDetail />
            </ResearcherRoute>
          } />
        </Route>

        {/* Unauthorized access route */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* 404 - Catch all unmatched routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App