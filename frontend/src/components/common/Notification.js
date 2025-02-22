import { useState, forwardRef, useImperativeHandle } from 'react';
import { Snackbar, Alert } from '@mui/material';

const Notification = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  useImperativeHandle(ref, () => ({
    show: (msg, sev = 'success') => {
      setMessage(msg);
      setSeverity(sev);
      setOpen(true);
    }
  }));

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
});

Notification.displayName = 'Notification';

export default Notification; 