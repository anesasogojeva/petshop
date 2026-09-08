const Veterinarian = require('../models/Veterinarian');
const User = require('../models/User'); // to associate with users if needed
const { validationResult } = require('express-validator'); // For input validation

// Create a new veterinarian profile


// Get all veterinarians
exports.getAllVeterinarians = async (req, res) => {
  try {
    const veterinarians = await Veterinarian.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }] // Include associated user details
    });

    res.status(200).json(veterinarians);
  } catch (error) {
    console.error('Error fetching veterinarians:', error);
    res.status(500).json({ message: 'Failed to fetch veterinarians' });
  }
};

// Get a single veterinarian by ID
exports.getVeterinarianById = async (req, res) => {
  try {
    const veterinarian = await Veterinarian.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }] // Include user details
    });

    if (!veterinarian) {
      return res.status(404).json({ message: 'Veterinarian not found' });
    }

    res.status(200).json(veterinarian);
  } catch (error) {
    console.error('Error fetching veterinarian:', error);
    res.status(500).json({ message: 'An error occurred while fetching veterinarian' });
  }
};

// Update a veterinarian profile by ID
exports.updateVeterinarian = async (req, res) => {
  const { specialization, yearsOfExperience, licenseNumber } = req.body;

  // Input validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const veterinarian = await Veterinarian.findByPk(req.params.id);
    if (!veterinarian) {
      return res.status(404).json({ message: 'Veterinarian not found' });
    }

    if (specialization) veterinarian.specialization = specialization;
    if (yearsOfExperience) veterinarian.yearsOfExperience = yearsOfExperience;
    if (licenseNumber) veterinarian.licenseNumber = licenseNumber;

    await veterinarian.save();
    res.status(200).json(veterinarian);
  } catch (error) {
    console.error('Error updating veterinarian:', error);
    res.status(500).json({ message: 'An error occurred while updating veterinarian' });
  }
};

// Delete a veterinarian profile by ID
exports.deleteVeterinarian = async (req, res) => {
  try {
    const veterinarian = await Veterinarian.findByPk(req.params.id);
    if (!veterinarian) {
      return res.status(404).json({ message: 'Veterinarian not found' });
    }

    await veterinarian.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting veterinarian:', error);
    res.status(500).json({ message: 'An error occurred while deleting veterinarian profile' });
  }
};