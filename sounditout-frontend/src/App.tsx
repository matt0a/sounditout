import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from "./pages/Dashboard";
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentDetail from './pages/StudentDetail';


function App() {
  return (
      <Router>
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/home" element={<Dashboard />} />
            <Route path="/students/:id" element={<StudentDetail />} />
        </Routes>
      </Router>
  );
}

export default App;
