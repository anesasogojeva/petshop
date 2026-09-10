import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, IconButton, Snackbar, Alert, Typography,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import Sidebar from './Sidebar';
import DashboardShell from './nav/DashboardShell';
import TableToolbar from './shared/TableToolbar';
import EmptyState from './shared/EmptyState';
import ConfirmDialog from './shared/ConfirmDialog';
import UnauthorizedState from './shared/UnauthorizedState';
import MobileCardList from './shared/MobileCardList';
import useTableControls from '../hooks/useTableControls';

const OrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState({ open: false, text: '', severity: 'success' });
  const showMessage = (text, severity = 'success') => setMessage({ open: true, text, severity });
  const handleCloseMessage = () => setMessage({ ...message, open: false });

  const token = localStorage.getItem('accessToken');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/orders`, authHeader)
      .then((res) => setOrders(res.data))
      .catch((err) => {
        console.error('Error fetching orders:', err);
        showMessage('Error fetching orders.', 'error');
      });
  }, []);

  const handleDeleteOrder = (id) => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/api/orders/${id}`, authHeader)
      .then(() => {
        setOrders((prev) => prev.filter((order) => order.id !== id));
        showMessage('Order deleted successfully.');
      })
      .catch((err) => {
        console.error('Error deleting order:', err);
        showMessage('Error deleting order.', 'error');
      })
      .finally(() => setDeleteTarget(null));
  };

  const { search, setSearch, page, setPage, rowsPerPage, setRowsPerPage, pageRows, filteredCount } =
    useTableControls(orders, { searchKeys: ['id', 'User.name'] });

  const userRole = localStorage.getItem('role');
  if (userRole !== 'admin') return <UnauthorizedState />;

  return (
    <DashboardShell title="Orders" roleLabel="Admin" nav={<Sidebar />}>
      <TableToolbar
        title="Orders"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by order ID, user..."
      />

      <MobileCardList
        rows={pageRows}
        emptyTitle="No orders found"
        emptyDescription="Customer orders will show up here."
        pagination={{
          count: filteredCount,
          page,
          onPageChange: (_, p) => setPage(p),
          rowsPerPage,
          onRowsPerPageChange: (e) => setRowsPerPage(Number(e.target.value)),
          rowsPerPageOptions: [5, 10, 25],
        }}
        renderCard={(order) => (
          <Paper key={order.id} variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2">Order #{order.id}</Typography>
                <Typography variant="body2" color="text.secondary">{order.User?.name}</Typography>
                <Typography variant="body2"><strong>${Number(order.totalAmount).toFixed(2)}</strong></Typography>
              </Box>
              <IconButton onClick={() => setDeleteTarget(order)} aria-label="Delete" size="small">
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        )}
      />

      <TableContainer component={Paper} sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyState title="No orders found" description="Customer orders will show up here." />
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.User?.name}</TableCell>
                  <TableCell>${Number(order.totalAmount).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => setDeleteTarget(order)} aria-label="Delete">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete order?"
        description="This will permanently remove this order."
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDeleteOrder(deleteTarget.id)}
      />

      <Snackbar open={message.open} autoHideDuration={3000} onClose={handleCloseMessage} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseMessage} severity={message.severity} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </DashboardShell>
  );
};

export default OrderDashboard;
