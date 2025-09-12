import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Alert
} from '@mui/material';
import {
  Visibility,
  Search,
  CheckCircle,
  Cancel,
  PersonAdd,
  People,
  Delete,
  Edit,
} from '@mui/icons-material';
import api from '../../utils/api';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import { useNotification } from '../../context/NotificationContext';
import useDebounce from '../../hooks/useDebounce';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 0, limit: 10, total: 0 });
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    role: 'user',
    isActive: false,
    isVerified: false,
    points: 0,
    earnings: 0
  });
  const [editLoading, setEditLoading] = useState(false);

  const { showNotification } = useNotification();
  const debouncedSearch = useDebounce(search, 500);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: debouncedSearch,
        },
      });

      if (response.data && response.data.users) {
        const usersWithEarnings = response.data.users.map((user) => ({
          ...user,
          // Note: earnings should come from backend multilevel calculation
          // Keep old calculation as fallback until backend provides actual earnings
          earnings: user.totalEarnings || (user.referralCount || 0) * 4000, // Level 1 rate as fallback
        }));
        setUsers(usersWithEarnings);
        setPagination({
          page: page,
          limit: rowsPerPage,
          total: response.data.pagination.total,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to fetch users', 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, debouncedSearch]);

  const handlePageChange = (event, newPage) => setPage(newPage);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(0);
  };

  const handleUpdateUserStatus = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}`, { isActive });
      showNotification('User status updated successfully', 'success');
      fetchUsers();
    } catch (error) {
      showNotification(error.message || 'Failed to update user status', 'error');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.delete(`/admin/users/${userToDelete._id}`);
      showNotification('User deleted successfully', 'success');
      fetchUsers();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      showNotification(error.message || 'Failed to delete user', 'error');
    }
  };

  const openDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const openEditDialog = (user) => {
    setUserToEdit(user);
    setEditForm({
      fullName: user.fullName || '',
      email: user.email || '',
      mobileNumber: user.mobileNumber || '',
      role: user.role || 'user',
      isActive: user.isActive || false,
      isVerified: user.isVerified || false,
      points: user.points || 0,
      earnings: user.earnings || 0
    });
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setUserToEdit(null);
    setEditForm({
      fullName: '',
      email: '',
      mobileNumber: '',
      role: 'user',
      isActive: false,
      isVerified: false,
      points: 0,
      earnings: 0
    });
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateUser = async () => {
    if (!userToEdit) return;
    
    try {
      setEditLoading(true);
      await api.put(`/admin/users/${userToEdit._id}`, editForm);
      showNotification('User updated successfully', 'success');
      fetchUsers();
      closeEditDialog();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to update user', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const columns = [
    {
      field: 'fullName',
      label: 'Name',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography fontWeight={600}>{row.fullName}</Typography>
          {row.role === 'admin' && (
            <Chip
              size="small"
              label="👨‍💼 Admin"
              sx={{ 
                ml: 1, 
                background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                color: 'white',
                fontWeight: 700,
                '& .MuiChip-label': {
                  fontSize: '0.75rem'
                }
              }}
            />
          )}
        </Box>
      ),
    },
    { field: 'email', label: 'Email' },
    {
      field: 'role',
      label: 'Role',
      render: (row) => (
        <Chip
          label={row.role === 'admin' ? '👨‍💼 Admin' : '👤 User'}
          color={row.role === 'admin' ? 'primary' : 'default'}
          variant={row.role === 'admin' ? 'filled' : 'outlined'}
          size="small"
          sx={{
            fontWeight: 600,
            ...(row.role === 'admin' && {
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              color: 'white'
            })
          }}
        />
      ),
    },
    {
      field: 'isActive',
      label: 'Status',
      render: (row) => (
        <Chip
          icon={row.isActive ? <CheckCircle /> : <Cancel />}
          label={row.isActive ? 'Active' : 'Pending'}
          color={row.isActive ? 'success' : 'warning'}
          variant="outlined"
          onClick={() => handleUpdateUserStatus(row._id, !row.isActive)}
          sx={{ cursor: 'pointer', '&:hover': { bgcolor: row.isActive ? '#e8f5e9' : '#fff3e0' } }}
        />
      ),
    },
    {
      field: 'referralCount',
      label: 'Referrals',
      render: (row) => (
        <Chip
          label={row.referralCount || 0}
          color="primary"
          variant="outlined"
          size="small"
          sx={{ borderRadius: 1 }}
        />
      ),
    },
    {
      field: 'earnings',
      label: 'Earnings',
      render: (row) => (
        <Typography sx={{ fontWeight: 500, color: 'success.main' }}>
          RWF {row.earnings || 0}
        </Typography>
      ),
    },
    {
      field: 'referralCode',
      label: 'Referral Code',
      render: (row) => (
        <Chip
          label={row.referralCode}
          variant="outlined"
          size="small"
          onClick={() => {
            navigator.clipboard.writeText(row.referralCode);
            showNotification('Referral code copied to clipboard', 'success');
          }}
          sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'grey.100' } }}
        />
      ),
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (row) => (
        <Box>
          <Tooltip title="Edit User">
            <IconButton
              onClick={() => openEditDialog(row)}
              sx={{ 
                color: 'primary.main',
                '&:hover': { 
                  bgcolor: 'primary.light',
                  color: 'white'
                }
              }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton
              onClick={() => openDeleteDialog(row)}
              sx={{ 
                color: 'error.main',
                '&:hover': { 
                  bgcolor: 'error.light',
                  color: 'white'
                }
              }}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="User Management"
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin' },
          { label: 'Users', path: '/admin/users' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              '&:hover': { background: 'linear-gradient(45deg, #1565c0, #2196f3)' },
            }}
            onClick={() => {/* Handle add user */}}
          >
            Add User
          </Button>
        }
      />

      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
          bgcolor: 'background.paper',
          mt: 3,
        }}
      >
        <Box mb={3}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'grey.500' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': { borderColor: 'primary.main' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
              },
            }}
          />
        </Box>

        {users.length === 0 && !loading ? (
          <EmptyState
            icon={People}
            title="No Users Found"
            description={
              search ? 'No users match your search criteria' : 'There are no users registered yet'
            }
          />
        ) : (
          <Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {columns.map((col) => (
                      <TableCell
                        key={col.field}
                        sx={{ fontWeight: 'bold', color: 'text.primary', bgcolor: 'grey.100' }}
                      >
                        {col.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((row) => (
                      <TableRow
                        key={row._id}
                        sx={{
                          '&:hover': { bgcolor: 'grey.50', transition: 'background 0.2s' },
                        }}
                      >
                        {columns.map((col) => (
                          <TableCell key={col.field}>
                            {col.render ? col.render(row) : row[col.field]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={pagination.total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              sx={{ mt: 2 }}
            />
          </Box>
        )}
      </Paper>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={closeEditDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          } 
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white',
          borderRadius: '12px 12px 0 0',
          py: 3
        }}>
          <Typography variant="h5" fontWeight={700}>
            ✏️ Edit User - {userToEdit?.fullName}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 3, p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={editForm.fullName}
                onChange={(e) => handleEditFormChange('fullName', e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={editForm.email}
                onChange={(e) => handleEditFormChange('email', e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                value={editForm.mobileNumber}
                onChange={(e) => handleEditFormChange('mobileNumber', e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Role</InputLabel>
                <Select
                  value={editForm.role}
                  onChange={(e) => handleEditFormChange('role', e.target.value)}
                  label="Role"
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="user">
                    👤 User
                  </MenuItem>
                  <MenuItem value="admin">
                    👨‍💼 Admin
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Points"
                type="number"
                value={editForm.points}
                onChange={(e) => handleEditFormChange('points', parseInt(e.target.value) || 0)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Earnings (RWF)"
                type="number"
                value={editForm.earnings}
                onChange={(e) => handleEditFormChange('earnings', parseInt(e.target.value) || 0)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.isActive}
                    onChange={(e) => handleEditFormChange('isActive', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>
                      Account Status
                    </Typography>
                    <Chip
                      label={editForm.isActive ? 'Active' : 'Inactive'}
                      color={editForm.isActive ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.isVerified}
                    onChange={(e) => handleEditFormChange('isVerified', e.target.checked)}
                    color="secondary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>
                      Verification Status
                    </Typography>
                    <Chip
                      label={editForm.isVerified ? 'Verified' : 'Unverified'}
                      color={editForm.isVerified ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                }
              />
            </Grid>
            {editForm.role === 'admin' && (
              <Grid item xs={12}>
                <Alert 
                  severity="warning" 
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiAlert-message': { fontWeight: 600 }
                  }}
                >
                  ⚠️ You are granting admin privileges to this user. They will have full access to the admin panel.
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={closeEditDialog} 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 600,
              borderRadius: 2,
              px: 3
            }}
            disabled={editLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateUser}
            variant="contained"
            disabled={editLoading}
            sx={{ 
              background: 'linear-gradient(45deg, #4CAF50 0%, #45a049 100%)',
              borderRadius: 2,
              fontWeight: 600,
              px: 4,
              '&:hover': {
                background: 'linear-gradient(45deg, #45a049 0%, #388e3c 100%)',
              }
            }}
          >
            {editLoading ? <CircularProgress size={20} color="inherit" /> : '💾 Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ bgcolor: 'error.light', color: 'white' }}>
          Delete User
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText>
            Are you sure you want to delete {userToDelete?.fullName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
