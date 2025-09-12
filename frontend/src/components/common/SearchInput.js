import React from 'react';
import {
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

const SearchInput = ({ 
  value, 
  onChange, 
  onClear, 
  placeholder = 'Search...', 
  fullWidth = true 
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange('');
    if (onClear) onClear();
  };

  return (
    <TextField
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      fullWidth={fullWidth}
      variant="outlined"
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear}>
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ) : null
      }}
    />
  );
};

export default SearchInput; 