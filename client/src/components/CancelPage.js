import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, Stack } from '@mui/material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

function CancelPage() {
  const navigate = useNavigate();

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
        <CancelOutlinedIcon color="warning" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" component="h1" gutterBottom>
          Payment Cancelled
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your payment was not completed. Your cart items are still saved, so you can try again whenever you're ready.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="outlined" onClick={() => navigate('/productList')}>
            Continue Shopping
          </Button>
          <Button variant="contained" onClick={() => navigate('/checkout')}>
            Return to Cart
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CancelPage;
