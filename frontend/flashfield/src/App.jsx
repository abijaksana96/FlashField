import { useState } from 'react'
import { Routes, Route } from 'react-router-dom' 

import LandingPage from './pages/LandingPage';
import Login from './pages/Login' 
import Register from './pages/Register'
import './index.css';

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  )
}

export default App