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
  Button
} from '@mui/material';
import {
  Visibility,
  Search,
  CheckCircle,
  Cancel,
  PersonAdd,
  People
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
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0
  });

  const { showNotification } = useNotification();
  const debouncedSearch = useDebounce(search, 500);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: debouncedSearch
        }
      });
      
      if (response.data && response.data.users) {
        // Calculate earnings for each user based on their active referrals
        const usersWithEarnings = response.data.users.map(user => ({
          ...user,
          earnings: (user.referralCount || 0) * 2800 // 2800 RWF per active referral
        }));

        setUsers(usersWithEarnings);
        setPagination({
          page: page,
          limit: rowsPerPage,
          total: response.data.pagination.total
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

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

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

  const columns = [
    { 
      field: 'fullName', 
      label: 'Name',
      render: (row) => (
        <Box>
          {row.fullName}
          {row.role === 'admin' && (
            <Chip
              size="small"
              label="Admin"
              color="primary"
              style={{ marginLeft: 8 }}
            />
          )}
        </Box>
      )
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
          style={{ cursor: 'pointer' }}
        />
      )
    },
    {
      field: 'referralCount',
      label: 'Active Referrals',
      render: (row) => (
        <Chip
          label={row.referralCount || 0}
          color="primary"
          variant="outlined"
          size="small"
          title={`${row.fullName}'s active referrals`}
        />
      )
    },
    { 
      field: 'earnings', 
      label: 'Earnings',
      render: (row) => {
        // Calculate earnings based on active referrals
        const referralEarnings = (row.referralCount || 0) * 2800;
        return `RWF ${referralEarnings.toLocaleString()}`;
      }
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
          style={{ cursor: 'pointer' }}
        />
      )
    }
  ];

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="User Management"
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin' },
          { label: 'Users', path: '/admin/users' }
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => {/* Handle add user */}}
          >
            Add User
          </Button>
        }
      />

      <Box mb={3}>
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Search users by name or email..."
        />
      </Box>

      {users.length === 0 && !loading ? (
        <EmptyState
          icon={People}
          title="No Users Found"
          description={
            search 
              ? "No users match your search criteria"
              : "There are no users registered yet"
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}
    </Container>
  );
} 