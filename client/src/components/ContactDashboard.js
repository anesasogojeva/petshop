import React, { useState, useEffect } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, Snackbar, Alert, Typography,
} from '@mui/material';
import Sidebar from './Sidebar';
import DashboardShell from './nav/DashboardShell';
import TableToolbar from './shared/TableToolbar';
import EmptyState from './shared/EmptyState';
import UnauthorizedState from './shared/UnauthorizedState';
import MobileCardList from './shared/MobileCardList';
import useTableControls from '../hooks/useTableControls';

const ContactDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('accessToken');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/contact`, authHeader);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch contact messages:', err);
      setError('Failed to load contact messages.');
    }
  };

  const { search, setSearch, page, setPage, rowsPerPage, setRowsPerPage, pageRows, filteredCount } =
    useTableControls(messages, { searchKeys: ['name', 'email', 'message'] });

  const userRole = localStorage.getItem('role');
  if (userRole !== 'admin') return <UnauthorizedState />;

  return (
    <DashboardShell title="Contact Requests" roleLabel="Admin" nav={<Sidebar />}>
      <TableToolbar
        title="Contact Form Submissions"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email..."
      />

      <MobileCardList
        rows={pageRows}
        emptyTitle="No messages found"
        emptyDescription="Contact form submissions will show up here."
        pagination={{
          count: filteredCount,
          page,
          onPageChange: (_, p) => setPage(p),
          rowsPerPage,
          onRowsPerPageChange: (e) => setRowsPerPage(Number(e.target.value)),
          rowsPerPageOptions: [5, 10, 25],
        }}
        renderCard={(msg, idx) => (
          <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2">{msg.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{msg.email}</Typography>
            <Typography variant="body2">{msg.message}</Typography>
          </Paper>
        )}
      />

      <TableContainer component={Paper} sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <EmptyState title="No messages found" description="Contact form submissions will show up here." />
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((msg, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>{msg.name}</TableCell>
                  <TableCell>{msg.email}</TableCell>
                  <TableCell>{msg.message}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredCount}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(Number(e.target.value))}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setError(null)} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </DashboardShell>
  );
};

export default ContactDashboard;
