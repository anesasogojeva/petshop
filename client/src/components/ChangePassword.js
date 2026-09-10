import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Alert, Stack, CircularProgress } from '@mui/material';
import AuthLayout from './auth/AuthLayout';
import PasswordField from './auth/PasswordField';
import PasswordStrengthHint from './shared/PasswordStrengthHint';

const hasUppercase = /[A-Z]/;
const hasNumber = /\d/;
const hasSpecialChar = /[!@#$%^&*()_\-+=[\]{};:'",<.>/?\\|`~]/;

const ChangePasswordPage = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [changeData, setChangeData] = useState({ currentPassword: '', newPassword: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, loginData);
      localStorage.setItem('accessToken', res.data.accessToken);
      setIsAuthenticated(true);
    } catch (err) {
      setMessage('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    const password = changeData.newPassword;

    if (
      password.length < 6 ||
      !hasUppercase.test(password) ||
      !hasNumber.test(password) ||
      !hasSpecialChar.test(password)
    ) {
      setMessage('Password must be at least 6 characters and include an uppercase letter, a number, and a special character.');
      return;
    }

    const token = localStorage.getItem('accessToken');
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/change-password`,
        changeData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Password change failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={isAuthenticated ? 'Change your password' : 'Confirm your identity'}
      subtitle={
        isAuthenticated
          ? 'Choose a new password for your account'
          : 'Secure your account by updating your password regularly'
      }
      footer={
        <Button type="button" variant="text" size="small" onClick={() => navigate('/login')}>
          Back to Log In
        </Button>
      }
    >
      {!isAuthenticated ? (
        <Stack component="form" onSubmit={handleLogin} spacing={0}>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={loginData.email}
            onChange={handleLoginChange}
            required
          />
          <PasswordField
            name="password"
            value={loginData.password}
            onChange={handleLoginChange}
            required
          />

          {message && (
            <Alert severity="error" sx={{ mt: 2 }}>
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
            {loading ? 'Signing in...' : 'Continue'}
          </Button>
        </Stack>
      ) : (
        <Stack component="form" onSubmit={handlePasswordChange} spacing={0}>
          <PasswordField
            label="Current Password"
            name="currentPassword"
            value={changeData.currentPassword}
            onChange={(e) => setChangeData({ ...changeData, currentPassword: e.target.value })}
            required
          />
          <PasswordField
            label="New Password"
            name="newPassword"
            value={changeData.newPassword}
            onChange={(e) => setChangeData({ ...changeData, newPassword: e.target.value })}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            required
          />
          {passwordFocused && <PasswordStrengthHint password={changeData.newPassword} />}

          {message && (
            <Alert severity={message.toLowerCase().includes('success') ? 'success' : 'error'} sx={{ mt: 2 }}>
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
            {loading ? 'Saving...' : 'Submit New Password'}
          </Button>
        </Stack>
      )}
    </AuthLayout>
  );
};

export default ChangePasswordPage;
