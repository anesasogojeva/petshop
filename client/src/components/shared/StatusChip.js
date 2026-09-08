import React from 'react';
import { Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Status -> { color, icon, label } so meaning is never carried by color alone.
const STATUS_MAP = {
  confirmed: { color: 'success', icon: CheckCircleOutlineIcon, label: 'Confirmed' },
  active: { color: 'success', icon: CheckCircleOutlineIcon, label: 'Active' },
  available: { color: 'success', icon: CheckCircleOutlineIcon, label: 'Available' },
  pending: { color: 'warning', icon: ScheduleIcon, label: 'Pending' },
  completed: { color: 'info', icon: DoneAllIcon, label: 'Completed' },
  cancelled: { color: 'error', icon: CancelOutlinedIcon, label: 'Cancelled' },
  canceled: { color: 'error', icon: CancelOutlinedIcon, label: 'Cancelled' },
  booked: { color: 'default', icon: ScheduleIcon, label: 'Booked' },
  unavailable: { color: 'default', icon: CancelOutlinedIcon, label: 'Unavailable' },
  error: { color: 'error', icon: ErrorOutlineIcon, label: 'Error' },
};

/**
 * Status badge that pairs an icon with the color, so status is never
 * communicated by color alone (accessibility requirement).
 */
const StatusChip = ({ status, label, size = 'small' }) => {
  const key = String(status || '').toLowerCase();
  const entry = STATUS_MAP[key] || { color: 'default', icon: HelpOutlineIcon, label: label || status || 'Unknown' };
  const Icon = entry.icon;

  return (
    <Chip
      icon={<Icon style={{ fontSize: 16 }} />}
      label={label || entry.label}
      color={entry.color === 'default' ? undefined : entry.color}
      variant={entry.color === 'default' ? 'outlined' : 'filled'}
      size={size}
    />
  );
};

export default StatusChip;
