import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog, DialogTitle, DialogContent,
  Typography, Box, CircularProgress, TextField, Divider,
  FormControl, InputLabel, Select, MenuItem, Pagination,
  Button, IconButton, Badge
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../CSS/ProductList.css';
import ProductQuickView from './ProductQuickView';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [imagesByProduct, setImagesByProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productImages, setProductImages] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');


  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('accessToken');
  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,  // Replace `token` with your actual token variable
    }
  };

  // 🔁 Debounce search input
  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400); // 400ms delay
    return () => clearTimeout(delay);
  }, [searchQuery]);
  useEffect(() => {
    if (userId) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/cart/user/${userId}`, authHeader)
        .then(res => setCart(res.data))
        .catch(err => console.error('Failed to load cart:', err));
    }
  }, [userId]);

  // 🔁 Fetch products on filter/sort change
  useEffect(() => {
    const getSortParam = (value) => {
      switch (value) {
        case 'price-asc': return 'price:asc';
        case 'price-desc': return 'price:desc';
        case 'popularity': return 'popularity:desc';
        default: return 'createdAt:desc';
      }
    };


    const fetchFilteredProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/filter`, {
          params: {
            search: debouncedSearch,
            category: categoryFilter,
            sort: getSortParam(sortOrder),
            page: currentPage,
            limit: itemsPerPage,
          }
        });

        setProducts(data.products);
        setTotalPages(data.totalPages);

        const imagesResults = await Promise.all(
          data.products.map(p =>
            axios.get(`${process.env.REACT_APP_API_URL}/api/products/${p.id}/image`)
              .then(r => ({ id: p.id, data: r.data }))
              .catch(() => ({ id: p.id, data: null }))
          )
        );

        const map = {};
        imagesResults.forEach(({ id, data }) => {
          if (data?.images) {
            const primary = data.images.find(img => img.isPrimary);
            map[id] = primary ? `${process.env.REACT_APP_API_URL}/${primary.url}` : null;
          } else {
            map[id] = null;
          }
        });
        setImagesByProduct(map);

      } catch (err) {
        console.error(err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [debouncedSearch, categoryFilter, sortOrder, currentPage]);

  const openImageDialog = async product => {
    setCurrentProduct(product);
    setProductImages(null);
    setImageDialogOpen(true);
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/${product.id}/image`);
      setProductImages(data.images ?? []);
    } catch (e) {
      console.error(e);
      setProductImages([]);
    }
  };

  const showQuickView = product => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };





  // Add product to cart (or increment quantity if already exists)
  const addToCart = (product, quantity = 1) => {
    if (!userId) {
      // User not logged in - show message instead of adding to cart
      setSnackbarMessage('Please log in or sign up to shop with us! 🛒💖');
      setSnackbarOpen(true);
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    axios.post(`${process.env.REACT_APP_API_URL}/api/cart/user/${userId}`, {
      userId,
      productId: product.id,
      quantity: newQuantity,
    }, authHeader)
      .then(() => {
        // Refresh cart after adding
        return axios.get(`${process.env.REACT_APP_API_URL}/api/cart/user/${userId}`, authHeader);
      })
      .then(res => setCart(res.data))
      .catch(err => console.error('Add to cart failed:', err));
  };




  // Remove product from cart
  const removeFromCart = (itemId) => {
    axios.delete(`${process.env.REACT_APP_API_URL}/api/cart/${itemId}`, authHeader)
      .then(() => setCart(prev => prev.filter(item => item.id !== itemId)))
      .catch(err => console.error('Remove from cart failed:', err));
  };
  const fetchCartItems = () => {
    if (userId) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/cart/user/${userId}`, authHeader)
        .then((res) => setCart(res.data))
        .catch((err) => console.error('Failed to load cart:', err));
    }
  };


  const closeQuickView = () => {
    setQuickViewOpen(false);
    setSelectedProduct(null);
  };
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // if (loading) return <p>Loading products...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <>
      <Header />



      <div className="shop-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <h3>Browse 🐶</h3>
          <Divider />
          <FormControl fullWidth size="small" sx={{ marginTop: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select value={categoryFilter} onChange={handleCategoryChange} label="Category">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pet food">🐕 pet food</MenuItem>
              <MenuItem value="clothes">🐈 clothes</MenuItem>
              <MenuItem value="toys">🦜 toys</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Search products"
            variant="outlined"
            size="small"
            fullWidth
            sx={{ marginTop: 2 }}
            value={searchQuery}
            onChange={handleSearchChange}
          />

          <FormControl fullWidth size="small" sx={{ marginTop: 2 }}>
            <InputLabel>Sort by</InputLabel>
            <Select value={sortOrder} onChange={handleSortChange} label="Sort by">
              <MenuItem value="">Default</MenuItem>
              <MenuItem value="price-asc">Price: Low to High</MenuItem>
              <MenuItem value="price-desc">Price: High to Low</MenuItem>
              <MenuItem value="popularity">Popularity</MenuItem>
            </Select>
          </FormControl>

          {/* Cart Display */}
          <Box sx={{ mt: 4, borderTop: '1px solid #ddd', pt: 2 }}>
            <Typography variant="h6">Your Cart</Typography>
            {cart.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Cart is empty.
              </Typography>
            ) : (
              cart.map(item => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                    bgcolor: 'primary.light',
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2">{item.Product?.name || 'Unnamed Product'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Qty: {item.quantity} x $
                      {item.Product?.discount > 0 ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: 'gray', marginRight: 4 }}>
                            ${item.Product.price.toFixed(2)}
                          </span>
                          <span>${(item.Product.price * (1 - (item.Product.discount * 100) / 100)).toFixed(2)}</span>
                        </>
                      ) : (
                        <span>${item.Product.price.toFixed(2)}</span>
                      )}

                    </Typography>

                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove from cart"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))
            )}
            {cart.length > 0 && (
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/checkout')}
                sx={{
                  mt: 2,
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark', // slightly darker rose
                  },
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                }}
                startIcon={
                  <Badge
                    badgeContent={cart.length}
                    color="secondary"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: 'secondary.dark',
                        color: '#fff',
                        fontWeight: 'bold',
                      },
                    }}
                  >
                    <ShoppingCartIcon />
                  </Badge>
                }
              >
                View Cart / Checkout
              </Button>



            )}

          </Box>
        </aside>

        {/* Product Grid */}
        {/* Product Grid */}
        <section className="product-list-wrapper">
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <div className="product-list">
              {products.map(p => (
                <div
                  key={p.id}
                  className="product-card"
                  onClick={() => showQuickView(p)}
                  style={{ position: 'relative' }}
                >
                  <img
                    src={imagesByProduct[p.id] || '/default-image.jpg'}
                    alt={p.name}
                    className="product-image"
                  />
                  <h3 className="product-title">{p.name}</h3>
                  <p className="product-desc">{p.description}</p>
                  <p className="product-price">
                    {p.discount > 0 ? (
                      <>
                        <span style={{ textDecoration: 'line-through', color: 'gray', marginRight: 8 }}>
                          ${p.price.toFixed(2)}
                        </span>
                        <b>${(p.price * (1 - p.discount)).toFixed(2)}</b>
                        <span className="product-discount" style={{ color: 'red', marginLeft: 8 }}>
                          (-{(p.discount * 100).toFixed(0)}%)
                        </span>
                      </>
                    ) : (
                      <b>${p.price.toFixed(2)}</b>
                    )}
                  </p>

                  <Button
                    variant="contained"
                    startIcon={<ShoppingCartIcon />}
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      addToCart(p);
                    }}
                  >
                    Add to Cart
                  </Button>

                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <Box mt={4} display="flex" justifyContent="center">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(e, value) => setCurrentPage(value)}
              sx={{
                '& .MuiPaginationItem-root': {
                  color: 'primary.main',
                },
                '& .MuiPaginationItem-root.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                },
                '& .MuiPaginationItem-root:hover': {
                  backgroundColor: 'primary.light',
                },
              }}
            />
          </Box>
        </section>

      </div>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Images for {currentProduct?.name}</DialogTitle>
        <DialogContent dividers>
          {!productImages ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : productImages.length === 0 ? (
            <Typography align="center">No images available.</Typography>
          ) : (
            <Box
              sx={{
                display: 'flex',
                overflowX: 'auto',
                gap: 1,
                py: 1,
              }}
            >
              {productImages.map(img => (
                <img
                  key={img.id}
                  src={`${process.env.REACT_APP_API_URL}/${img.url}`}
                  alt={`Image ${img.id}`}
                  style={{
                    maxHeight: 200,
                    borderRadius: 10,
                    cursor: 'pointer',
                  }}
                  onClick={() => window.open(`${process.env.REACT_APP_API_URL}/${img.url}`, '_blank')}
                />
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick View Modal */}
      {selectedProduct && (
        <ProductQuickView
          open={quickViewOpen}
          onClose={closeQuickView}
          product={selectedProduct}
          onCartUpdated={fetchCartItems}
        />



      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="info"
          sx={{
            width: '100%',
            backgroundColor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            '& .MuiAlert-icon': {
              color: 'black',
            },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>



      <Footer />
    </>

  );
};

export default ProductList;