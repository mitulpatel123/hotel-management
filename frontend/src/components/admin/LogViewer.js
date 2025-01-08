import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import {
  Create as CreateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const actionIcons = {
  create: <CreateIcon fontSize="small" />,
  update: <EditIcon fontSize="small" />,
  delete: <DeleteIcon fontSize="small" />
};

const actionColors = {
  create: 'success',
  update: 'info',
  delete: 'error'
};

const LogViewer = ({ logs, onFilterChange, stats }) => {
  const [filters, setFilters] = useState({
    type: '',
    user: '',
    startDate: '',
    endDate: ''
  });

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Box>
      {stats?.userStats && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Most Active Users
            </Typography>
            <Grid container spacing={2}>
              {stats.userStats.map((stat) => (
                <Grid item xs={12} sm={6} md={4} key={stat._id}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon color="primary" />
                    <Typography>
                      {stat.username}: {stat.count} actions
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Activity Logs
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Action Type</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                label="Action Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="create">Create</MenuItem>
                <MenuItem value="update">Update</MenuItem>
                <MenuItem value="delete">Delete</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="User"
              value={filters.user}
              onChange={(e) => handleFilterChange('user', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Item Type</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {actionIcons[log.action]}
                      <Chip
                        label={log.action.toUpperCase()}
                        size="small"
                        color={actionColors[log.action]}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.itemType.toUpperCase()}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{log.details}</TableCell>
                  <TableCell>{log.performedBy?.username || 'Unknown'}</TableCell>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No logs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default LogViewer;
