import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import DashboardCard from './DashboardCard';
import ItemDialog from './ItemDialog';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  
  const { user } = useAuth();
  const { subscribeToEvent } = useSocket();

  useEffect(() => {
    fetchItems();

    const unsubscribeItemAdded = subscribeToEvent('dashboardItem:added', (newItem) => {
      setItems(prevItems => [newItem, ...prevItems]);
    });

    const unsubscribeItemUpdated = subscribeToEvent('dashboardItem:updated', (updatedItem) => {
      setItems(prevItems => prevItems.map(item => 
        item._id === updatedItem._id ? updatedItem : item
      ));
    });

    const unsubscribeItemDeleted = subscribeToEvent('dashboardItem:deleted', (deletedItemId) => {
      setItems(prevItems => prevItems.filter(item => item._id !== deletedItemId));
    });

    return () => {
      unsubscribeItemAdded();
      unsubscribeItemUpdated();
      unsubscribeItemDeleted();
    };
  }, [subscribeToEvent]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/dashboard');
      setItems(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch items');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (formData) => {
    try {
      const response = await axiosInstance.post('/dashboard', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setItems([response.data, ...items]);
      setError('');
    } catch (err) {
      setError('Failed to add item');
      console.error(err);
    }
  };

  const handleEditItem = async (formData) => {
    try {
      const response = await axiosInstance.put(
        `/dashboard/${editItem._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setItems(items.map(item => 
        item._id === editItem._id ? response.data : item
      ));
      setEditItem(null);
      setError('');
    } catch (err) {
      setError('Failed to update item');
      console.error(err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await axiosInstance.delete(`/dashboard/${itemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setItems(items.filter(item => item._id !== itemId));
      setError('');
    } catch (err) {
      setError('Failed to delete item');
      console.error(err);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesTab = selectedTab === 'all' || item.type === selectedTab;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleOpenDialog = (item = null) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditItem(null);
    setDialogOpen(false);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        
        {user && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Item
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="All" value="all" />
        <Tab label="Pass-ons" value="pass-on" />
        <Tab label="Complaints" value="complaint" />
        <Tab label="Reminders" value="reminder" />
      </Tabs>

      {filteredItems.map(item => (
        <DashboardCard
          key={item._id}
          item={item}
          onEdit={handleOpenDialog}
          onDelete={handleDeleteItem}
        />
      ))}

      {filteredItems.length === 0 && (
        <Typography textAlign="center" color="text.secondary">
          No items found
        </Typography>
      )}

      <ItemDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={editItem ? handleEditItem : handleAddItem}
        initialData={editItem}
      />

      {/* Mobile FAB for adding items */}
      {user && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16, display: { sm: 'none' } }}
          onClick={() => handleOpenDialog()}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

export default Dashboard;
