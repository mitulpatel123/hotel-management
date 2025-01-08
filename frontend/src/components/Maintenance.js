import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Fab,
  Grid,
  Paper,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon,
  Build as BuildIcon,
  Warning as WarningIcon,
  Engineering as EngineeringIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import MaintenanceCard from './MaintenanceCard';

const Maintenance = () => {
  const [maintenanceItems, setMaintenanceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newHeading, setNewHeading] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  
  const { user } = useAuth();
  const { subscribeToEvent } = useSocket();

  useEffect(() => {
    fetchMaintenanceItems();

    // Subscribe to real-time updates
    const unsubscribeHeadingAdded = subscribeToEvent('maintenance:headingAdded', (newHeading) => {
      setMaintenanceItems(prevItems => [newHeading, ...prevItems]);
    });

    const unsubscribeHeadingDeleted = subscribeToEvent('maintenance:headingDeleted', (headingId) => {
      setMaintenanceItems(prevItems => prevItems.filter(item => item._id !== headingId));
    });

    const unsubscribeIssueAdded = subscribeToEvent('maintenance:issueAdded', ({ headingId, updatedHeading }) => {
      setMaintenanceItems(prevItems => prevItems.map(item =>
        item._id === headingId ? updatedHeading : item
      ));
    });

    const unsubscribeIssueUpdated = subscribeToEvent('maintenance:issueUpdated', ({ headingId, updatedHeading }) => {
      setMaintenanceItems(prevItems => prevItems.map(item =>
        item._id === headingId ? updatedHeading : item
      ));
    });

    const unsubscribeIssueDeleted = subscribeToEvent('maintenance:issueDeleted', ({ headingId, updatedHeading }) => {
      setMaintenanceItems(prevItems => prevItems.map(item =>
        item._id === headingId ? updatedHeading : item
      ));
    });

    return () => {
      unsubscribeHeadingAdded();
      unsubscribeHeadingDeleted();
      unsubscribeIssueAdded();
      unsubscribeIssueUpdated();
      unsubscribeIssueDeleted();
    };
  }, [subscribeToEvent]);

  const fetchMaintenanceItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/maintenance');
      setMaintenanceItems(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch maintenance items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHeading = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/maintenance',
        { heading: newHeading },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setMaintenanceItems([response.data, ...maintenanceItems]);
      setDialogOpen(false);
      setNewHeading('');
      setError('');
    } catch (err) {
      setError('Failed to add maintenance heading');
      console.error(err);
    }
  };

  const handleDeleteHeading = async (headingId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/maintenance/${headingId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setMaintenanceItems(maintenanceItems.filter(item => item._id !== headingId));
      setError('');
    } catch (err) {
      setError('Failed to delete maintenance heading');
      console.error(err);
    }
  };

  const handleAddIssue = async (headingId, issue) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/maintenance/${headingId}/issues`,
        issue,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setMaintenanceItems(maintenanceItems.map(item =>
        item._id === headingId ? response.data : item
      ));
      setError('');
    } catch (err) {
      setError('Failed to add maintenance issue');
      console.error(err);
    }
  };

  const handleUpdateIssue = async (headingId, issueId, update) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/maintenance/${headingId}/issues/${issueId}`,
        update,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setMaintenanceItems(maintenanceItems.map(item =>
        item._id === headingId ? response.data : item
      ));
      setError('');
    } catch (err) {
      setError('Failed to update maintenance issue');
      console.error(err);
    }
  };

  const handleDeleteIssue = async (headingId, issueId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/maintenance/${headingId}/issues/${issueId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setMaintenanceItems(maintenanceItems.map(item =>
        item._id === headingId ? response.data : item
      ));
      setError('');
    } catch (err) {
      setError('Failed to delete maintenance issue');
      console.error(err);
    }
  };

  const getFilteredItems = () => {
    if (selectedTab === 'all') return maintenanceItems;

    return maintenanceItems.filter(item => 
      item.issues.some(issue => issue.status === selectedTab)
    );
  };

  const getTotalIssues = (status) => {
    return maintenanceItems.reduce((total, item) => 
      total + item.issues.filter(issue => issue.status === status).length, 0
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildIcon />
            Maintenance Management
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Add Category
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 1.5,
                background: 'linear-gradient(45deg, #fff3e0 30%, #ffe0b2 90%)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <WarningIcon sx={{ color: '#ff9800', fontSize: 32 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#f57c00' }}>Pending Issues</Typography>
                <Typography variant="h5">{getTotalIssues('pending')}</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 1.5,
                background: 'linear-gradient(45deg, #e3f2fd 30%, #bbdefb 90%)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <EngineeringIcon sx={{ color: '#2196f3', fontSize: 32 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#1976d2' }}>In Progress</Typography>
                <Typography variant="h5">{getTotalIssues('in-progress')}</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 1.5,
                background: 'linear-gradient(45deg, #e8f5e9 30%, #c8e6c9 90%)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 32 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#388e3c' }}>Resolved</Typography>
                <Typography variant="h5">{getTotalIssues('resolved')}</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ mb: 2, overflow: 'hidden' }}>
          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonMobile
            sx={{
              minHeight: { xs: '48px', sm: '56px' },
              '& .MuiTab-root': {
                minHeight: { xs: '48px', sm: '56px' },
                padding: { xs: '6px 12px', sm: '12px 16px' },
                minWidth: { xs: 'auto', sm: '160px' },
                flexDirection: { xs: 'row', sm: 'row' },
                gap: 1,
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              },
              '& .MuiSvgIcon-root': {
                fontSize: { xs: 16, sm: 20 }
              }
            }}
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BuildIcon />
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>All</Box>
                  <Box sx={{ display: { xs: 'block', sm: 'none' } }}>All</Box>
                </Box>
              }
              value="all"
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <WarningIcon sx={{ color: '#ff9800' }} />
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Pending</Box>
                  <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Pending</Box>
                  <Chip 
                    label={getTotalIssues('pending')} 
                    size="small" 
                    sx={{ 
                      ml: 0.5,
                      height: { xs: '16px', sm: '20px' },
                      '& .MuiChip-label': {
                        px: { xs: 0.5, sm: 1 },
                        fontSize: { xs: '0.625rem', sm: '0.75rem' }
                      }
                    }} 
                  />
                </Box>
              }
              value="pending"
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EngineeringIcon sx={{ color: '#2196f3' }} />
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>In Progress</Box>
                  <Box sx={{ display: { xs: 'block', sm: 'none' } }}>In Prog</Box>
                  <Chip 
                    label={getTotalIssues('in-progress')} 
                    size="small" 
                    sx={{ 
                      ml: 0.5,
                      height: { xs: '16px', sm: '20px' },
                      '& .MuiChip-label': {
                        px: { xs: 0.5, sm: 1 },
                        fontSize: { xs: '0.625rem', sm: '0.75rem' }
                      }
                    }} 
                  />
                </Box>
              }
              value="in-progress"
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleIcon sx={{ color: '#4caf50' }} />
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Resolved</Box>
                  <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Done</Box>
                  <Chip 
                    label={getTotalIssues('resolved')} 
                    size="small" 
                    sx={{ 
                      ml: 0.5,
                      height: { xs: '16px', sm: '20px' },
                      '& .MuiChip-label': {
                        px: { xs: 0.5, sm: 1 },
                        fontSize: { xs: '0.625rem', sm: '0.75rem' }
                      }
                    }} 
                  />
                </Box>
              }
              value="resolved"
            />
          </Tabs>
        </Paper>

        {getFilteredItems().map((item) => (
          <MaintenanceCard
            key={item._id}
            item={item}
            onAddIssue={handleAddIssue}
            onUpdateIssue={handleUpdateIssue}
            onDeleteIssue={handleDeleteIssue}
            onDeleteHeading={handleDeleteHeading}
          />
        ))}

        {getFilteredItems().length === 0 && (
          <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            <BuildIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
            <Typography variant="subtitle1">No Maintenance Items</Typography>
            <Typography variant="body2">
              {selectedTab === 'all'
                ? "No maintenance categories found. Click 'Add Category' to create one."
                : `No ${selectedTab} issues found.`}
            </Typography>
          </Paper>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Maintenance Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            value={newHeading}
            onChange={(e) => setNewHeading(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddHeading}
            variant="contained"
            disabled={!newHeading.trim()}
          >
            Add Category
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Maintenance;
