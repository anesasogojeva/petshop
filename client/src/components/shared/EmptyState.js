import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

/**
 * Consistent "nothing to show" state for tables, lists and search results.
 * Use instead of a bare "No X found." string.
 */
const EmptyState = ({
  icon,
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
  compact = false,
}) => {
  const Icon = icon || InboxOutlinedIcon;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: compact ? 3 : 6,
        px: 2,
        color: 'text.secondary',
      }}
    >
      <Icon sx={{ fontSize: compact ? 32 : 44, color: 'text.disabled', mb: 1.5 }} />
      <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ mt: 0.5, maxWidth: 360 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="outlined" size="small" onClick={onAction} sx={{ mt: 2 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
