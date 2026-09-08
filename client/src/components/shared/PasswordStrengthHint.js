import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const RULES = [
  { test: (p) => p.length >= 6, label: 'At least 6 characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter (A-Z)' },
  { test: (p) => /\d/.test(p), label: 'One number (0-9)' },
  { test: (p) => /[!@#$%^&*()_\-+=[\]{};:'",<.>/?\\|`~]/.test(p), label: 'One special character (!@#$%^&*)' },
];

/**
 * Shared password rules checklist, shown while a password field is focused.
 * Replaces the identical inline-styled tooltip that used to be copy-pasted
 * between Register.js and ChangePassword.js.
 */
const PasswordStrengthHint = ({ password }) => {
  return (
    <Box
      sx={{
        mt: 1,
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={0.5}>
        {RULES.map((rule) => {
          const valid = rule.test(password);
          return (
            <Box key={rule.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {valid ? (
                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <CancelIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              )}
              <Typography variant="caption">{rule.label}</Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default PasswordStrengthHint;
