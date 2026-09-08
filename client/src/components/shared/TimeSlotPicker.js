import React from 'react';
import { Box, Chip, Skeleton } from '@mui/material';
import EmptyState from './EmptyState';
import ScheduleIcon from '@mui/icons-material/Schedule';

const formatSlotTime = (startTime) =>
  new Date(`1970-01-01T${startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/**
 * Chip-grid time picker for appointment booking, replacing the plain
 * <Select> dropdown. Only shows what the API actually returns as open —
 * it does not synthesize a full-day grid with "booked" slots, since the
 * backend doesn't expose business hours or which slots are taken, only
 * which are free.
 */
const TimeSlotPicker = ({ slots, selectedSlotId, onSelect, loading, disabledHint }) => {
  if (disabledHint) {
    return (
      <Box sx={{ py: 2, textAlign: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
        {disabledHint}
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, py: 1 }}>
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} variant="rounded" width={84} height={32} />
        ))}
      </Box>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <EmptyState
        compact
        icon={ScheduleIcon}
        title="No open slots for this date"
        description="Try another date or veterinarian."
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, py: 1 }}>
      {slots.map((slot) => (
        <Chip
          key={slot.id}
          label={formatSlotTime(slot.startTime)}
          onClick={() => onSelect(slot)}
          color={selectedSlotId === slot.id ? 'primary' : undefined}
          variant={selectedSlotId === slot.id ? 'filled' : 'outlined'}
          clickable
        />
      ))}
    </Box>
  );
};

export default TimeSlotPicker;
