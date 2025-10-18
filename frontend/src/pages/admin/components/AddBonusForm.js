import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNotification } from '../../../context/NotificationContext';
import api from '../../../utils/api';

export default function AddBonusForm({ onBonusAdded }) {
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    description: '',
    type: 'admin_bonus',
    notes: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const query = searchQuery.toLowerCase().trim();
      const filtered = users.filter(user => 
        (user.fullName && user.fullName.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.mobileNumber && user.mobileNumber.includes(query))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await api.get('/admin/users?limit=1000');
      const usersData = response.data.users || [];
      setUsers(usersData);
      console.log(`Loaded ${usersData.length} users for bonus assignment`);
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Failed to fetch users. Please refresh the page.', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setFormData(prev => ({
      ...prev,
      userId: user._id
    }));
    setSearchQuery(user.fullName);
    setFilteredUsers([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate required fields
    if (!formData.userId || !formData.amount || !formData.description) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    // Validate amount
    const amount = parseInt(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showNotification('Amount must be a valid number greater than 0', 'error');
      return;
    }

    // Validate description length
    if (formData.description.trim().length < 5) {
      showNotification('Description must be at least 5 characters long', 'error');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare the data to send
      const bonusData = {
        userId: formData.userId,
        amount: amount,
        description: formData.description.trim(),
        type: formData.type,
        notes: formData.notes.trim()
      };

      console.log('Submitting bonus data:', bonusData);
      
      const response = await api.post('/admin/bonus-transactions', bonusData);
      
      showNotification(response.data.message, 'success');
      
      // Reset form
      setFormData({
        userId: '',
        amount: '',
        description: '',
        type: 'admin_bonus',
        notes: ''
      });
      setSelectedUser(null);
      setSearchQuery('');
      
      // Notify parent component
      if (onBonusAdded) {
        onBonusAdded(response.data.data);
      }
      
      // Show success message with details
      setTimeout(() => {
        showNotification(
          `Bonus of RWF ${amount.toLocaleString()} successfully added to ${selectedUser?.fullName}!`, 
          'success'
        );
      }, 1000);
    } catch (error) {
      console.error('Error adding bonus:', error);
      const message = error.response?.data?.message || 'Failed to add bonus';
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const bonusTypes = [
    { value: 'admin_bonus', label: 'Admin Bonus', color: 'primary' },
    { value: 'referral_bonus', label: 'Referral Bonus', color: 'success' },
    { value: 'special_promotion', label: 'Special Promotion', color: 'warning' }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Add Bonus to User
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* User Search */}
            <Grid item xs={12}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  label="Search User"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or mobile number..."
                  disabled={usersLoading}
                  InputProps={{
                    startAdornment: usersLoading ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : (
                      <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    )
                  }}
                  helperText={usersLoading ? 'Loading users...' : `Search from ${users.length} users`}
                />
                
                {/* User Dropdown */}
                {filteredUsers.length > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      bgcolor: 'background.paper',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      maxHeight: 200,
                      overflow: 'auto',
                      mt: 0.5
                    }}
                  >
                    {filteredUsers.map((user) => (
                      <Box
                        key={user._id}
                        onClick={() => handleUserSelect(user)}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          borderBottom: 1,
                          borderColor: 'divider'
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight="bold">
                          {user.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email} • {user.mobileNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user._id}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
              
              {selectedUser && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="success.contrastText">
                    <strong>Selected User:</strong> {selectedUser.fullName} ({selectedUser.email})
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Amount */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bonus Amount (RWF)"
                type="number"
                value={formData.amount}
                onChange={handleInputChange('amount')}
                required
                inputProps={{ min: 1, step: 1 }}
                helperText="Enter the bonus amount in RWF (minimum 1 RWF)"
                error={formData.amount && parseInt(formData.amount) <= 0}
              />
            </Grid>

            {/* Bonus Type */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Bonus Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={handleInputChange('type')}
                  label="Bonus Type"
                >
                  {bonusTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Chip
                        label={type.label}
                        size="small"
                        color={type.color}
                        sx={{ mr: 1 }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleInputChange('description')}
                required
                multiline
                rows={2}
                helperText="Describe the reason for this bonus (minimum 5 characters)"
                error={formData.description && formData.description.trim().length < 5}
              />
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                value={formData.notes}
                onChange={handleInputChange('notes')}
                multiline
                rows={2}
                helperText="Additional notes for this bonus transaction"
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
                disabled={loading || !selectedUser || usersLoading}
                fullWidth
                size="large"
                sx={{ py: 1.5 }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Adding Bonus...
                  </>
                ) : (
                  'Add Bonus'
                )}
              </Button>
            </Grid>
            
          </Grid>
        </Box>

        {selectedUser && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> This bonus will be added to the user's total earnings and can be withdrawn. 
              The bonus will be treated as referral earnings for withdrawal purposes.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Selected User:</strong> {selectedUser.fullName} ({selectedUser.email}) - 
              Current Bonus Earnings: RWF {(selectedUser.bonusEarnings || 0).toLocaleString()}
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
