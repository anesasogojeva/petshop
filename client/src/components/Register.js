import React, { useState } from 'react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import { TextField, Button, Alert, Link, Stack, CircularProgress } from '@mui/material';
import AuthLayout from './auth/AuthLayout';
import PasswordField from './auth/PasswordField';
import PasswordStrengthHint from './shared/PasswordStrengthHint';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/users/register', formData);
      setMessage(res.data.message);
      setSeverity('success');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed.');
      setSeverity('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join Pawtopia to book appointments and manage your pets"
      footer={
        <>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" fontWeight={600}>
            Log in
          </Link>
        </>
      }
    >
      <Stack component="form" onSubmit={handleSubmit} spacing={0}>
        <TextField
          fullWidth
          margin="normal"
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <PasswordField
          name="password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          required
        />
        {passwordFocused && <PasswordStrengthHint password={formData.password} />}

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
          {loading ? 'Creating account...' : 'Register'}
        </Button>
      </Stack>
    </AuthLayout>
  );
};

export default Register;
