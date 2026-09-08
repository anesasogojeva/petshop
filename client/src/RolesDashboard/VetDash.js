import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, AppBar, Toolbar, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Paper, TextField, Button, Grid,
  Modal, Fade, Backdrop, Snackbar, Alert
} from '@mui/material';
import axios from 'axios';
import UserSidebar from './VetsSide';
import petsBg from '../images/pet9.jpg';
import { jwtDecode } from 'jwt-decode';
import { MenuItem } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EmptyState from '../components/shared/EmptyState';
import StatusChip from '../components/shared/StatusChip';
import StatCard from '../components/shared/StatCard';
import UnauthorizedState from '../components/shared/UnauthorizedState';
import TableToolbar from '../components/shared/TableToolbar';
import useTableControls from '../hooks/useTableControls';
import { getCurrentRole } from '../utils/auth';
import EventNoteIcon from '@mui/icons-material/EventNote';
import FolderSharedIcon from '@mui/icons-material/FolderShared';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  maxWidth: '90vw',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const VetDash = () => {
  const [selectedTab, setSelectedTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRecord, setNewRecord] = useState({ date: '', notes: '', diagnosis: '', treatment: '', userId: '', petId: '' });

  const [selectedDate, setSelectedDate] = useState('');
  const [users, setUsers] = useState([]);
  const [adoptedPets, setAdoptedPets] = useState([]);

  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [userIdToChatId, setUserIdToChatId] = useState({});
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

  const token = localStorage.getItem('accessToken');
  const decodedToken = jwtDecode(token);
  const userID = decodedToken.id;
  const userEmail = decodedToken.email;
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const appointmentsTable = useTableControls(appointments, { searchKeys: ['Pet.name', 'reason'] });
  const recordsTable = useTableControls(records, { searchKeys: ['Pet.name', 'User.name', 'diagnosis'] });
  const slotsTable = useTableControls(availableSlots, { searchKeys: ['date', 'startTime'] });

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchAvailableSlots(); }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, recordsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/appointments/my-appointments', config),
        axios.get('http://localhost:5000/api/records/my-records', config)
      ]);
      setAppointments(appointmentsRes.data.appointments || []);
      setRecords(recordsRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = () => {
    axios.get('http://localhost:5000/api/users', config)
      .then(res => {
        const petOwners = res.data.filter(user => user.role === 'user');
        setUsers(petOwners);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        showMessage('Error fetching users.', 'error');
      });
  };

  useEffect(() => {
    if (newRecord.userId) {
      axios.get(`http://localhost:5000/api/adoption/user/${newRecord.userId}`, config)
        .then(res => {
          const pets = res.data.adoptions.map(adoption => adoption.Pet);
          setAdoptedPets(pets);
        })
        .catch(err => {
          console.error('Error fetching adopted pets:', err);
          showMessage('Error fetching adopted pets.', 'error');
          setAdoptedPets([]);
        });
    } else {
      setAdoptedPets([]);
      setNewRecord(prev => ({ ...prev, petId: '' }));
    }
  }, [newRecord.userId]);

  const fetchRecords = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/records/my-records', config);
      setRecords(res.data || []);
    } catch (err) {
      console.error('Error fetching records:', err);
      showMessage('Error fetching records.', 'error');
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const fetchAvailableSlots = async () => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:5000/api/slots/available?date=${selectedDate}&userId=${userID}`, config
      );
      setAvailableSlots(res.data.slots || []);
    } catch (err) {
      console.error('Error fetching available slots:', err);
      showMessage('Error fetching available slots.', 'error');
    }
  };

  const handleCreateRecord = async () => {
    try {
      await axios.post('http://localhost:5000/api/records', { ...newRecord }, config);
      setNewRecord({ date: '', notes: '', diagnosis: '', treatment: '', userId: '', petId: '' });
      setRecordModalOpen(false);
      fetchRecords();
      showMessage('Record created successfully.');
    } catch (err) {
      console.error('Error creating record:', err);
      showMessage('Error creating record.', 'error');
    }
  };

  const handleCreateSlots = async () => {
    if (!selectedDate) return;
    try {
      await axios.post(
        'http://localhost:5000/api/slots/create',
        { userId: userID, date: selectedDate },
        config
      );
      setSlotModalOpen(false);
      fetchAvailableSlots();
      showMessage('Slots added successfully.');
    } catch (err) {
      console.error('Error creating slots:', err);
      showMessage('Error creating slots.', 'error');
    }
  };

  useEffect(() => {
    const savedDate = localStorage.getItem('selectedDate');
    if (savedDate) {
      setSelectedDate(savedDate);
    }
  }, []);

  const handleDeleteAppointment = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/appointments/${id}`, config);
      setAppointments(appointments.filter((a) => a.id !== id));
      showMessage('Appointment deleted successfully.');
    } catch (error) {
      console.error('Error deleting appointment:', error.response?.data || error.message);
      showMessage('Error deleting appointment.', 'error');
    }
  };

  const handleDeleteRecord = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/records/${id}`, config);
      fetchRecords();
      showMessage('Record deleted successfully.');
    } catch (err) {
      console.error('Error deleting record:', err);
      showMessage('Error deleting record.', 'error');
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    localStorage.setItem('selectedDate', e.target.value);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'userId' ? { petId: '' } : {})
    }));
  };

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
      const res = await axios.post('http://localhost:5000/api/chat', {
        userId: userID,
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
      const res = await axios.get('http://localhost:5000/api/chat', config);
      const mapping = {};
      res.data.forEach(chat => {
        const otherUserId = chat.users.find(id => id !== userID);
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
      const res = await axios.get(`http://localhost:5000/api/message/${chatId}`, config);
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
      const res = await axios.post('http://localhost:5000/api/message', {
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderChat = () => (
    <Box sx={{ display: 'flex', height: '70vh', width: '100%', maxWidth: 1000, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, p: 2 }}>
      <Box sx={{ width: 250, borderRight: '1px solid', borderColor: 'divider', overflowY: 'auto' }}>
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

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', pl: 2 }}>
        <Typography variant="h6" gutterBottom>
          {selectedChatUser ? `Chat with ${selectedChatUser.username || selectedChatUser.email}` : 'Select a user to start chatting'}
        </Typography>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, border: '1px solid', borderColor: 'divider', p: 1.5, borderRadius: 1, bgcolor: 'background.default' }}>
          {(chatMessages[activeChatId] || []).length === 0 ? (
            <EmptyState compact title="No messages yet" description="Say hi to start the conversation." />
          ) : (
            (chatMessages[activeChatId] || []).map((msg, index) => {
              const isSender = msg.sender === userID;
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

  const renderSection = () => {
    switch (selectedTab) {
      case 'appointments':
        return (
          <Box sx={{ width: '100%', maxWidth: 1000 }}>
            <TableToolbar
              title="My Appointments"
              search={appointmentsTable.search}
              onSearchChange={appointmentsTable.setSearch}
              searchPlaceholder="Search by pet, reason..."
            />
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Reason</TableCell>
                    <TableCell>Pet</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointmentsTable.pageRows.length === 0 ? (
                    <TableRow><TableCell colSpan={5}><EmptyState icon={EventNoteIcon} title="No appointments" description="Your upcoming appointments will show up here." /></TableCell></TableRow>
                  ) : (
                    appointmentsTable.pageRows.map((appt) => (
                      <TableRow key={appt.id} hover>
                        <TableCell>{appt.reason}</TableCell>
                        <TableCell>{appt.Pet?.name || 'N/A'}</TableCell>
                        <TableCell>{appt.Slot?.date || 'N/A'}</TableCell>
                        <TableCell>{appt.Slot?.startTime}</TableCell>
                        <TableCell align="right">
                          <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteAppointment(appt.id)}>
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
          <Box sx={{ width: '100%', maxWidth: 1000 }}>
            <TableToolbar
              title="Medical Records"
              search={recordsTable.search}
              onSearchChange={recordsTable.setSearch}
              searchPlaceholder="Search by pet, owner, diagnosis..."
            />
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Diagnosis</TableCell>
                    <TableCell>Treatment</TableCell>
                    <TableCell>Pet</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recordsTable.pageRows.length === 0 ? (
                    <TableRow><TableCell colSpan={7}><EmptyState icon={FolderSharedIcon} title="No records yet" description="Records you create will show up here." /></TableCell></TableRow>
                  ) : (
                    recordsTable.pageRows.map((record) => (
                      <TableRow key={record.id} hover>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.notes}</TableCell>
                        <TableCell>{record.diagnosis}</TableCell>
                        <TableCell>{record.treatment}</TableCell>
                        <TableCell>{record.Pet?.name}</TableCell>
                        <TableCell>{record.User?.name}</TableCell>
                        <TableCell align="right">
                          <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteRecord(record.id)}>
                            Delete
                          </Button>
                        </TableCell>
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

      case 'slots':
        return (
          <Box sx={{ width: '100%', maxWidth: 700 }}>
            <TableToolbar
              title="Available Slots"
              search={slotsTable.search}
              onSearchChange={slotsTable.setSearch}
              searchPlaceholder="Search by date, time..."
            />
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>End Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {slotsTable.pageRows.length === 0 ? (
                    <TableRow><TableCell colSpan={4}><EmptyState title="No slots for this date" description="Pick a date and add slots from the sidebar." /></TableCell></TableRow>
                  ) : (
                    slotsTable.pageRows.map((slot) => (
                      <TableRow key={slot.id} hover>
                        <TableCell>{slot.date}</TableCell>
                        <TableCell>{slot.startTime}</TableCell>
                        <TableCell>{slot.endTime}</TableCell>
                        <TableCell>
                          {slot.isBooked ? <StatusChip status="booked" /> : <StatusChip status="available" />}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={slotsTable.filteredCount}
                page={slotsTable.page}
                onPageChange={(_, p) => slotsTable.setPage(p)}
                rowsPerPage={slotsTable.rowsPerPage}
                onRowsPerPageChange={(e) => slotsTable.setRowsPerPage(Number(e.target.value))}
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

  const userRole = getCurrentRole();
  if (userRole !== 'veterinarian') return <UnauthorizedState />;

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      backgroundImage: `url(${petsBg})`,
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed'
    }}>
      <UserSidebar
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        appointments={appointments}
        records={records}
        onOpenRecordModal={() => setRecordModalOpen(true)}
        onOpenSlotModal={() => setSlotModalOpen(true)}
      />

      <Box component="main" sx={{
        flexGrow: 1,
        p: 3,
        mt: 8,
        bgcolor: 'rgba(246, 244, 242, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6">Veterinarian Dashboard</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {userEmail}
            </Typography>
          </Toolbar>
        </AppBar>

        <Grid container spacing={2} sx={{ mb: 2, width: '100%', maxWidth: 1000 }}>
          <Grid item xs={12} sm={6}>
            <StatCard icon={EventNoteIcon} label="Total Appointments" value={appointments.length} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatCard icon={FolderSharedIcon} label="Total Medical Records" value={records.length} accent="secondary" />
          </Grid>
        </Grid>

        {loading ? (
          <Typography color="text.secondary">Loading...</Typography>
        ) : (
          renderSection()
        )}
      </Box>

      <Modal
        open={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={recordModalOpen}>
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom>Add Medical Record</Typography>

            {['date', 'notes', 'diagnosis', 'treatment'].map((field) => (
              <TextField
                key={field}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                type={field === 'date' ? 'date' : 'text'}
                value={newRecord[field]}
                onChange={(e) => setNewRecord({ ...newRecord, [field]: e.target.value })}
                fullWidth
                margin="normal"
                InputLabelProps={field === 'date' ? { shrink: true } : {}}
              />
            ))}

            <TextField
              margin="normal"
              select
              label="User (Pet Owner)"
              name="userId"
              fullWidth
              value={newRecord.userId}
              onChange={handleFormChange}
            >
              <MenuItem value="">Select User</MenuItem>
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
              ))}
            </TextField>

            <TextField
              margin="normal"
              select
              label="Pet"
              name="petId"
              fullWidth
              value={newRecord.petId}
              onChange={handleFormChange}
              disabled={!newRecord.userId || adoptedPets.length === 0}
            >
              <MenuItem value="">Select Pet</MenuItem>
              {adoptedPets.map(pet => (
                <MenuItem key={pet.id} value={pet.id}>{pet.name}</MenuItem>
              ))}
            </TextField>
            <Button onClick={handleCreateRecord} fullWidth variant="contained" sx={{ mt: 2 }}>
              Submit Record
            </Button>
          </Box>
        </Fade>
      </Modal>

      <Modal open={slotModalOpen} onClose={() => setSlotModalOpen(false)} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 500 } }}>
        <Fade in={slotModalOpen}>
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom>Create Available Slots</Typography>
            <TextField
              fullWidth
              label="Select Date"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
              margin="normal"
            />

            <Button onClick={handleCreateSlots} fullWidth variant="contained" sx={{ mt: 2 }}>
              Create Slots
            </Button>
          </Box>
        </Fade>
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
    </Box>
  );
};
export default VetDash;
