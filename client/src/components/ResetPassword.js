import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Alert, Stack, CircularProgress } from '@mui/material';
import AuthLayout from './auth/AuthLayout';
import PasswordField from './auth/PasswordField';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('error');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const token = query.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setSeverity('error');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
        token,
        newPassword,
      });
      setMessage(res.data.message);
      setSeverity('success');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error resetting password');
      setSeverity('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="Please enter your new password below">
      <Stack component="form" onSubmit={handleSubmit} spacing={0}>
        <PasswordField
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <PasswordField
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {message && (
          <Alert severity={severity} sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
          sx={{ mt: 3 }}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </Stack>
    </AuthLayout>
  );
};

export default ResetPassword;
