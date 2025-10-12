import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  CircularProgress,
  Box
} from '@mui/material';

const DataTable = ({
  columns,
  data = [],
  loading = false,
  pagination,
  onPageChange,
  onRowsPerPageChange
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!Array.isArray(data)) {
    console.error('Data must be an array:', data);
    return null;
  }

  return (
    <Paper>
      <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || 'left'}
                  style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={row._id || index}>
                {columns.map((column) => (
                  <TableCell key={column.field} align={column.align || 'left'} sx={{ whiteSpace: 'nowrap' }}>
                    {column.render ? column.render(row) : row[column.field]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page}
          onPageChange={onPageChange}
          rowsPerPage={pagination.limit}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </Paper>
  );
};

export default DataTable; 