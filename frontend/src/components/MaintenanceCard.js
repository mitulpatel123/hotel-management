import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Chip,
  Menu,
  MenuItem,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Divider,
  Avatar
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Build as BuildIcon,
  Room as RoomIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Engineering as EngineeringIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const statusIcons = {
  pending: <WarningIcon />,
  'in-progress': <EngineeringIcon />,
  resolved: <CheckCircleIcon />
};

const MaintenanceCard = ({ item, onAddIssue, onUpdateIssue, onDeleteIssue, onDeleteHeading }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [newIssue, setNewIssue] = useState({
    roomNumber: '',
    description: '',
    status: 'pending'
  });
  
  const { user } = useAuth();

  const handleMenuClick = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleDeleteHeading = () => {
    handleMenuClose();
    onDeleteHeading(item._id);
  };

  const handleAddIssue = () => {
    onAddIssue(item._id, newIssue);
    setIssueDialogOpen(false);
    setNewIssue({ roomNumber: '', description: '', status: 'pending' });
  };

  const handleUpdateIssueStatus = (issueId, newStatus) => {
    onUpdateIssue(item._id, issueId, { status: newStatus });
  };

  const handleDeleteIssue = (issueId) => {
    onDeleteIssue(item._id, issueId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ff9800';
      case 'in-progress':
        return '#2196f3';
      case 'resolved':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'pending':
        return '#fff3e0';
      case 'in-progress':
        return '#e3f2fd';
      case 'resolved':
        return '#e8f5e9';
      default:
        return '#f5f5f5';
    }
  };

  const getPendingCount = () => {
    return item.issues.filter(issue => issue.status === 'pending').length;
  };

  const getInProgressCount = () => {
    return item.issues.filter(issue => issue.status === 'in-progress').length;
  };

  const getResolvedCount = () => {
    return item.issues.filter(issue => issue.status === 'resolved').length;
  };

  return (
    <Card 
      elevation={3} 
      sx={{ 
        mb: 1.5,
        borderRadius: 2,
        background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease-in-out'
        }
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32 }}>
            <BuildIcon sx={{ fontSize: 18 }} />
          </Avatar>
        }
        title={
          <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            {item.heading}
          </Typography>
        }
        action={
          user && (
            <>
              <IconButton size="small" onClick={handleMenuClick}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
              >
                <MenuItem dense onClick={() => setIssueDialogOpen(true)}>
                  <AddIcon sx={{ mr: 1, fontSize: 18 }} /> Add Issue
                </MenuItem>
                {user?.role === 'admin' && (
                  <MenuItem dense onClick={handleDeleteHeading} sx={{ color: 'error.main' }}>
                    Delete Category
                  </MenuItem>
                )}
              </Menu>
            </>
          )
        }
        sx={{ py: 1 }}
      />
      <Divider />
      <CardContent sx={{ pt: 1, pb: '8px !important' }}>
        <Box sx={{ mb: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            icon={<WarningIcon sx={{ fontSize: '16px !important' }} />}
            label={`Pending: ${getPendingCount()}`}
            sx={{ bgcolor: '#fff3e0', color: '#ff9800', height: 24 }}
          />
          <Chip
            size="small"
            icon={<EngineeringIcon sx={{ fontSize: '16px !important' }} />}
            label={`In Progress: ${getInProgressCount()}`}
            sx={{ bgcolor: '#e3f2fd', color: '#2196f3', height: 24 }}
          />
          <Chip
            size="small"
            icon={<CheckCircleIcon sx={{ fontSize: '16px !important' }} />}
            label={`Resolved: ${getResolvedCount()}`}
            sx={{ bgcolor: '#e8f5e9', color: '#4caf50', height: 24 }}
          />
        </Box>
        
        <List sx={{ width: '100%', bgcolor: 'background.paper' }} dense>
          {item.issues.map((issue) => (
            <Paper
              key={issue._id}
              elevation={1}
              sx={{
                mb: 1,
                bgcolor: getStatusBgColor(issue.status),
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              <ListItem
                dense
                secondaryAction={
                  <Box>
                    {user && (
                      <>
                        <FormControl size="small" sx={{ minWidth: 110, mr: 1 }}>
                          <Select
                            value={issue.status}
                            onChange={(e) => handleUpdateIssueStatus(issue._id, e.target.value)}
                            sx={{
                              bgcolor: 'white',
                              '& .MuiSelect-select': {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                py: 0.5
                              }
                            }}
                          >
                            <MenuItem dense value="pending">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <WarningIcon sx={{ color: '#ff9800', fontSize: 18 }} />
                                Pending
                              </Box>
                            </MenuItem>
                            <MenuItem dense value="in-progress">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EngineeringIcon sx={{ color: '#2196f3', fontSize: 18 }} />
                                In Progress
                              </Box>
                            </MenuItem>
                            <MenuItem dense value="resolved">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 18 }} />
                                Resolved
                              </Box>
                            </MenuItem>
                          </Select>
                        </FormControl>
                        {user?.role === 'admin' && (
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleDeleteIssue(issue._id)}
                            sx={{ color: 'error.main' }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </>
                    )}
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <RoomIcon sx={{ color: getStatusColor(issue.status), fontSize: 18 }} />
                      <Typography component="span" variant="body2" sx={{ fontWeight: 'medium' }}>
                        Room {issue.roomNumber}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.25 }}>
                      <Typography component="span" variant="body2" color="text.secondary">
                        {issue.description}
                      </Typography>
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ScheduleIcon sx={{ fontSize: 14 }} />
                        {new Date(issue.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>

        {item.issues.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
            <BuildIcon sx={{ fontSize: 32, mb: 0.5, opacity: 0.5 }} />
            <Typography variant="body2">No maintenance issues reported</Typography>
          </Box>
        )}

        {user && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setIssueDialogOpen(true)}
            sx={{ mt: 1 }}
          >
            Add Issue
          </Button>
        )}
      </CardContent>

      <Dialog open={issueDialogOpen} onClose={() => setIssueDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add New Maintenance Issue
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Room Number"
              value={newIssue.roomNumber}
              onChange={(e) => setNewIssue({ ...newIssue, roomNumber: e.target.value })}
              fullWidth
              size="small"
              required
            />
            <TextField
              label="Description"
              value={newIssue.description}
              onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => setIssueDialogOpen(false)}>Cancel</Button>
          <Button
            size="small"
            onClick={handleAddIssue}
            variant="contained"
            disabled={!newIssue.roomNumber}
          >
            Add Issue
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default MaintenanceCard;
