import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PinVerification = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/verify-pin', { pin });
      localStorage.setItem('pinVerified', 'true');
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Pin verification failed');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Hotel Management System
          </Typography>
          <Typography component="h2" variant="h6" align="center" gutterBottom>
            Enter Property PIN
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              type="password"
              label="Property PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              inputProps={{ maxLength: 5 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={pin.length !== 5}
            >
              Verify PIN
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PinVerification;
