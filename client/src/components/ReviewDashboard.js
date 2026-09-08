import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, IconButton, Snackbar, Alert, Rating,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import Sidebar from './Sidebar';
import DashboardShell from './nav/DashboardShell';
import TableToolbar from './shared/TableToolbar';
import EmptyState from './shared/EmptyState';
import ConfirmDialog from './shared/ConfirmDialog';
import UnauthorizedState from './shared/UnauthorizedState';
import useTableControls from '../hooks/useTableControls';

const ReviewDashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState({ open: false, text: '', severity: 'success' });

  const showMessage = (text, severity = 'success') => setMessage({ open: true, text, severity });
  const handleCloseMessage = () => setMessage({ ...message, open: false });

  const token = localStorage.getItem('accessToken');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchReviews = () => {
    axios.get('http://localhost:5000/api/reviews', authHeader)
      .then(res => setReviews(res.data))
      .catch(err => {
        console.error('Error fetching reviews:', err);
        showMessage('Error fetching reviews.', 'error');
      });
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = (id) => {
    axios.delete(`http://localhost:5000/api/reviews/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => fetchReviews())
      .then(() => showMessage('Review deleted successfully.'))
      .catch(err => {
        console.error('Error deleting review:', err);
        showMessage('Error deleting review.', 'error');
      })
      .finally(() => setDeleteTarget(null));
  };

  const { search, setSearch, page, setPage, rowsPerPage, setRowsPerPage, pageRows, filteredCount } =
    useTableControls(reviews, { searchKeys: ['User.name', 'Product.name', 'comment'] });

  const userRole = localStorage.getItem('role');
  if (userRole !== 'admin') return <UnauthorizedState />;

  return (
    <DashboardShell title="Reviews" roleLabel="Admin" nav={<Sidebar />}>
      <TableToolbar
        title="Reviews"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by user, product, comment..."
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState title="No reviews found" description="Customer reviews will show up here." />
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((review) => (
                <TableRow key={review.id} hover>
                  <TableCell>{review.User?.name}</TableCell>
                  <TableCell>{review.Product?.name}</TableCell>
                  <TableCell><Rating value={review.rating} readOnly size="small" /></TableCell>
                  <TableCell>{review.comment}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => setDeleteTarget(review)} aria-label="Delete">
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
        title="Delete review?"
        description="This will permanently remove this review."
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDeleteReview(deleteTarget.id)}
      />

      <Snackbar open={message.open} autoHideDuration={3000} onClose={handleCloseMessage} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseMessage} severity={message.severity} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </DashboardShell>
  );
};

export default ReviewDashboard;
