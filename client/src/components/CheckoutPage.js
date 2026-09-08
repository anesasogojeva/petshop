import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  CardMedia,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmptyState from './shared/EmptyState';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [message, setMessage] = useState({ open: false, text: '', severity: 'success' });

  const showMessage = (text, severity = 'error') => setMessage({ open: true, text, severity });
  const handleCloseMessage = () => setMessage((prev) => ({ ...prev, open: false }));

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('accessToken');
  const authHeader = {
    headers: { Authorization: `Bearer ${token}` }
  };
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    const fetchCartWithImages = async () => {
      try {
        const { data: cart } = await axios.get(
          `http://localhost:5000/api/cart/user/${userId}`,
          authHeader
        );

        const cartWithImages = await Promise.all(
          cart.map(async item => {
            try {
              const { data } = await axios.get(
                `http://localhost:5000/api/products/${item.Product.id}/image`
              );
              const imageUrl = data.images?.[0]?.url
                ? `http://localhost:5000/${data.images[0].url}`
                : '/default-image.jpg';

              return {
                ...item,
                Product: {
                  ...item.Product,
                  imageUrl,
                },
              };
            } catch (err) {
              console.error(`Failed to fetch image for product ${item.Product.id}`, err);
              return {
                ...item,
                Product: {
                  ...item.Product,
                  imageUrl: '/default-image.jpg',
                },
              };
            }
          })
        );

        setCartItems(cartWithImages);
      } catch (err) {
        console.error('Failed to fetch cart:', err);
        showMessage("We couldn't load your cart. Please refresh the page.", 'error');
      }
    };

    fetchCartWithImages();

    // If the browser restores this page from cache (e.g. navigating back
    // after Stripe redirects to the success page), re-fetch instead of
    // showing whatever the cart looked like before checkout.
    const handlePageShow = (event) => {
      if (event.persisted) {
        fetchCartWithImages();
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [userId]);

  const removeItem = (itemId) => {
    axios.delete(`http://localhost:5000/api/cart/${itemId}`, authHeader)
      .then(() => setCartItems(prev => prev.filter(item => item.id !== itemId)))
      .catch(err => {
        console.error('Failed to remove item:', err);
        showMessage("We couldn't remove that item. Please try again.", 'error');
      });
  };

  const createOrder = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/orders/${userId}`,
        {}, 
        authHeader
      );

      const data = res.data;

      if (res.status !== 201) {
        console.error('Order creation failed:', data);
      } else {
        console.log('Order created successfully:', data);
      }
    } catch (err) {
      console.error('Error creating order:', err.response?.data || err.message);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/checkout/create-checkout-session/${userId}`,
        {},
        authHeader
      );

      await createOrder();

      // The order is placed and the cart is cleared server-side (see
      // confirm-email on the success page) — clear it locally too so
      // the cart never shows stale, already-purchased items again
      // (e.g. if the browser restores this page via the back button).
      setCartItems([]);

      window.location.href = res.data.url;
    } catch (err) {
      console.error('Checkout failed', err.response?.data || err.message);
      showMessage("We couldn't start checkout. Please try again in a moment.", 'error');
      setIsCheckingOut(false);
    }
  };

  const cartTotal = cartItems.reduce(
    (acc, item) =>
      acc + item.quantity * (item.Product.price * (1 - item.Product.discount)),
    0
  );

  return (
    <Box
      sx={{
        p: 4,
        bgcolor: 'background.default',
        minHeight: '100vh',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {cartItems.length} item{cartItems.length !== 1 && 's'} in your cart
      </Typography>

      {cartItems.length === 0 ? (
        <EmptyState
          icon={ShoppingCartIcon}
          title="Your cart is empty"
          description="Add some products before checking out."
          actionLabel="Shop Now"
          onAction={() => navigate('/productList')}
        />
      ) : (
      <Stack spacing={2}>
        {cartItems.map(item => {
          const price = item.Product.price;
          const discount = item.Product.discount;
          const discountedPrice = price * (1 - discount);
          const totalPrice = item.quantity * discountedPrice;

          return (
            <Card
              key={item.id}
              variant="outlined"
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
              }}
            >
              <CardMedia
                component="img"
                image={item.Product.imageUrl}
                alt={item.Product.name}
                sx={{
                  width: 100,
                  height: 100,
                  objectFit: 'cover',
                  mr: 2,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6">
                  {item.Product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quantity: {item.quantity}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Price:{' '}
                  {discount > 0 ? (
                    <>
                      <Box component="s" sx={{ color: 'text.disabled' }}>${price.toFixed(2)}</Box>{' '}
                      <Box component="strong" sx={{ color: 'primary.main' }}>
                        ${discountedPrice.toFixed(2)}
                      </Box>{' '}
                      ({(discount * 100).toFixed(0)}% off)
                    </>
                  ) : (
                    <>${price.toFixed(2)}</>
                  )}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  Total: ${totalPrice.toFixed(2)}
                </Typography>
              </CardContent>
              <Button
                variant="outlined"
                color="error"
                onClick={() => removeItem(item.id)}
              >
                Remove
              </Button>
            </Card>
          );
        })}
      </Stack>
      )}

      {cartItems.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: 'primary.light',
              p: 2,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" color="primary.dark">
              Order Total: ${cartTotal.toFixed(2)}
            </Typography>
            <Box>
              <Button
                variant="outlined"
                onClick={() => navigate('/productList')}
                sx={{ mr: 2 }}
              >
                Continue Shopping
              </Button>
              <Button
                variant="contained"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                startIcon={isCheckingOut ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {isCheckingOut ? 'Redirecting to Payment...' : 'Go to Payment'}
              </Button>
            </Box>
          </Box>
        </>
      )}

      <Snackbar
        open={message.open}
        autoHideDuration={5000}
        onClose={handleCloseMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseMessage} severity={message.severity} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CheckoutPage;
