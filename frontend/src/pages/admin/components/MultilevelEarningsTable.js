import React, { useMemo, useState } from 'react';
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
  MonetizationOn,
  Edit
} from '@mui/icons-material';
import { format } from 'date-fns';
import EditEarningsDialog from './EditEarningsDialog';

export default function MultilevelEarningsTable({
  earnings,
  loading,
  pagination,
  onPageChange,
  onRowsPerPageChange,
  onUpdateUserEarnings,
  isMobile
}) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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
      label: 'Level 1 Earnings',
      render: (row) => (
        <Box sx={{ minWidth: 120 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
            <Typography variant="body2" fontWeight={600} color="success.main">
              {(row.level1?.earnings || 0).toLocaleString()} RWF
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {row.level1?.count || 0} referrals
          </Typography>
        </Box>
      ),
    },
    {
      field: 'level2',
      label: 'Level 2 Earnings',
      render: (row) => (
        <Box sx={{ minWidth: 120 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <AccountBalance sx={{ fontSize: 16, color: 'info.main', mr: 0.5 }} />
            <Typography variant="body2" fontWeight={600} color="info.main">
              {(row.level2?.earnings || 0).toLocaleString()} RWF
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {row.level2?.count || 0} referrals
          </Typography>
        </Box>
      ),
    },
    {
      field: 'level3',
      label: 'Level 3 Earnings',
      render: (row) => (
        <Box sx={{ minWidth: 120 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Star sx={{ fontSize: 16, color: 'warning.main', mr: 0.5 }} />
            <Typography variant="body2" fontWeight={600} color="warning.main">
              {(row.level3?.earnings || 0).toLocaleString()} RWF
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {row.level3?.count || 0} referrals
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit earnings">
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => {
                setSelectedUser(row);
                setEditDialogOpen(true);
              }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Recalculate earnings">
            <IconButton
              onClick={() => onUpdateUserEarnings(row._id)}
              color="secondary"
              size="small"
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], [onUpdateUserEarnings]);

  // Mobile Card Component
  const MobileEarningsCard = ({ earning }) => (
    <Card sx={{ 
      mb: 1.5, 
      borderRadius: 1.5, 
      boxShadow: 1,
      overflow: 'hidden',
      width: '100%',
      maxWidth: '100%',
      mx: 0
    }}>
      <CardContent sx={{ 
        p: { xs: 0.75, sm: 1.5 }, 
        '&:last-child': { pb: { xs: 0.75, sm: 1.5 } },
        width: '100%',
        maxWidth: '100%'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          mb: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flex: 1, 
            minWidth: 0,
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Avatar sx={{ 
              mr: 1.5, 
              bgcolor: 'primary.light', 
              width: { xs: 28, sm: 32 }, 
              height: { xs: 28, sm: 32 }
            }}>
              <Person fontSize="small" />
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography 
                variant="subtitle2" 
                fontWeight={600} 
                sx={{ 
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  lineHeight: 1.2
                }}
              >
                {earning.userInfo?.fullName || 'Unknown User'}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  lineHeight: 1.2,
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {earning.userInfo?.email || 'No email'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: 0.5, 
            ml: { xs: 0, sm: 1 },
            alignSelf: { xs: 'flex-end', sm: 'auto' }
          }}>
            <IconButton
              onClick={() => {
                setSelectedUser(earning);
                setEditDialogOpen(true);
              }}
              color="primary"
              size="small"
              sx={{ p: 0.5 }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => onUpdateUserEarnings(earning._id)}
              color="secondary"
              size="small"
              sx={{ p: 0.5 }}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={0.5} sx={{ mb: 1, width: '100%' }}>
          <Grid item xs={6} sx={{ width: '50%', maxWidth: '50%' }}>
            <Box sx={{ 
              textAlign: 'center', 
              p: { xs: 0.5, sm: 1 }, 
              bgcolor: 'success.light', 
              borderRadius: 1, 
              border: '1px solid', 
              borderColor: 'success.main',
              minHeight: { xs: 50, sm: 70 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '100%'
            }}>
              <TrendingUp color="success" sx={{ fontSize: { xs: 12, sm: 16 } }} />
              <Typography 
                variant="caption" 
                display="block" 
                color="success.main" 
                fontWeight={600} 
                sx={{ 
                  mt: 0.25,
                  fontSize: { xs: '0.6rem', sm: '0.75rem' }
                }}
              >
                Level 1
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight={600} 
                color="success.dark" 
                sx={{ 
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  lineHeight: 1.1
                }}
              >
                {(earning.level1?.earnings || 0).toLocaleString()} RWF
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  fontSize: { xs: '0.6rem', sm: '0.7rem' },
                  lineHeight: 1.1
                }}
              >
                {earning.level1?.count || 0} refs
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sx={{ width: '50%', maxWidth: '50%' }}>
            <Box sx={{ 
              textAlign: 'center', 
              p: { xs: 0.5, sm: 1 }, 
              bgcolor: 'info.light', 
              borderRadius: 1, 
              border: '1px solid', 
              borderColor: 'info.main',
              minHeight: { xs: 50, sm: 70 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '100%'
            }}>
              <AccountBalance color="info" sx={{ fontSize: { xs: 12, sm: 16 } }} />
              <Typography 
                variant="caption" 
                display="block" 
                color="info.main" 
                fontWeight={600} 
                sx={{ 
                  mt: 0.25,
                  fontSize: { xs: '0.6rem', sm: '0.75rem' }
                }}
              >
                Level 2
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight={600} 
                color="info.dark" 
                sx={{ 
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  lineHeight: 1.1
                }}
              >
                {(earning.level2?.earnings || 0).toLocaleString()} RWF
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  fontSize: { xs: '0.6rem', sm: '0.7rem' },
                  lineHeight: 1.1
                }}
              >
                {earning.level2?.count || 0} refs
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={0.5} sx={{ mb: 1, width: '100%' }}>
          <Grid item xs={6} sx={{ width: '50%', maxWidth: '50%' }}>
            <Box sx={{ 
              textAlign: 'center', 
              p: { xs: 0.5, sm: 1 }, 
              bgcolor: 'warning.light', 
              borderRadius: 1, 
              border: '1px solid', 
              borderColor: 'warning.main',
              minHeight: { xs: 50, sm: 70 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '100%'
            }}>
              <Star color="warning" sx={{ fontSize: { xs: 12, sm: 16 } }} />
              <Typography 
                variant="caption" 
                display="block" 
                color="warning.main" 
                fontWeight={600} 
                sx={{ 
                  mt: 0.25,
                  fontSize: { xs: '0.6rem', sm: '0.75rem' }
                }}
              >
                Level 3
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight={600} 
                color="warning.dark" 
                sx={{ 
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  lineHeight: 1.1
                }}
              >
                {(earning.level3?.earnings || 0).toLocaleString()} RWF
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  fontSize: { xs: '0.6rem', sm: '0.7rem' },
                  lineHeight: 1.1
                }}
              >
                {earning.level3?.count || 0} refs
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sx={{ width: '50%', maxWidth: '50%' }}>
            <Box sx={{ 
              textAlign: 'center', 
              p: { xs: 0.5, sm: 1 }, 
              bgcolor: 'primary.light', 
              borderRadius: 1, 
              border: '1px solid', 
              borderColor: 'primary.main',
              minHeight: { xs: 50, sm: 70 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '100%'
            }}>
              <MonetizationOn color="primary" sx={{ fontSize: { xs: 12, sm: 16 } }} />
              <Typography 
                variant="caption" 
                display="block" 
                color="primary.main" 
                fontWeight={600} 
                sx={{ 
                  mt: 0.25,
                  fontSize: { xs: '0.6rem', sm: '0.75rem' }
                }}
              >
                Total
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight={600} 
                color="primary.dark" 
                sx={{ 
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  lineHeight: 1.1
                }}
              >
                {(earning.totalEarnings || 0).toLocaleString()} RWF
              </Typography>
            </Box>
          </Grid>
        </Grid>

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
        <Box sx={{ 
          p: { xs: 0, sm: 2 }, 
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          {earnings.map((earning) => (
            <MobileEarningsCard key={earning._id} earning={earning} />
          ))}
        </Box>
      ) : (
        // Desktop Table View
        <TableContainer sx={{ 
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: 4,
          },
        }}>
          <Table sx={{ minWidth: { xs: 600, sm: 800 } }}>
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
        onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event?.target?.value || 10, 10))}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{
          '& .MuiTablePagination-toolbar': {
            paddingLeft: 0,
            paddingRight: 0,
            flexWrap: 'wrap',
            minHeight: isMobile ? 52 : 64,
          },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontSize: isMobile ? '0.75rem' : '0.875rem',
          },
          '& .MuiTablePagination-actions': {
            marginLeft: isMobile ? 0.5 : 1,
          },
          '& .MuiIconButton-root': {
            padding: isMobile ? '4px' : '8px',
          }
        }}
      />

      {/* Edit Earnings Dialog */}
      <EditEarningsDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedUser(null);
        }}
        onSave={async (userId, earningsData) => {
          await onUpdateUserEarnings(userId, earningsData);
        }}
        user={selectedUser}
        currentEarnings={selectedUser}
      />
    </Box>
  );
}
