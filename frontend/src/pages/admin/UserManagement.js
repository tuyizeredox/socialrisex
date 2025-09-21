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
  Alert,
  Card,
  CardContent,
  Avatar,
  useMediaQuery,
  useTheme
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
  FilterList,
  Download,
  Upload
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
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const renderUserCard = (user) => (
    <Card
      key={user._id}
      sx={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(247,247,247,0.9) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        border: '1px solid rgba(255,255,255,0.2)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: user.isActive 
            ? 'linear-gradient(90deg, #4CAF50, #81C784)'
            : 'linear-gradient(90deg, #f44336, #ef5350)',
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 60,
              height: 60,
              bgcolor: user.isActive ? 'primary.main' : 'grey.400',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            {user.fullName?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" fontWeight="bold" noWrap>
                {user.fullName}
              </Typography>
              {user.role === 'admin' && (
                <Chip
                  size="small"
                  label="👨‍💼 Admin"
                  sx={{
                    background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.7rem'
                  }}
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.mobileNumber}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Chip
              label={user.isActive ? "🟢 Active" : "🔴 Inactive"}
              size="small"
              sx={{
                bgcolor: user.isActive ? 'success.light' : 'error.light',
                color: user.isActive ? 'success.contrastText' : 'error.contrastText',
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }}
            />
            <Chip
              label={user.isVerified ? "✅ Verified" : "⏳ Pending"}
              size="small"
              sx={{
                bgcolor: user.isVerified ? 'info.light' : 'warning.light',
                color: user.isVerified ? 'info.contrastText' : 'warning.contrastText',
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              {user.points?.toLocaleString() || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Points Earned
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight="bold" color="success.main">
              RWF {user.earnings?.toLocaleString() || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Earnings
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight="bold" color="info.main">
              {user.referralCount || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Referrals
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              sx={{
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.main' }
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit User">
            <IconButton
              size="small"
              onClick={() => openEditDialog(user)}
              sx={{
                bgcolor: 'warning.light',
                color: 'warning.contrastText',
                '&:hover': { bgcolor: 'warning.main' }
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton
              size="small"
              onClick={() => openDeleteDialog(user)}
              sx={{
                bgcolor: 'error.light',
                color: 'error.contrastText',
                '&:hover': { bgcolor: 'error.main' }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {user.referralCode && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Referral Code:
            </Typography>
            <Chip
              label={user.referralCode}
              variant="outlined"
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(user.referralCode);
                showNotification('Referral code copied!', 'success');
              }}
              sx={{
                ml: 1,
                cursor: 'pointer',
                fontSize: '0.7rem',
                '&:hover': { bgcolor: 'primary.light', color: 'primary.contrastText' }
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 4 } }}>
      {/* Modern Header */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: { xs: 3, sm: 4 },
          p: { xs: 3, sm: 4 },
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
            mb: 2
          }}>
            <Box>
              <Typography 
                variant="h3" 
                fontWeight={800} 
                gutterBottom
                sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' } }}
              >
                👥 Community Management
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                {users.length} brave adventurers in the quest
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'flex-end' }
            }}>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => {/* Handle add user */}}
              >
                Invite New Hero
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  '&:hover': { 
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Export
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Search and Controls */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(247,247,247,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          p: { xs: 2, sm: 3 },
          mb: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="🔍 Search heroes by name, email, or referral code..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.8)',
                  '&:hover fieldset': { borderColor: 'primary.main' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'center', md: 'flex-end' } }}>
              <Button
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('table')}
                size="small"
                sx={{ minWidth: 'auto', px: 2 }}
              >
                📋 Table
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('cards')}
                size="small"
                sx={{ minWidth: 'auto', px: 2 }}
              >
                🎴 Cards
              </Button>
              <IconButton
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.main' }
                }}
              >
                <FilterList />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Content Area */}
      {users.length === 0 && !loading ? (
        <Paper
          sx={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(247,247,247,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            p: 4,
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.light',
                fontSize: '2rem'
              }}
            >
              👥
            </Avatar>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              No Heroes Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
              {search 
                ? 'No heroes match your search criteria. Try adjusting your search terms.'
                : 'The adventure hasn\'t begun yet! Invite your first heroes to join the quest.'
              }
            </Typography>
            {!search && (
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                size="large"
                sx={{
                  mt: 2,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  '&:hover': { 
                    background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Invite First Hero
              </Button>
            )}
          </Box>
        </Paper>
      ) : (
        <Box>
          {/* Loading State */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <>
              {/* Cards View for Mobile or when selected */}
              {(isMobile || viewMode === 'cards') && (
                <Grid container spacing={3}>
                  {users.map((user) => (
                    <Grid item xs={12} sm={6} lg={4} key={user._id}>
                      {renderUserCard(user)}
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Table View for Desktop */}
              {!isMobile && viewMode === 'table' && (
                <Paper
                  sx={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(247,247,247,0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                          {columns.map((col) => (
                            <TableCell
                              key={col.field}
                              sx={{ 
                                fontWeight: 'bold', 
                                color: 'white',
                                fontSize: '0.9rem'
                              }}
                            >
                              {col.label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((row, index) => (
                          <TableRow
                            key={row._id}
                            sx={{
                              bgcolor: index % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.04)',
                              '&:hover': { 
                                bgcolor: 'primary.light',
                                '& .MuiTableCell-root': { color: 'primary.contrastText' },
                                transform: 'scale(1.01)',
                                transition: 'all 0.2s ease'
                              }
                            }}
                          >
                            {columns.map((col) => (
                              <TableCell 
                                key={col.field}
                                sx={{ fontSize: '0.85rem' }}
                              >
                                {col.render ? col.render(row) : row[col.field]}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}

              {/* Pagination */}
              <Paper
                sx={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(247,247,247,0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  mt: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={pagination.total}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  sx={{ 
                    '& .MuiTablePagination-toolbar': { px: 3 },
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      fontSize: '0.9rem',
                      fontWeight: 500
                    }
                  }}
                />
              </Paper>
            </>
          )}
        </Box>
      )}

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
