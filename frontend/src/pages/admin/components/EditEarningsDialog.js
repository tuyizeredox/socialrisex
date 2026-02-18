import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { MonetizationOn } from '@mui/icons-material';

export default function EditEarningsDialog({ 
  open, 
  onClose, 
  onSave, 
  user, 
  currentEarnings 
}) {
  const [formData, setFormData] = useState({
    level1Earnings: 0,
    level2Earnings: 0,
    level3Earnings: 0,
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data when dialog opens
  React.useEffect(() => {
    if (open && currentEarnings) {
      setFormData({
        level1Earnings: currentEarnings.level1?.earnings || 0,
        level2Earnings: currentEarnings.level2?.earnings || 0,
        level3Earnings: currentEarnings.level3?.earnings || 0,
        reason: ''
      });
      setError('');
    }
  }, [open, currentEarnings]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field.includes('Earnings') ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSave = async () => {
    // Validation
    if (formData.level1Earnings < 0 || formData.level2Earnings < 0 || formData.level3Earnings < 0) {
      setError('Earnings cannot be negative');
      return;
    }

    if (!formData.reason.trim()) {
      setError('Please provide a reason for this change');
      return;
    }

    setLoading(true);
    try {
      await onSave(user._id, formData);
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to update earnings');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return formData.level1Earnings + formData.level2Earnings + formData.level3Earnings;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MonetizationOn color="primary" />
          <Typography variant="h6">
            Edit Earnings - {user?.userInfo?.fullName || 'Unknown User'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              User Information
            </Typography>
            <Typography variant="body2">
              <strong>Name:</strong> {user?.userInfo?.fullName || 'Unknown'}<br />
              <strong>Email:</strong> {user?.userInfo?.email || 'No email'}<br />
              <strong>Current Total:</strong> {(currentEarnings?.totalEarnings || 0).toLocaleString()} RWF
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Level 1 Earnings (RWF)"
              type="number"
              value={formData.level1Earnings}
              onChange={handleChange('level1Earnings')}
              inputProps={{ min: 0, step: 100 }}
              helperText="4000 RWF per active referral"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Level 2 Earnings (RWF)"
              type="number"
              value={formData.level2Earnings}
              onChange={handleChange('level2Earnings')}
              inputProps={{ min: 0, step: 100 }}
              helperText="1100 RWF per active referral"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Level 3 Earnings (RWF)"
              type="number"
              value={formData.level3Earnings}
              onChange={handleChange('level3Earnings')}
              inputProps={{ min: 0, step: 100 }}
              helperText="700 RWF per active referral"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'primary.light', 
              borderRadius: 1,
              textAlign: 'center'
            }}>
              <Typography variant="h6" color="primary.contrastText">
                New Total: {calculateTotal().toLocaleString()} RWF
              </Typography>
              <Typography variant="body2" color="primary.contrastText">
                Change: {(calculateTotal() - (currentEarnings?.totalEarnings || 0)).toLocaleString()} RWF
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Reason for Change"
              multiline
              rows={3}
              value={formData.reason}
              onChange={handleChange('reason')}
              placeholder="Please explain why you're making this change..."
              required
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
