import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, Snackbar, Alert,
} from '@mui/material';
import Sidebar from './Sidebar';
import DashboardShell from './nav/DashboardShell';
import TableToolbar from './shared/TableToolbar';
import EmptyState from './shared/EmptyState';
import UnauthorizedState from './shared/UnauthorizedState';
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
      const res = await fetch('http://localhost:5000/api/contact', authHeader);
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

      <TableContainer component={Paper}>
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
