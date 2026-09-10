import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const REDIRECT_SECONDS = 5;

function SuccessPage() {
  const hasSent = useRef(false);
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  const goToOrders = () => navigate('/user', { state: { tab: 'orders' } });

  useEffect(() => {
    if (hasSent.current) return;
    hasSent.current = true;

    const sendConfirmation = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');

        await fetch(`${process.env.REACT_APP_API_URL}/api/stripe/confirm-email`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
      } catch (err) {
        console.error('Failed to send confirmation email:', err);
      }
    };

    sendConfirmation();
  }, []);

  // Auto-navigate to the Orders tab a few seconds after landing here,
  // so a successful payment always ends with the order visible.
  useEffect(() => {
    if (secondsLeft <= 0) {
      goToOrders();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  return (
    <Box
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        bgcolor: 'background.default',
        padding: 2,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          padding: 4,
          maxWidth: 400,
          textAlign: 'center',
        }}
      >
        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" component="h1" gutterBottom>
          Payment Successful
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Thank you for your purchase! A confirmation email has been sent to your inbox.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Taking you to your orders in {secondsLeft}s...
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="outlined" onClick={() => navigate('/productList')}>
            Continue Shopping
          </Button>
          <Button variant="contained" onClick={goToOrders}>
            View My Orders Now
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default SuccessPage;
