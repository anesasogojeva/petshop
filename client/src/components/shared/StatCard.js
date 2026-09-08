import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

/**
 * Restrained KPI card: icon + number + label. Intentionally muted
 * (not a giant colorful tile) so a row of these reads as data, not decoration.
 */
const StatCard = ({ icon: Icon, label, value, accent = 'primary' }) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        height: '100%',
      }}
    >
      {Icon && (
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => `${theme.palette[accent]?.main || theme.palette.primary.main}1a`,
            color: `${accent}.main`,
            flexShrink: 0,
          }}
        >
          <Icon fontSize="small" />
        </Box>
      )}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" sx={{ lineHeight: 1.2 }}>
          {value}
        </Typography>
        <Typography variant="body2" noWrap>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StatCard;
