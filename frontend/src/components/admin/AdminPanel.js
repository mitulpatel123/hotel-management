import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import axiosInstance from '../../utils/axios';
import UserManagement from './UserManagement';
import LogViewer from './LogViewer';
import { useSocket } from '../../context/SocketContext';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { subscribeToEvent } = useSocket();

  useEffect(() => {
    fetchData();

    const unsubscribeUserAdded = subscribeToEvent('user:added', (newUser) => {
      setUsers(prevUsers => [newUser, ...prevUsers]);
    });

    const unsubscribeUserUpdated = subscribeToEvent('user:updated', (updatedUser) => {
      setUsers(prevUsers => prevUsers.map(user =>
        user._id === updatedUser._id ? updatedUser : user
      ));
    });

    const unsubscribeUserDeleted = subscribeToEvent('user:deleted', (userId) => {
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
    });

    const unsubscribeLogAdded = subscribeToEvent('log:added', (newLog) => {
      setLogs(prevLogs => [newLog, ...prevLogs]);
    });

    const unsubscribeStatsUpdated = subscribeToEvent('stats:updated', (newStats) => {
      setStats(newStats);
    });

    return () => {
      unsubscribeUserAdded();
      unsubscribeUserUpdated();
      unsubscribeUserDeleted();
      unsubscribeLogAdded();
      unsubscribeStatsUpdated();
    };
  }, [subscribeToEvent]);

  const fetchData = async () => {
    try {
      const [usersRes, logsRes, statsRes] = await Promise.all([
        axiosInstance.get('/auth/users'),
        axiosInstance.get('/logs'),
        axiosInstance.get('/logs/stats')
      ]);

      setUsers(usersRes.data);
      setLogs(logsRes.data);
      setStats(statsRes.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch admin data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogFilterChange = async (filters) => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.user) params.append('user', filters.user);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await axiosInstance.get(`/logs?${params.toString()}`);
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch filtered logs:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Panel
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Action Statistics
                </Typography>
                {stats.actionStats.map(stat => (
                  <Box key={stat._id} display="flex" justifyContent="space-between">
                    <Typography>{stat._id}:</Typography>
                    <Typography>{stat.count}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Most Active Users
                </Typography>
                {stats.userStats.map(stat => (
                  <Box key={stat._id} display="flex" justifyContent="space-between">
                    <Typography>{stat._id}:</Typography>
                    <Typography>{stat.count} actions</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Item Type Statistics
                </Typography>
                {stats.itemTypeStats.map(stat => (
                  <Box key={stat._id} display="flex" justifyContent="space-between">
                    <Typography>{stat._id}:</Typography>
                    <Typography>{stat.count}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="User Management" />
          <Tab label="Activity Logs" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <UserManagement
          users={users}
          onUserChange={fetchData}
        />
      )}

      {activeTab === 1 && (
        <LogViewer
          logs={logs}
          onFilterChange={handleLogFilterChange}
          stats={stats}
        />
      )}
    </Container>
  );
};

export default AdminPanel;
