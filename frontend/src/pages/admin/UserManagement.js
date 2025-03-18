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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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
          earnings: (user.referralCount || 0) * 2800, // 2800 RWF per active referral
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

  const columns = [
    {
      field: 'fullName',
      label: 'Name',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography>{row.fullName}</Typography>
          {row.role === 'admin' && (
            <Chip
              size="small"
              label="Admin"
              color="primary"
              sx={{ ml: 1, bgcolor: 'primary.light', color: 'white' }}
            />
          )}
        </Box>
      ),
    },
    { field: 'email', label: 'Email' },
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
          RWF {(row.referralCount || 0) * 2800}
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
              onClick={() => {/* Add edit logic here */}}
              sx={{ color: 'primary.main' }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton
              onClick={() => openDeleteDialog(row)}
              sx={{ color: 'error.main' }}
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
