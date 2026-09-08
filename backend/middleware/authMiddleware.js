/*const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Token is no longer valid
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;*/
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  /*const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });*/
  const token = authHeader && authHeader.split(' ')[1]; 
console.log('Incoming token:', token);

if (!token) return res.status(401).json({ message: 'No token provided' });

jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
  console.log('Decoded JWT:', user);  // <-- THIS will confirm if the role is there.
  if (err) return res.status(403).json({ message: 'Invalid token' });
  req.user = user;
  next();
});

};

const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
    next();
  };
};


module.exports = {
  authenticateToken,
  authorizeRole
};