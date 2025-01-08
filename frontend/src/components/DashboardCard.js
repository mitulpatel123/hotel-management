import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const priorityColors = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#f44336'
};

const DashboardCard = ({ item, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { user } = useAuth();
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleEdit = () => {
    handleMenuClose();
    onEdit(item);
  };
  
  const handleDelete = () => {
    handleMenuClose();
    onDelete(item._id);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography variant="h6" component="div" gutterBottom>
              {item.title}
            </Typography>
            
            <Box display="flex" gap={1} mb={1}>
              <Chip
                size="small"
                label={item.type.toUpperCase()}
                color={item.type === 'pass-on' ? 'primary' : 'default'}
              />
              <Chip
                size="small"
                icon={<FlagIcon sx={{ color: priorityColors[item.priority] }} />}
                label={item.priority.toUpperCase()}
              />
              <Chip
                size="small"
                label={item.status.toUpperCase()}
                color={item.status === 'resolved' ? 'success' : 'warning'}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              {item.description}
            </Typography>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Created by: {item.createdBy?.username || 'Unknown'}
              <br />
              {new Date(item.createdAt).toLocaleString()}
            </Typography>
          </Box>
          
          {user && (
            <>
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleEdit}>Edit</MenuItem>
                <MenuItem onClick={handleDelete}>Delete</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
