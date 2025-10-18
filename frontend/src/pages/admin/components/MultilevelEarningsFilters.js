import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear
} from '@mui/icons-material';

export default function MultilevelEarningsFilters({ 
  filters, 
  onFilterChange, 
  isMobile 
}) {
  const sortOptions = [
    { value: 'totalEarnings', label: 'Total Earnings' },
    { value: 'level1.earnings', label: 'Level 1 Earnings' },
    { value: 'level2.earnings', label: 'Level 2 Earnings' },
    { value: 'level3.earnings', label: 'Level 3 Earnings' },
    { value: 'lastCalculated', label: 'Last Updated' }
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'Highest First' },
    { value: 'asc', label: 'Lowest First' }
  ];

  const handleFilterChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      sortBy: 'totalEarnings',
      sortOrder: 'desc',
      minEarnings: 0,
      maxEarnings: null
    });
  };

  return (
    <Grid container spacing={2} alignItems="end">
      <Grid item xs={12}>
        <TextField
          fullWidth
          placeholder="Search by user name or email"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          size={isMobile ? "small" : "medium"}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth size={isMobile ? "small" : "medium"}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={filters.sortBy}
            label="Sort By"
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            {sortOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth size={isMobile ? "small" : "medium"}>
          <InputLabel>Order</InputLabel>
          <Select
            value={filters.sortOrder}
            label="Order"
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
          >
            {sortOrderOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="Min Earnings (RWF)"
          type="number"
          value={filters.minEarnings}
          onChange={(e) => handleFilterChange('minEarnings', parseInt(e.target.value) || 0)}
          size={isMobile ? "small" : "medium"}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="Max Earnings (RWF)"
          type="number"
          value={filters.maxEarnings || ''}
          onChange={(e) => handleFilterChange('maxEarnings', e.target.value ? parseInt(e.target.value) : null)}
          size={isMobile ? "small" : "medium"}
        />
      </Grid>
      
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={clearFilters}
            size={isMobile ? "small" : "medium"}
          >
            Clear Filters
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}
