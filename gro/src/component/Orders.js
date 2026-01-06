import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Alert, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider, Grid, IconButton, Tooltip, MenuItem, 
  Select, FormControl, InputLabel, Snackbar
} from '@mui/material';
import {
  format, parseISO
} from 'date-fns';
import { styled } from '@mui/material/styles';
import {
  Visibility, Close, LocalShipping, Payment, Home, Phone, Person,
  Receipt, Refresh
} from '@mui/icons-material';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    cursor: 'pointer'
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const StatusChip = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Processing': return 'info';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'error';
      case 'Shipped': return 'secondary';
      case 'Out for Delivery': return 'primary';
      default: return 'default';
    }
  };

  const getIcon = () => {
    if (status === 'Shipped' || status === 'Out for Delivery') return <LocalShipping fontSize="small" />;
    return null;
  };

  return (
    <Chip
      label={status}
      color={getColor()}
      size="small"
      icon={getIcon()}
      sx={{ fontWeight: 500 }}
    />
  );
};

const OrderDetailsModal = ({ order, open, onClose, onStatusUpdated }) => {
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    setNewStatus(order?.status || '');
  }, [order]);

  const handleUpdate = async () => {
    if (!order || !newStatus || newStatus === order.status) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/orderapi/updateStatus/${order._id}`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setSnackbar({ open: true, message: 'Order status updated', severity: 'success' });
        onStatusUpdated();
        onClose();
      } else {
        setSnackbar({ open: true, message: res.data.message || 'Failed to update status', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating status', severity: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  if (!order) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box display="flex" alignItems="center">
            <Receipt color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Order #{order._id.substring(18, 24).toUpperCase()}</Typography>
          </Box>
          <IconButton onClick={onClose}><Close /></IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600}>Order Summary</Typography>
              <Box sx={{ mb: 2 }}>
                <StatusChip status={order.status} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Placed on {format(parseISO(order.createdAt), 'PPPpp')}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight={600}>Items Ordered</Typography>
              {order.items.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 2 }}>
                  <img src={`http://localhost:5000${item.image}`} alt={item.product_name}
                    style={{ width: "50px", height: "50px", objectFit: "contain", marginRight: 8 }} />
                  <Box flexGrow={1}>
                    <Typography>{item.product_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rs. {item.price.toFixed(2)} × {item.quantity}
                    </Typography>
                  </Box>
                  <Typography fontWeight={500}>
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between"><Typography>Subtotal:</Typography><Typography>Rs. {order.subtotal.toFixed(2)}</Typography></Box>
              <Box display="flex" justifyContent="space-between"><Typography>Delivery Fee:</Typography><Typography>Rs. {order.deliveryFee.toFixed(2)}</Typography></Box>
              <Box display="flex" justifyContent="space-between"><Typography>Tax:</Typography><Typography>Rs. {order.taxAmount.toFixed(2)}</Typography></Box>
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography fontWeight={600}>Total:</Typography>
                <Typography fontWeight={600}>Rs. {order.total.toFixed(2)}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600}>Customer Info</Typography>
              <Box display="flex" alignItems="center" mb={1}><Person sx={{ mr: 1 }} /><Typography>{order.userEmail}</Typography></Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600}>Shipping Address</Typography>
              {order.shippingAddress && (
                <>
                  <Box display="flex" alignItems="center" mb={1}><Home sx={{ mr: 1 }} /><Typography>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.zipCode}</Typography></Box>
                  <Box display="flex" alignItems="center" mb={1}><Person sx={{ mr: 1 }} /><Typography>{order.shippingAddress.fullName}</Typography></Box>
                  <Box display="flex" alignItems="center"><Phone sx={{ mr: 1 }} /><Typography>{order.shippingAddress.phone}</Typography></Box>
                </>
              )}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600}>Payment Method</Typography>
              <Box display="flex" alignItems="center"><Payment sx={{ mr: 1 }} /><Typography>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}</Typography></Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Close</Button>
          {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
            <>
              <FormControl size="small" sx={{ minWidth: 160, mr: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Processing">Processing</MenuItem>
                  <MenuItem value="Shipped">Shipped</MenuItem>
                  <MenuItem value="Out for Delivery">Out for Delivery</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <Button 
                variant="contained" 
                color="primary" 
                disabled={updating || newStatus === order.status} 
                onClick={handleUpdate}
              >
                {updating ? 'Updating...' : 'Update Status'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.email !== 'admin@gmail.com') {
        navigate('/adminpanel/dashboard');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/orderapi/allOrders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        setError(response.data.message || 'Failed to load orders');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { state: { from: '/adminpanel/orders' } });
      } else {
        setError(err.response?.data?.message || 'Network error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={600} mb={3}>Order Management</Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      ) : error ? (
        <Box mt={4}>
          <Alert severity="error">{error}</Alert>
          <Button startIcon={<Refresh />} variant="contained" sx={{ mt: 2 }} onClick={fetchOrders}>Retry</Button>
        </Box>
      ) : (
        <>
          <Box display="flex" justifyContent="space-between" mb={3}>
            <Typography variant="subtitle1">Showing {orders.length} orders</Typography>
            <Button startIcon={<Refresh />} variant="outlined" onClick={fetchOrders}>Refresh</Button>
          </Box>

          <Paper elevation={3}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Order ID</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Customer</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Items</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Total</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <StyledTableRow key={order._id}>
                      <TableCell>#{order._id.substring(18, 24).toUpperCase()}</TableCell>
                      <TableCell>{order.userEmail}</TableCell>
                      <TableCell>
                        {order.items.slice(0, 2).map((item, index) => (
                          <Typography key={index} variant="body2" noWrap>
                            • {item.product_name} (×{item.quantity})
                          </Typography>
                        ))}
                        {order.items.length > 2 && (
                          <Typography variant="body2" color="text.secondary">
                            +{order.items.length - 2} more
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>Rs. {order.total.toFixed(2)}</TableCell>
                      <TableCell><StatusChip status={order.status} /></TableCell>
                      <TableCell>
                        <Typography variant="body2">{format(parseISO(order.createdAt), 'MMM dd, yyyy')}</Typography>
                        <Typography variant="caption" color="text.secondary">{format(parseISO(order.createdAt), 'hh:mm a')}</Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton onClick={() => handleRowClick(order)}><Visibility /></IconButton>
                        </Tooltip>
                      </TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {orders.length === 0 && (
            <Box mt={4} textAlign="center">
              <Typography>No orders found</Typography>
              <Button variant="outlined" sx={{ mt: 2 }} onClick={fetchOrders}>Refresh</Button>
            </Box>
          )}
        </>
      )}

      <OrderDetailsModal
        order={selectedOrder}
        open={modalOpen}
        onClose={handleCloseModal}
        onStatusUpdated={fetchOrders}
      />
    </Box>
  );
};

export default AdminOrders;