import React, { useMemo } from 'react';
import {
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
  Box,
  Typography,
  Avatar,
  Tooltip,
  Button,
  Card,
  CardContent,
  Grid,
  Stack
} from '@mui/material';
import {
  Person,
  Refresh,
  TrendingUp,
  AccountBalance,
  Star,
  MonetizationOn
} from '@mui/icons-material';
import { format } from 'date-fns';

export default function MultilevelEarningsTable({
  earnings,
  loading,
  pagination,
  onPageChange,
  onRowsPerPageChange,
  onUpdateUserEarnings,
  isMobile
}) {
  const columns = useMemo(() => [
    {
      field: 'user',
      label: 'User',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 200 }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
            <Person />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.userInfo?.fullName || 'Unknown User'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.userInfo?.email || 'No email'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'level1',
      label: 'Level 1',
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {row.level1?.count || 0} users
          </Typography>
          <Typography variant="caption" color="success.main">
            {row.level1?.earnings?.toLocaleString() || 0} RWF
          </Typography>
        </Box>
      ),
    },
    {
      field: 'level2',
      label: 'Level 2',
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {row.level2?.count || 0} users
          </Typography>
          <Typography variant="caption" color="info.main">
            {row.level2?.earnings?.toLocaleString() || 0} RWF
          </Typography>
        </Box>
      ),
    },
    {
      field: 'level3',
      label: 'Level 3',
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {row.level3?.count || 0} users
          </Typography>
          <Typography variant="caption" color="warning.main">
            {row.level3?.earnings?.toLocaleString() || 0} RWF
          </Typography>
        </Box>
      ),
    },
    {
      field: 'totalEarnings',
      label: 'Total Earnings',
      render: (row) => (
        <Box>
          <Typography variant="h6" fontWeight={600} color="primary.main">
            {row.totalEarnings?.toLocaleString() || 0} RWF
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Last updated: {format(new Date(row.lastCalculated), 'MMM dd, yyyy')}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (row) => (
        <Tooltip title="Update Earnings">
          <IconButton
            onClick={() => onUpdateUserEarnings(row.user)}
            color="primary"
            size="small"
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      ),
    },
  ], [onUpdateUserEarnings]);

  // Mobile Card Component
  const MobileEarningsCard = ({ earning }) => (
    <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
              <Person />
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight={600}>
                {earning.userInfo?.fullName || 'Unknown User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {earning.userInfo?.email || 'No email'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => onUpdateUserEarnings(earning.user)}
            color="primary"
            size="small"
          >
            <Refresh />
          </IconButton>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
              <TrendingUp color="success" />
              <Typography variant="body2" fontWeight={600}>
                Level 1
              </Typography>
              <Typography variant="caption">
                {earning.level1?.count || 0} users
              </Typography>
              <Typography variant="body2" color="success.main">
                {earning.level1?.earnings?.toLocaleString() || 0} RWF
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
              <AccountBalance color="info" />
              <Typography variant="body2" fontWeight={600}>
                Level 2
              </Typography>
              <Typography variant="caption">
                {earning.level2?.count || 0} users
              </Typography>
              <Typography variant="body2" color="info.main">
                {earning.level2?.earnings?.toLocaleString() || 0} RWF
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1, mb: 2 }}>
          <MonetizationOn color="primary" />
          <Typography variant="h6" fontWeight={600} color="primary.main">
            {earning.totalEarnings?.toLocaleString() || 0} RWF
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total Earnings
          </Typography>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
          Last updated: {format(new Date(earning.lastCalculated), 'MMM dd, yyyy HH:mm')}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (earnings.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 6 }}>
        <MonetizationOn sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No multilevel earnings found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your filters or search criteria
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {isMobile ? (
        // Mobile Card View
        <Box sx={{ p: 2 }}>
          {earnings.map((earning) => (
            <MobileEarningsCard key={earning._id} earning={earning} />
          ))}
        </Box>
      ) : (
        // Desktop Table View
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.field} sx={{ fontWeight: 600 }}>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {earnings.map((row) => (
                <TableRow key={row._id} hover>
                  {columns.map((column) => (
                    <TableCell key={column.field}>
                      {column.render ? column.render(row) : row[column.field]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <TablePagination
        component="div"
        count={pagination.total}
        page={pagination.page}
        onPageChange={(event, newPage) => onPageChange(newPage)}
        rowsPerPage={pagination.limit}
        onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        sx={{
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontSize: isMobile ? '0.75rem' : '0.875rem',
          }
        }}
      />
    </Box>
  );
}
