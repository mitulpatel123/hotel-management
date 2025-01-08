import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import PinVerification from './components/PinVerification';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Maintenance from './components/Maintenance';
import AdminPanel from './components/admin/AdminPanel';
import { Box } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Navigation />
            <Box sx={{ pt: 2 }}>
              <Routes>
                <Route path="/" element={<Navigate to="/pin" replace />} />
                <Route path="/pin" element={<PinVerification />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/maintenance"
                  element={
                    <ProtectedRoute>
                      <Maintenance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAuth={true}>
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Box>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
