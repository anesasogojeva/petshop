import React, { useEffect, useState } from 'react';
import { resolveImageUrl } from '../utils/resolveImageUrl';
import {
  Dialog, DialogTitle, DialogContent,
  IconButton, Typography, Box, Stack, Button,
  CircularProgress, TextField, InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import axios from 'axios';
import Rating from '@mui/material/Rating';

export default function ProductQuickView({
  open,
  onClose,
  product,
  onCartUpdated,
}) {
  const [images, setImages] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [localProduct, setLocalProduct] = useState(product);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('accessToken');
  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  };

  useEffect(() => {
    if (!open || !product) return;

    let cancelled = false;
    setImages(null);
    setQuantity(1);
    setSelectedImageIndex(0);
    setUserRating(0);
    setUserComment('');
    setLocalProduct(product);

    (async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/${product.id}/image`);
        if (!cancelled) setImages(data.images ?? []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setImages([]);
      }
    })();

    (async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/reviews/product/${product.id}`);
        if (!cancelled) {
          const total = data.reduce((sum, r) => sum + r.rating, 0);
          const avg = data.length ? total / data.length : 0;
          setLocalProduct(prev => ({ ...prev, rating: avg }));
        }
      } catch (err) {
        console.error('Failed to fetch product reviews:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, product]);

  const handleQuantityChange = (e) => {
    const val = Math.max(1, parseInt(e.target.value || '1', 10));
    setQuantity(val);
  };

  const handleAddToCart = (product, quantity = 1) => {
    axios.post(`${process.env.REACT_APP_API_URL}/api/cart/user/${userId}`, {
      userId,
      productId: product.id,
      quantity,
    }, authHeader)
      .then(() => {
        if (onCartUpdated) {
          onCartUpdated();
        }
      })
      .catch(err => console.error('Add to cart failed:', err));
  };

  const handleRatingSubmit = async () => {
    if (userRating < 1) return;

    setIsSubmittingRating(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/reviews`,
        {
          productId: product.id,
          rating: userRating,
          comment: userComment.trim() || null,
        },
        authHeader
      );

      setUserRating(0);
      setUserComment('');

      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/reviews/product/${product.id}`);
      const total = data.reduce((sum, r) => sum + r.rating, 0);
      const avg = data.length ? total / data.length : 0;
      setLocalProduct(prev => ({ ...prev, rating: avg }));
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pr: 5, fontWeight: 700 }}>
        {localProduct?.name ?? 'Loading…'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 16, top: 16 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 4, py: 3 }}>
        {!localProduct ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            <Box sx={{ flex: '1 1 45%' }}>
              {images === null ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                  <CircularProgress color="primary" />
                </Box>
              ) : images.length === 0 ? (
                <Box
                  component="img"
                  src="/default-image.jpg"
                  alt="No product visual"
                  sx={{ width: '100%', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                />
              ) : (
                <>
                  <Box
                    component="img"
                    src={resolveImageUrl(images[selectedImageIndex].url)}
                    alt={`${localProduct.name} image`}
                    sx={{
                      width: '100%',
                      borderRadius: 2,
                      mb: 2,
                      objectFit: 'contain',
                      maxHeight: 400,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  <Stack direction="row" spacing={1}>
                    {images.map((img, idx) => (
                      <Box
                        key={idx}
                        component="img"
                        src={resolveImageUrl(img.url)}
                        alt={`Thumbnail ${idx + 1}`}
                        onClick={() => setSelectedImageIndex(idx)}
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 1,
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: selectedImageIndex === idx ? 'primary.main' : 'transparent',
                          objectFit: 'cover',
                          transition: 'border-color 0.2s',
                          '&:hover': { borderColor: 'primary.dark' },
                        }}
                      />
                    ))}
                  </Stack>
                </>
              )}
            </Box>

            <Box sx={{ flex: '1 1 55%', position: 'relative' }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {localProduct.name}
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {localProduct.description || 'No description available.'}
              </Typography>

              <Box sx={{ mb: 2 }}>
                {localProduct.discount > 0 ? (
                  <>
                    <Typography
                      variant="body1"
                      component="span"
                      sx={{
                        textDecoration: 'line-through',
                        color: 'text.secondary',
                        marginRight: 1,
                      }}
                    >
                      ${localProduct.price.toFixed(2)}
                    </Typography>
                    <Typography
                      variant="h6"
                      component="span"
                      color="primary.main"
                      sx={{ fontWeight: 'bold' }}
                    >
                      ${(localProduct.price * (1 - localProduct.discount)).toFixed(2)}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="span"
                      color="error.main"
                      sx={{ marginLeft: 1, fontWeight: 'bold' }}
                    >
                      (-{(localProduct.discount * 100).toFixed(0)}%)
                    </Typography>
                  </>
                ) : (
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    ${localProduct.price.toFixed(2)}
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Rating value={localProduct.rating || 0} precision={0.5} readOnly size="small" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {localProduct.rating ? `${localProduct.rating.toFixed(1)} / 5` : 'Not rated yet'}
                </Typography>
              </Box>

              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <TextField
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  inputProps={{ min: 1 }}
                  sx={{ width: 120 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">#</InputAdornment>,
                  }}
                />

                <Button
                  variant="contained"
                  startIcon={<ShoppingCartIcon />}
                  size="small"
                  sx={{ mt: 2 }}
                  onClick={e => {
                    e.stopPropagation();
                    handleAddToCart(localProduct, quantity);
                  }}
                >
                  Add to Cart
                </Button>
              </Stack>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Leave your rating
                </Typography>

                <Rating
                  name="user-rating"
                  value={userRating}
                  precision={1}
                  onChange={(event, newValue) => setUserRating(newValue)}
                  size="large"
                />

                <TextField
                  label="Comment (optional)"
                  multiline
                  rows={3}
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  fullWidth
                  sx={{ mt: 2 }}
                />

                <Button
                  variant="contained"
                  size="small"
                  sx={{ mt: 2 }}
                  disabled={isSubmittingRating || userRating < 1}
                  onClick={handleRatingSubmit}
                  startIcon={isSubmittingRating ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
                </Button>
              </Box>
            </Box>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
