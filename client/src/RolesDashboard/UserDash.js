import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, AppBar, Toolbar, IconButton, Button, Modal, TextField, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import petsBg from '../images/pet9.jpg';
import UserSidebar from './UserSidebar';
import SendIcon from '@mui/icons-material/Send';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import EmptyState from '../components/shared/EmptyState';
import StatusChip from '../components/shared/StatusChip';
import TimeSlotPicker from '../components/shared/TimeSlotPicker';
import TableToolbar from '../components/shared/TableToolbar';
import useTableControls from '../hooks/useTableControls';
import { getCurrentRole } from '../utils/auth';

const UserDash = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [adoptions, setAdoptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [pets, setPets] = useState([]);
  const [vets, setVets] = useState([]);
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState(location.state?.tab || 'adoptions');
  const [openAddAppointment, setOpenAddAppointment] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [userIdToChatId, setUserIdToChatId] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    description: '',
    gender: '',
    type: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [logNote, setLogNote] = useState('');
  const [openAddPet, setOpenAddPet] = useState(false);

  const [message, setMessage] = useState({ open: false, text: '', severity: 'success' });

  const showMessage = (text, severity = 'success') => {
    setMessage({ open: true, text, severity });
  };

  const handleCloseMessage = () => {
    setMessage({ ...message, open: false });
  };

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [chatMessages, setChatMessages] = useState({});
  const [activeChatId, setActiveChatId] = useState(null);
  const [openAddReview, setOpenAddReview] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');

  const [newReview, setNewReview] = useState({
    rating: '',
    comment: ''
  });

  const [newAppointment, setNewAppointment] = useState({
    date: '',
    time: '',
    reason: '',
    petId: '',
    veterinarianId: '',
    vetUserId: '',
    slotId: ''
  });

  const token = localStorage.getItem('accessToken');
  const decodedToken = jwtDecode(token);

  const userId = decodedToken.id;
  const userEmail = decodedToken.email;
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const adoptionsTable = useTableControls(adoptions, { searchKeys: ['Pet.name'] });
  const appointmentsTable = useTableControls(appointments, { searchKeys: ['Pet.name', 'Veterinarian.User.name', 'reason'] });
  const recordsTable = useTableControls(records, { searchKeys: ['diagnosis', 'treatment', 'Pet.name'] });
  const ordersTable = useTableControls(orderItems, { searchKeys: ['Product.name'] });
  const petsTable = useTableControls(pets, { searchKeys: ['name', 'breed', 'species'] });

  useEffect(() => {
    const fetchVets = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, config);
        const onlyVets = res.data
          .filter(user => user.role === 'veterinarian' && user.Veterinarian)
          .map(user => ({
            id: user.Veterinarian.id,
            userId: user.id,
            name: user.name
          }));
        setVets(onlyVets);
      } catch (err) {
        console.error('Error fetching veterinarians:', err);
        showMessage('Error fetching veterinarians.', 'error');
      }
    };

    const fetchData = async () => {
      try {
        await fetchVets();

        const [adoptionsRes, appointmentsRes, recordsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/adoption/my-adoptions`, config),
          axios.get(`${process.env.REACT_APP_API_URL}/api/appointments/my-appointments`, config),
          axios.get(`${process.env.REACT_APP_API_URL}/api/records/my-records`, config)
        ]);

        const adoptionsData = adoptionsRes.data.adoptions || [];
        setAdoptions(adoptionsData);
        setAppointments(appointmentsRes.data.appointments || []);
        setRecords(recordsRes.data || []);

        const adoptedPets = adoptionsData
          .map(a => a.Pet)
          .filter(p => p && p.id);
        setPets(adoptedPets);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        showMessage("We couldn't load some of your dashboard data. Please refresh the page.", 'error');
      }

      try {
        const orderItemsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/order-items/user/${userId}`, config);
        setOrderItems(orderItemsRes.data || []);
      } catch (error) {
        // A 404 here just means the user has no orders yet — not an application error.
        if (error.response?.status !== 404) {
          console.error('Error loading orders:', error);
        }
        setOrderItems([]);
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (!newAppointment.date || !newAppointment.vetUserId) {
        setAvailableTimes([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/slots/available`, {
          params: {
            date: newAppointment.date,
            userId: newAppointment.vetUserId,
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        const slots = Array.isArray(res.data.slots) ? res.data.slots : [];
        setAvailableTimes(slots);
      } catch (error) {
        console.error('Error fetching available times:', error);
        showMessage('Error fetching  available times:.', 'error');
        setAvailableTimes([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableTimes();
  }, [newAppointment.date, newAppointment.vetUserId]);

  const handleAddAppointment = async () => {
    if (!newAppointment.slotId) {
      showMessage('Please select a valid slot.', 'error');
      return;
    }

    const payload = {
      date: newAppointment.date,
      time: newAppointment.time,
      reason: newAppointment.reason,
      petId: newAppointment.petId,
      veterinarianId: newAppointment.veterinarianId,
      slotId: newAppointment.slotId,
    };

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/appointments`, payload, config);

      const appointmentsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/appointments/my-appointments`, config);
      setAppointments(appointmentsRes.data.appointments || []);

      setBookingConfirmed({
        petName: pets.find(p => p.id === newAppointment.petId)?.name || '',
        vetName: vets.find(v => v.id === newAppointment.veterinarianId)?.name || '',
        date: newAppointment.date,
        time: newAppointment.time,
      });
      setNewAppointment({
        date: '',
        time: '',
        reason: '',
        petId: '',
        veterinarianId: '',
        vetUserId: '',
        slotId: ''
      });

      showMessage('Appointment created successfully.');
    } catch (error) {
      console.error('Error creating appointment:', error);
      showMessage('Error creating appointment', 'error');
    }
  };

  const handleCloseAppointmentModal = () => {
    setOpenAddAppointment(false);
    setBookingConfirmed(null);
  };

  const formatTimeHHMM = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(Number(hours), Number(minutes));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTime = (time) => {
    if (!time) return '';
    if (time.includes('T')) {
      const date = new Date(time);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return formatTimeHHMM(time);
  };

  const isUpcoming = (dateStr) => {
    if (!dateStr) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr) >= today;
  };

  const handleDeleteAppointment = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/appointments/${id}`, config);
      setAppointments(appointments.filter((a) => a.id !== id));
      showMessage('Appointment deleted successfully.');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      showMessage('Error deleting appointment.', 'error');
    }
  };

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/users`, config)
      .then(res => {
        const filteredUsers = res.data.filter(user => user.id !== userId);
        setUsers(filteredUsers);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        showMessage('Error fetching users.', 'error');
      });
  }, [userId]);

  const selectUserForChat = async (user) => {
    setSelectedChatUser(user);

    if (userIdToChatId[user.id]) {
      const chatId = userIdToChatId[user.id];
      setActiveChatId(chatId);
      if (!chatMessages[chatId]) {
        fetchMessages(chatId);
      }
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/chat`, {
        userId: userId,
        userId2: user.id
      }, config);

      const chatId = res.data._id;

      setUserIdToChatId(prev => ({ ...prev, [user.id]: chatId }));
      setActiveChatId(chatId);

      if (!chatMessages[chatId]) {
        fetchMessages(chatId);
      }
    } catch (error) {
      console.error('Error accessing chat:', error);
    }
  };

  const fetchAllChats = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/chat`, config);
      const mapping = {};
      res.data.forEach(chat => {
        const otherUserId = chat.users.find(id => id !== userId);
        mapping[otherUserId] = chat._id;
      });
      setUserIdToChatId(mapping);
    } catch (err) {
      console.error('Error fetching chats:', err);
    }
  };

  useEffect(() => {
    fetchAllChats();
  }, []);

  useEffect(() => {
    if (activeChatId) {
      const interval = setInterval(() => fetchMessages(activeChatId), 5000);
      return () => clearInterval(interval);
    } else {
      setChatMessages([]);
    }
  }, [activeChatId]);

  const fetchMessages = async (chatId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/message/${chatId}`, config);
      setChatMessages(prev => ({
        ...prev,
        [chatId]: res.data || []
      }));
      scrollToBottom();
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChatId) return;
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/message`, {
        chatId: activeChatId,
        content: newMessage.trim(),
      }, config);
      setNewMessage('');
      setChatMessages(prev => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] || []), res.data]
      }));
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleAddReview = async () => {
    if (!newReview.rating) {
      showMessage('Please provide a rating.', 'error');
      return;
    }

    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/order-items/user/${userId}`, config);
      const userOrderItems = res.data || [];

      const hasPurchased = userOrderItems.some(item => item.productId === selectedProductId);

      if (!hasPurchased) {
        showMessage('You can only review products you have purchased.', 'error');
        return;
      }

      await axios.post(`${process.env.REACT_APP_API_URL}/api/reviews`, {
        productId: selectedProductId,
        rating: newReview.rating,
        comment: newReview.comment
      }, config);

      setOpenAddReview(false);
      setNewReview({ rating: '', comment: '' });
      setSelectedProductId('');
      showMessage('Review added successfully.');
    } catch (error) {
      console.error('Error submitting review:', error);
      showMessage('Error submitting review', 'error');
    }
  };

  const uniqueOrderItems = Array.from(
    new Map(orderItems.map((item) => [item.productId, item])).values()
  );

  const handleCloseForm = () => {
    setOpenAddPet(false);
    setFormData({
      name: '', breed: '', age: '', description: '',
      gender: '', type: ''
    });
    setImageFile(null);
    setLogNote('');
    setIsUploaded(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const petRes = await axios.post(`${process.env.REACT_APP_API_URL}/api/pets`, formData, config);
      const newPetId = petRes.data.id;

      if (imageFile) {
        const imgForm = new FormData();
        imgForm.append('image', imageFile);
        await axios.post(`${process.env.REACT_APP_API_URL}/api/pets/${newPetId}/image`, imgForm, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (logNote.trim()) {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/pet-logs/${newPetId}`, {
          petId: newPetId,
          note: logNote
        });
      }

      showMessage('Pet added successfully!');
      handleCloseForm();
    } catch (err) {
      console.error('Error adding pet:', err);
      showMessage('Something went wrong while adding the pet.', 'error');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderChat = () => (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: { xs: 'auto', md: '70vh' }, width: '100%', maxWidth: 1000, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, p: 2 }}>
      <Box sx={{ width: { xs: '100%', md: 250 }, maxHeight: { xs: 160, md: 'none' }, borderRight: { xs: 'none', md: '1px solid' }, borderBottom: { xs: '1px solid', md: 'none' }, borderColor: 'divider', overflowY: 'auto' }}>
        <Typography variant="subtitle1" sx={{ p: 1.5, fontWeight: 700 }}>
          Users
        </Typography>
        {users.map(user => (
          <Box
            key={user.id}
            sx={{
              p: 1.5,
              cursor: 'pointer',
              bgcolor: selectedChatUser?.id === user.id ? 'primary.light' : 'transparent',
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:hover': { bgcolor: 'action.hover' }
            }}
            onClick={() => selectUserForChat(user)}
          >
            {user.name || user.email}
          </Box>
        ))}
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: { xs: '60vh', md: '100%' }, minWidth: 0, pl: { xs: 0, md: 2 }, pt: { xs: 2, md: 0 } }}>
        <Typography variant="h6" gutterBottom>
          {selectedChatUser ? `Chat with ${selectedChatUser.username || selectedChatUser.email}` : 'Select a user to start chatting'}
        </Typography>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, border: '1px solid', borderColor: 'divider', p: 1.5, borderRadius: 1, bgcolor: 'background.default' }}>
          {(chatMessages[activeChatId] || []).length === 0 ? (
            <EmptyState compact title="No messages yet" description="Say hi to start the conversation." />
          ) : (
            (chatMessages[activeChatId] || []).map((msg, index) => {
              const isSender = msg.sender === userId;
              const senderName = isSender ? 'You' : (selectedChatUser?.username || selectedChatUser?.email || 'User');

              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isSender ? 'flex-end' : 'flex-start',
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      mb: 0.5,
                      fontWeight: 500,
                      alignSelf: isSender ? 'flex-end' : 'flex-start',
                      pr: isSender ? 1 : 0,
                      pl: isSender ? 0 : 1,
                    }}
                  >
                    {senderName}
                  </Typography>

                  <Box
                    sx={{
                      display: 'inline-block',
                      bgcolor: isSender ? 'primary.main' : 'background.default',
                      color: isSender ? 'primary.contrastText' : 'text.primary',
                      border: isSender ? 'none' : '1px solid',
                      borderColor: 'divider',
                      p: 1.5,
                      borderRadius: 2,
                      maxWidth: '70%',
                      wordWrap: 'break-word',
                    }}
                  >
                    <Typography variant="body2">{msg.content}</Typography>
                    <Typography variant="caption" display="block" sx={{ fontSize: 10, mt: 0.5, opacity: 0.8 }}>
                      {msg.timestamp}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box component="form" onSubmit={(e) => { e.preventDefault(); sendMessage(); }} sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            size="small"
          />
          <Button variant="contained" onClick={sendMessage} endIcon={<SendIcon />}>
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );

  const renderTable = () => {
    switch (selectedTab) {
      case 'adoptions':
        return (
          <Box sx={{ width: { xs: '100%', sm: '90%' }, maxWidth: 900, minWidth: 0 }}>
            <TableToolbar
              title="My Adoptions"
              search={adoptionsTable.search}
              onSearchChange={adoptionsTable.setSearch}
              searchPlaceholder="Search by pet name..."
            />
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Adoption ID</TableCell>
                    <TableCell>Pet Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {adoptionsTable.pageRows.length === 0 ? (
                    <TableRow><TableCell colSpan={2}><EmptyState title="No adoptions yet" description="Pets you adopt will show up here." /></TableCell></TableRow>
                  ) : (
                    adoptionsTable.pageRows.map((adoption) => (
                      <TableRow key={adoption.id} hover>
                        <TableCell>{adoption.id}</TableCell>
                        <TableCell>{adoption.Pet?.name || 'Unknown'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={adoptionsTable.filteredCount}
                page={adoptionsTable.page}
                onPageChange={(_, p) => adoptionsTable.setPage(p)}
                rowsPerPage={adoptionsTable.rowsPerPage}
                onRowsPerPageChange={(e) => adoptionsTable.setRowsPerPage(Number(e.target.value))}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </TableContainer>
          </Box>
        );

      case 'appointments':
        return (
          <Box sx={{ width: { xs: '100%', sm: '90%' }, maxWidth: 900, minWidth: 0 }}>
            <TableToolbar
              title="My Appointments"
              search={appointmentsTable.search}
              onSearchChange={appointmentsTable.setSearch}
              searchPlaceholder="Search by pet, vet, reason..."
            />
            {/* Compact card layout on phones — the 7-column table below doesn't fit
                a phone screen without cutting columns off, so mobile gets the same
                data/actions rendered as a stacked list instead. Desktop/tablet
                (sm+) keep the original table+pagination exactly as before. */}
            <Paper variant="outlined" sx={{ display: { xs: 'block', sm: 'none' } }}>
              {appointmentsTable.pageRows.length === 0 ? (
                <EmptyState title="No appointments yet" description="Book your pet's first visit." />
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 1.5 }}>
                  {appointmentsTable.pageRows.map((a) => (
                    <Paper key={a.id} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2">{a.Slot?.date || 'N/A'} · {formatTime(a.Slot?.startTime)}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {a.Pet?.name || 'N/A'} with {a.Veterinarian?.User?.name || vets.find(v => v.id === a.veterinarianId)?.name || 'Unknown'}
                          </Typography>
                        </Box>
                        {isUpcoming(a.Slot?.date) ? (
                          <StatusChip status="active" label="Upcoming" />
                        ) : (
                          <StatusChip status="completed" label="Past" />
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1.5 }}>{a.reason || 'N/A'}</Typography>
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteAppointment(a.id)}>
                        Cancel
                      </Button>
                    </Paper>
                  ))}
                </Box>
              )}
              <Box sx={{ overflowX: 'auto' }}>
                <TablePagination
                  component="div"
                  count={appointmentsTable.filteredCount}
                  page={appointmentsTable.page}
                  onPageChange={(_, p) => appointmentsTable.setPage(p)}
                  rowsPerPage={appointmentsTable.rowsPerPage}
                  onRowsPerPageChange={(e) => appointmentsTable.setRowsPerPage(Number(e.target.value))}
                  rowsPerPageOptions={[5, 10, 25]}
                  labelRowsPerPage=""
                  sx={{
                    width: 'max-content',
                    minWidth: '100%',
                    '& .MuiTablePagination-toolbar': { pl: 1, pr: 0.5 },
                    '& .MuiTablePagination-spacer': { flex: '0 0 8px' },
                  }}
                />
              </Box>
            </Paper>

            <TableContainer component={Paper} sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Pet</TableCell>
                    <TableCell>Veterinarian</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointmentsTable.pageRows.length === 0 ? (
                    <TableRow><TableCell colSpan={7}><EmptyState title="No appointments yet" description="Book your pet's first visit." /></TableCell></TableRow>
                  ) : (
                    appointmentsTable.pageRows.map((a) => (
                      <TableRow key={a.id} hover>
                        <TableCell>{a.Slot?.date || 'N/A'}</TableCell>
                        <TableCell>{formatTime(a.Slot?.startTime)}</TableCell>
                        <TableCell>{a.Pet?.name || 'N/A'}</TableCell>
                        <TableCell>{a.Veterinarian?.User?.name || vets.find(v => v.id === a.veterinarianId)?.name || 'Unknown'}</TableCell>
                        <TableCell>{a.reason || 'N/A'}</TableCell>
                        <TableCell>
                          {isUpcoming(a.Slot?.date) ? (
                            <StatusChip status="active" label="Upcoming" />
                          ) : (
                            <StatusChip status="completed" label="Past" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteAppointment(a.id)}>
                            Cancel
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={appointmentsTable.filteredCount}
                page={appointmentsTable.page}
                onPageChange={(_, p) => appointmentsTable.setPage(p)}
                rowsPerPage={appointmentsTable.rowsPerPage}
                onRowsPerPageChange={(e) => appointmentsTable.setRowsPerPage(Number(e.target.value))}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </TableContainer>
          </Box>
        );

      case 'records':
        return (
          <Box sx={{ width: { xs: '100%', sm: '90%' }, maxWidth: 900, minWidth: 0 }}>
            <TableToolbar
              title="My Medical Records"
              search={recordsTable.search}
              onSearchChange={recordsTable.setSearch}
              searchPlaceholder="Search by pet, diagnosis, treatment..."
            />
            {/* Compact card layout on phones — same reasoning as the appointments
                tab above: a 6-column table doesn't fit a phone screen. Desktop/
                tablet (sm+) keep the original table+pagination unchanged. */}
            <Paper variant="outlined" sx={{ display: { xs: 'block', sm: 'none' } }}>
              {recordsTable.pageRows.length === 0 ? (
                <EmptyState title="No records yet" description="Your pet's medical history will show up here." />
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 1.5 }}>
                  {recordsTable.pageRows.map((record) => (
                    <Paper key={record.id} variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2">
                        {record.date} · {record.Pet?.name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {record.Veterinarian?.User?.name || vets.find(v => v.id === record.veterinarianId)?.name || 'Unknown'}
                      </Typography>
                      <Typography variant="body2"><strong>Diagnosis:</strong> {record.diagnosis}</Typography>
                      <Typography variant="body2"><strong>Treatment:</strong> {record.treatment}</Typography>
                      {record.notes && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Notes:</strong> {record.notes}</Typography>
                      )}
                    </Paper>
                  ))}
                </Box>
              )}
              <Box sx={{ overflowX: 'auto' }}>
                <TablePagination
                  component="div"
                  count={recordsTable.filteredCount}
                  page={recordsTable.page}
                  onPageChange={(_, p) => recordsTable.setPage(p)}
                  rowsPerPage={recordsTable.rowsPerPage}
                  onRowsPerPageChange={(e) => recordsTable.setRowsPerPage(Number(e.target.value))}
                  rowsPerPageOptions={[5, 10, 25]}
                  labelRowsPerPage=""
                  sx={{
                    width: 'max-content',
                    minWidth: '100%',
                    '& .MuiTablePagination-toolbar': { pl: 1, pr: 0.5 },
                    '& .MuiTablePagination-spacer': { flex: '0 0 8px' },
                  }}
                />
              </Box>
            </Paper>

            <TableContainer component={Paper} sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Diagnosis</TableCell>
                    <TableCell>Treatment</TableCell>
                    <TableCell>Pet</TableCell>
                    <TableCell>Veterinarian</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recordsTable.pageRows.length === 0 ? (
                    <TableRow><TableCell colSpan={6}><EmptyState title="No records yet" description="Your pet's medical history will show up here." /></TableCell></TableRow>
                  ) : (
                    recordsTable.pageRows.map((record) => (
                      <TableRow key={record.id} hover>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.notes}</TableCell>
                        <TableCell>{record.diagnosis}</TableCell>
                        <TableCell>{record.treatment}</TableCell>
                        <TableCell>{record.Pet?.name || 'N/A'}</TableCell>
                        <TableCell>{record.Veterinarian?.User?.name || vets.find(v => v.id === record.veterinarianId)?.name || 'Unknown'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={recordsTable.filteredCount}
                page={recordsTable.page}
                onPageChange={(_, p) => recordsTable.setPage(p)}
                rowsPerPage={recordsTable.rowsPerPage}
                onRowsPerPageChange={(e) => recordsTable.setRowsPerPage(Number(e.target.value))}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </TableContainer>
          </Box>
        );

      case 'orders':
        return (
          <Box sx={{ width: { xs: '100%', sm: '90%' }, maxWidth: 900, minWidth: 0 }}>
            <TableToolbar
              title="My Orders"
              search={ordersTable.search}
              onSearchChange={ordersTable.setSearch}
              searchPlaceholder="Search by product..."
            />
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ordersTable.pageRows.length === 0 ? (
                    <TableRow><TableCell colSpan={2}><EmptyState title="No orders yet" description="Items you buy will show up here." /></TableCell></TableRow>
                  ) : (
                    ordersTable.pageRows.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.Product?.name || 'Unknown'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={ordersTable.filteredCount}
                page={ordersTable.page}
                onPageChange={(_, p) => ordersTable.setPage(p)}
                rowsPerPage={ordersTable.rowsPerPage}
                onRowsPerPageChange={(e) => ordersTable.setRowsPerPage(Number(e.target.value))}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </TableContainer>
          </Box>
        );

      case 'pets':
        return (
          <Box sx={{ width: { xs: '100%', sm: '90%' }, maxWidth: 900, minWidth: 0 }}>
            <TableToolbar
              title="My Pets"
              search={petsTable.search}
              onSearchChange={petsTable.setSearch}
              searchPlaceholder="Search by name, breed..."
            />
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Pet ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Species</TableCell>
                    <TableCell>Breed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {petsTable.pageRows.length === 0 ? (
                    <TableRow><TableCell colSpan={4}><EmptyState title="No pets yet" /></TableCell></TableRow>
                  ) : (
                    petsTable.pageRows.map((pet) => (
                      <TableRow key={pet.id} hover>
                        <TableCell>{pet.id}</TableCell>
                        <TableCell>{pet.name}</TableCell>
                        <TableCell>{pet.species}</TableCell>
                        <TableCell>{pet.breed}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={petsTable.filteredCount}
                page={petsTable.page}
                onPageChange={(_, p) => petsTable.setPage(p)}
                rowsPerPage={petsTable.rowsPerPage}
                onRowsPerPageChange={(e) => petsTable.setRowsPerPage(Number(e.target.value))}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </TableContainer>
          </Box>
        );
      case 'chat': return renderChat();
      default:
        return null;
    }
  };

  const userrole = getCurrentRole();

  if (userrole !== 'user') {
    return (
      <div className="text-center mt-5">
        <h2>Unauthorized: You do not have access to this page.</h2>
        <p>
          Click <a href="/">here</a> to go to the homepage or <a href="/login">here</a> to sign in.
        </p>
      </div>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        maxWidth: '100vw',
        overflowX: 'hidden',
        backgroundImage: `url(${petsBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flexShrink: 0 }}>
            {!isDesktop && (
              <IconButton edge="start" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap component="div">
              My Account
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, minWidth: 0 }}>
            <Typography variant="body2" noWrap component="div" color="text.secondary" sx={{ minWidth: 0 }}>
              {userEmail}
            </Typography>
            <Button component={RouterLink} to="/" variant="outlined" size="small">
              Home
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <UserSidebar
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        setOpenAddAppointment={setOpenAddAppointment}
        setOpenAddReview={setOpenAddReview}
        setOpenAddPet={setOpenAddPet}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: { xs: 2, sm: 3 },
          mt: 8,
          bgcolor: 'rgba(246, 244, 242, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {renderTable()}

        <Modal open={openAddAppointment} onClose={handleCloseAppointmentModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              width: 440,
              maxWidth: '92vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: 2,
            }}
          >
            {bookingConfirmed ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <StatusChip status="confirmed" label="Booked" />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Appointment confirmed
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {bookingConfirmed.petName} with {bookingConfirmed.vetName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {bookingConfirmed.date} at {formatTimeHHMM(bookingConfirmed.time)}
                </Typography>
                <Button variant="contained" sx={{ mt: 3 }} onClick={handleCloseAppointmentModal}>
                  Done
                </Button>
              </Box>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Book an Appointment
                </Typography>

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>1. Pet &amp; Veterinarian</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControl sx={{ flex: 1, minWidth: 160 }}>
                    <InputLabel id="pet-select-label">Pet</InputLabel>
                    <Select
                      labelId="pet-select-label"
                      value={newAppointment.petId}
                      onChange={(e) => setNewAppointment({ ...newAppointment, petId: e.target.value })}
                      label="Pet"
                    >
                      {pets.map((pet) => (
                        <MenuItem key={pet.id} value={pet.id}>{pet.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl sx={{ flex: 1, minWidth: 160 }}>
                    <InputLabel id="vet-select-label">Veterinarian</InputLabel>
                    <Select
                      labelId="vet-select-label"
                      value={newAppointment.veterinarianId}
                      onChange={(e) => {
                        const selectedVet = vets.find(v => v.id === e.target.value);
                        setNewAppointment({
                          ...newAppointment,
                          veterinarianId: selectedVet?.id,
                          vetUserId: selectedVet?.userId,
                          date: newAppointment.date,
                          time: '',
                          slotId: '',
                        });
                      }}
                      label="Veterinarian"
                    >
                      {vets.map((vet) => (
                        <MenuItem key={vet.id} value={vet.id}>{vet.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>2. Date</Typography>
                <Box sx={{ opacity: newAppointment.veterinarianId ? 1 : 0.5, pointerEvents: newAppointment.veterinarianId ? 'auto' : 'none' }}>
                  <TextField
                    name="date"
                    type="date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                    helperText={!newAppointment.veterinarianId ? 'Choose a veterinarian first' : ' '}
                  />
                </Box>

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>3. Time</Typography>
                <Box sx={{ opacity: newAppointment.date && newAppointment.veterinarianId ? 1 : 0.5, pointerEvents: newAppointment.date && newAppointment.veterinarianId ? 'auto' : 'none' }}>
                  <TimeSlotPicker
                    slots={availableTimes}
                    selectedSlotId={newAppointment.slotId}
                    loading={loadingSlots}
                    disabledHint={!newAppointment.date || !newAppointment.veterinarianId ? 'Choose a veterinarian and date first' : null}
                    onSelect={(slot) => setNewAppointment({ ...newAppointment, time: slot.startTime, slotId: slot.id })}
                  />
                </Box>

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>4. Reason</Typography>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  placeholder="Briefly describe the reason for the visit"
                  value={newAppointment.reason}
                  onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button variant="outlined" color="inherit" onClick={handleCloseAppointmentModal}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleAddAppointment} disabled={!newAppointment.slotId}>
                    Confirm Appointment
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>
      </Box>

      <Modal open={openAddReview} onClose={() => setOpenAddReview(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            width: 400,
            maxWidth: '92vw',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="h6">Add a Review</Typography>

          <FormControl fullWidth>
            <InputLabel id="product-select-label">Product</InputLabel>
            <Select
              labelId="product-select-label"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              label="Product"
            >
              {uniqueOrderItems.map((item) => (
                <MenuItem key={item.productId} value={item.productId}>
                  {item.Product?.name || 'Unnamed Product'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            type="number"
            label="Rating (1-5)"
            value={newReview.rating}
            onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
            inputProps={{ min: 1, max: 5 }}
          />

          <TextField
            label="Comment"
            multiline
            rows={3}
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
          />

          <Button variant="contained" onClick={handleAddReview}>
            Submit Review
          </Button>
        </Box>
      </Modal>

      <Snackbar
        open={message.open}
        autoHideDuration={3000}
        onClose={handleCloseMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseMessage} severity={message.severity} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>

      <Dialog open={openAddPet} onClose={handleCloseForm}>
        <DialogTitle>Add New Pet</DialogTitle>
        <DialogContent>
          <TextField name="name" label="Name" fullWidth margin="normal" value={formData.name} onChange={handleFormChange} />
          <TextField name="breed" label="Breed" fullWidth margin="normal" value={formData.breed} onChange={handleFormChange} />
          <TextField name="age" label="Age" type="number" fullWidth margin="normal" value={formData.age} onChange={handleFormChange} />

          <FormControl fullWidth margin="normal">
            <InputLabel>Gender</InputLabel>
            <Select name="gender" value={formData.gender} label="Gender" onChange={handleFormChange}>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select name="type" value={formData.type} label="Type" onChange={handleFormChange}>
              <MenuItem value="Dog">Dog</MenuItem>
              <MenuItem value="Cat">Cat</MenuItem>
              <MenuItem value="Parrot">Parrot</MenuItem>
              <MenuItem value="Turtle">Turtle</MenuItem>
            </Select>
          </FormControl>

          <TextField name="description" label="Description" fullWidth multiline rows={2} margin="normal" value={formData.description} onChange={handleFormChange} />

          <TextField
            label="Log Note (optional)"
            fullWidth
            multiline
            rows={2}
            margin="normal"
            value={logNote}
            onChange={(e) => setLogNote(e.target.value)}
          />

          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              {imageFile ? 'Image selected:' : 'No image selected'}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button variant="contained" component="label">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImageFile(file);
                      setIsUploaded(true);
                    } else {
                      setIsUploaded(false);
                    }
                  }}
                />
              </Button>

              {imageFile && <StatusChip status="active" label="Selected" size="small" />}
            </Box>

            {imageFile && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {imageFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" onClick={() => handleCloseForm()}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDash;
