/*const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000'              // only if using cookies/sessions
}));

const sequelize = require('./config/dbConfig');
const petRoutes = require('./routes/petRoutes');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

app.use('/api/appointments', appointmentRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/users', userRoutes);

sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch((err) => console.error('Database connection failed', err));

const isDev = process.env.NODE_ENV === 'development';
sequelize.sync({ alter: isDev });

app.listen(5000, () => {
  console.log('Server is running on port 3000');
});*/
const express = require('express');
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const path = require('path');
const cors = require('cors');
require('dotenv').config();
app.use(express.json());
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim());
app.use(cors({
  origin: allowedOrigins
}));
require('./models/Adoption');
const sequelize = require('./config/dbConfig');
require('./models/Record'); // ✅ ADD THIS
require('./models/Veterinarian');
require('./models/Review');
const CartItem = require('./models/CartItem');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
const recordRoutes = require('./routes/recordRoutes');
const petRoutes = require('./routes/petRoutes');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartItemRoutes = require('./routes/cartItemRoutes');
const orderRoutes = require('./routes/orderRoutes');
const orderItemRoutes = require('./routes/orderItemRoutes');
const productImageRoutes = require('./routes/productImageRoutes');
const petImageRoutes =require('./routes/petImageRoutes');
const veterinarianImageRoutes = require('./routes/veterinarianImageRoutes');
require('./models/Pet');
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);
const connectMongo = require('./config/mongoConfig');
connectMongo();
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
const contactRoutes = require('./routes/contactRoutes');
app.use('/api/contact', contactRoutes);
const petLogRoutes = require('./routes/petLogRoutes');
app.use('/api/pet-logs', petLogRoutes);
const adoptionRoutes = require('./routes/adoptionRoutes');
app.use('/api/adoption', adoptionRoutes);
const vetRoutes = require('./routes/veterinarianRoutes');
app.use('/api/veterinarian', vetRoutes);
const slotRoutes = require('./routes/slotRoutes');
app.use('/api/slots', slotRoutes);

app.use('/api/checkout', require('./routes/stripeRoutes'));

// ✅ Mount this only once
app.use('/api/stripe', require('./routes/confirmationEmail'));

// Route handling
app.use('/api/appointments', appointmentRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/records',recordRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-items', orderItemRoutes);
app.use('/api/order-items', orderItemRoutes);
app.use('/api/products',productImageRoutes );
app.use('/api/pets',petImageRoutes );
app.use('/api/veterinarian',veterinarianImageRoutes );
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const io = new Server(server, {
  cors: {
    origin: "*", // for dev only, tighten in prod
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  socket.on("newMessage", (message) => {
    const chatId = message.chat;
    socket.to(chatId).emit("messageReceived", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Database connection
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch((err) => console.error('Database connection failed', err));

// Sync models with the database
sequelize.sync()
  .then(() => {
    console.log('Database synchronized');
  })
  .catch((err) => {
    console.error('Error synchronizing the database', err);
  });


// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});