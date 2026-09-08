import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

/**
 * Standard password input with a show/hide toggle, using MUI icons
 * (replaces the react-icons FaEye/FaEyeSlash used inconsistently before,
 * so the whole app now uses one icon library).
 */
const PasswordField = ({ label = 'Password', value, onChange, name, autoComplete, ...rest }) => {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      fullWidth
      label={label}
      name={name}
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      margin="normal"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setVisible((v) => !v)}
              edge="end"
              size="small"
              aria-label={visible ? 'Hide password' : 'Show password'}
            >
              {visible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...rest}
    />
  );
};

export default PasswordField;
