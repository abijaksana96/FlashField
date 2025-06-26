import { Routes, Route } from 'react-router-dom' 
import MainLayout from './components/MainLayout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login' 
import Register from './pages/Register'
import HomePage from './pages/HomePage'
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
        {/* <Route path="/experiments" element={<ExperimentsListPage />} /> */}
        {/* Tambahkan rute lain yang memerlukan layout di sini */}
        {/* <Route path="/profile" element={<ProfilePage />} /> */}
      </Route>
    </Routes>
    </>
  )
}

export default App