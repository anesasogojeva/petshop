import React from 'react';
import { Box, Paper, TablePagination } from '@mui/material';
import EmptyState from './EmptyState';

/**
 * Mobile-only (xs) replacement for a wide admin table: renders `rows` as a
 * stacked list of cards via `renderCard`, plus the same pagination controls
 * as the desktop table. The caller keeps its existing TableContainer for
 * sm+ (hidden here via `sx={{ display: { xs: 'none', sm: 'block' } }}`) so
 * desktop is completely unaffected — this is the same pattern already
 * proven on the client/user dashboard's Appointments and Records tabs.
 */
const MobileCardList = ({ rows, renderCard, emptyTitle, emptyDescription, emptyIcon, pagination }) => (
  <Paper variant="outlined" sx={{ display: { xs: 'block', sm: 'none' } }}>
    {rows.length === 0 ? (
      <EmptyState title={emptyTitle} description={emptyDescription} icon={emptyIcon} />
    ) : (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 1.5 }}>
        {rows.map(renderCard)}
      </Box>
    )}
    {pagination && (
      <Box sx={{ overflowX: 'auto' }}>
        <TablePagination
          component="div"
          labelRowsPerPage=""
          sx={{
            width: 'max-content',
            minWidth: '100%',
            '& .MuiTablePagination-toolbar': { pl: 1, pr: 0.5 },
            '& .MuiTablePagination-spacer': { flex: '0 0 8px' },
          }}
          {...pagination}
        />
      </Box>
    )}
  </Paper>
);

export default MobileCardList;
