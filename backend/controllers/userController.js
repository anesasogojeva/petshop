const bcrypt = require('bcrypt');
const User = require('../models/User');
const passwordValidator = require('../validators/passwordValidator');
// Create a new user
/*exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
 
  // Check if all required fields are provided
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Hash the password before saving to database
  const hashedPassword = await bcrypt.hash(password, 10);  // 10 salt rounds

  try {
    // Create a new user in the database
    const newUser = await User.create({
      name,
      email,
      password, // hashed password before storing
      role
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'An error occurred during registration' });
  }
};*/
const Veterinarian = require('../models/Veterinarian'); // import this at the top

exports.register = async (req, res) => {
  const { name, email, password, role, specialization, yearsOfExperience, licenseNumber } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }
 const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({
      message: 'Please choose another email, this one is already taken.'
    });
  }
  const { valid, errors } = passwordValidator(password);
  if (!valid) {
    return res.status(400).json({ message: errors.join(' ') });
  }

  try {
    const newUser = await User.create({ name, email, password, role });

    if (role === 'veterinarian') {
      await Veterinarian.create({
        specialization,
        yearsOfExperience,
        licenseNumber,
        userId: newUser.id
      });
    }

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'An error occurred during registration' });
  }
};

// Get all users
// exports.getAllUsers = async (req, res) => {
//   try {
//     const users = await User.findAll({
//       attributes: { exclude: ['password'] } // Hide passwords
//     });
//     res.status(200).json(users);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: Veterinarian, attributes: ['id'] }]
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get a single user by ID
/*exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};*/
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: require('../models/Veterinarian'),
        as: 'Veterinarian'
      }]
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Update a user by ID
exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    const { password: pw, ...userData } = user.toJSON(); // Exclude password
    res.status(200).json(userData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
