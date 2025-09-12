import { Box, Typography, TextField } from '@mui/material';

export default function FormField({
  label,
  error,
  required,
  helperText,
  children,
  ...props
}) {
  return (
    <Box mb={2}>
      {label && (
        <Typography
          variant="subtitle2"
          color="text.secondary"
          gutterBottom
          sx={{ ml: 0.5 }}
        >
          {label}
          {required && (
            <Typography component="span" color="error.main">
              *
            </Typography>
          )}
        </Typography>
      )}
      {children || (
        <TextField
          fullWidth
          variant="outlined"
          error={!!error}
          helperText={error || helperText}
          required={required}
          {...props}
        />
      )}
    </Box>
  );
} 