import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  TextField,
  Button,
  Alert,
  Link,
  Stack,
  Collapse,
  CircularProgress,
} from '@mui/material';
import AuthLayout from './auth/AuthLayout';
import PasswordField from './auth/PasswordField';

const Login = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginMessage, setLoginMessage] = useState('');
  const [loginErrorField, setLoginErrorField] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setLoginMessage('');
    setLoginErrorField(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage('');
    setLoginErrorField(null);

    if (!loginData.email) {
      setLoginErrorField('email');
      setLoginMessage('Please enter your email.');
      return;
    }
    if (!loginData.password) {
      setLoginErrorField('password');
      setLoginMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', loginData);
      localStorage.setItem('accessToken', res.data.accessToken);

      const decoded = jwtDecode(res.data.accessToken);
      const userRole = decoded.role;
      const userId = decoded.id;

      localStorage.setItem('role', userRole);
      localStorage.setItem('userId', userId);

      const isPasswordChangeRequired = decoded.isPasswordChangeRequired;

      if (isPasswordChangeRequired) {
        navigate('/change-password');
      } else if (userRole === 'admin') {
        navigate('/appointment');
      } else if (userRole === 'veterinarian') {
        navigate('/vetsDash');
      } else if (userRole === 'user') {
        navigate('/user');
      } else {
        navigate('/');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed.';
      setLoginMessage(errorMsg);
      if (errorMsg.toLowerCase().includes('email')) {
        setLoginErrorField('email');
      } else if (errorMsg.toLowerCase().includes('password')) {
        setLoginErrorField('password');
      } else {
        setLoginErrorField(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: forgotEmail,
      });
      setForgotMessage(res.data.message || 'Reset link sent to your email.');
    } catch (err) {
      setForgotMessage(err.response?.data?.message || 'Failed to send reset email.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your pets and appointments"
      footer={
        <>
          Don't have an account?{' '}
          <Link component={RouterLink} to="/register" fontWeight={600}>
            Sign up
          </Link>
        </>
      }
    >
      <Stack component="form" onSubmit={handleLogin} spacing={0}>
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          name="email"
          type="email"
          value={loginData.email}
          onChange={handleLoginChange}
          error={loginErrorField === 'email'}
          helperText={loginErrorField === 'email' ? loginMessage : ' '}
          required
        />

        <PasswordField
          name="password"
          value={loginData.password}
          onChange={handleLoginChange}
          error={loginErrorField === 'password'}
          helperText={loginErrorField === 'password' ? loginMessage : ' '}
          required
        />

        <Collapse in={!!loginMessage && !loginErrorField}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {loginMessage}
          </Alert>
        </Collapse>

        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={() => setShowForgotPassword((v) => !v)}
          >
            Forgot password?
          </Link>
        </Stack>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {loading ? 'Signing in...' : 'Log In'}
        </Button>

        <Button
          type="button"
          variant="text"
          size="small"
          onClick={() => navigate('/change-pass')}
          sx={{ mt: 1 }}
        >
          Change Password
        </Button>
      </Stack>

      <Collapse in={showForgotPassword}>
        <Stack
          component="form"
          onSubmit={handleForgotPassword}
          spacing={1.5}
          sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}
        >
          <TextField
            fullWidth
            size="small"
            label="Email"
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            required
          />
          {forgotMessage && <Alert severity="info">{forgotMessage}</Alert>}
          <Stack direction="row" spacing={1}>
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={forgotLoading}
              startIcon={forgotLoading ? <CircularProgress size={14} color="inherit" /> : null}
            >
              Send Reset Link
            </Button>
            <Button
              type="button"
              variant="text"
              size="small"
              onClick={() => setShowForgotPassword(false)}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Collapse>
    </AuthLayout>
  );
};

export default Login;
