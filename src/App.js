import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Drives from './pages/Drives';
import Reports from './pages/Reports';
import Students from './pages/Students';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  const AuthRoute = ({ children }) => {
    return !isAuthenticated ? children : <Navigate to="/dashboard" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <AuthRoute>
            <Login setIsAuthenticated={setIsAuthenticated} />
          </AuthRoute>
        } />
        <Route path="/signup" element={
          <AuthRoute>
            <Signup />
          </AuthRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout handleLogout={handleLogout} />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="drives" element={<Drives />} />
          <Route path="reports" element={<Reports />} />
          {/* <Route path="students" element={<Students />} /> */}
          <Route path="register" element={<Students />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;