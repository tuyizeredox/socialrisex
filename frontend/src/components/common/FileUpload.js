import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  IconButton
} from '@mui/material';
import {
  CloudUpload,
  Clear,
  InsertDriveFile
} from '@mui/icons-material';

export default function FileUpload({
  accept,
  maxSize = 5242880, // 5MB
  onFileSelect,
  label = 'Upload File',
  helperText = 'Drag and drop a file here or click to select'
}) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    if (file.size > maxSize) {
      return `File size must be less than ${maxSize / 1024 / 1024}MB`;
    }
    if (accept && !accept.split(',').some(type => file.type.match(type.trim()))) {
      return 'File type not supported';
    }
    return '';
  };

  const handleFile = (file) => {
    const error = validateFile(file);
    if (error) {
      setError(error);
      return;
    }
    setError('');
    setFile(file);
    onFileSelect?.(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError('');
    onFileSelect?.(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <Box
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'divider',
          borderRadius: 1,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: dragActive ? 'action.hover' : 'background.paper',
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
        onClick={() => inputRef.current?.click()}
      >
        {file ? (
          <Box display="flex" alignItems="center" justifyContent="center">
            <InsertDriveFile sx={{ mr: 1 }} />
            <Typography>{file.name}</Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              sx={{ ml: 1 }}
            >
              <Clear />
            </IconButton>
          </Box>
        ) : (
          <>
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              {label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {helperText}
            </Typography>
          </>
        )}
      </Box>
      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
} 