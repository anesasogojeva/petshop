const Record = require('../models/Record');
const Pet = require('../models/Pet');
const User = require('../models/User');
const Veterinarian = require('../models/Veterinarian');

// Get records for the logged-in user or veterinarian
exports.getUserRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let records;

    if (userRole === 'veterinarian') {
      const vet = await Veterinarian.findOne({ where: { userId } });
      if (!vet) return res.status(404).json({ message: 'Veterinarian profile not found' });

      records = await Record.findAll({
        where: { veterinarianId: vet.id },
        include: [Pet, User, Veterinarian]
      });
    } else {
      // Pet owner
      records = await Record.findAll({
        where: { userId },
        include: [Pet, {
                model: Veterinarian,
                as: 'Veterinarian',
                include: [{ model: User, attributes: ['name'] }] // ✅ add this
              }]
      });
    }

    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching user records:', error);
    res.status(500).json({ message: 'Failed to fetch records', error: error.message });
  }
};

// Get all records (admin only)
exports.getAllRecords = async (req, res) => {
  try {
    const records = await Record.findAll({
      include: [Pet, User, Veterinarian]
    });

    res.status(200).json({ success: true, records });
  } catch (error) {
    console.error('Error fetching all records:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch records', error: error.message });
  }
};

// Get a specific record by ID
exports.getRecordById = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const recordId = req.params.id;

    const record = await Record.findByPk(recordId, {
      include: [Pet, User, Veterinarian]
    });

    if (!record) return res.status(404).json({ message: 'Record not found' });

    // Allow access if owner, veterinarian (who created), or admin
    if (record.userId !== userId && record.veterinarianId !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access to this record' });
    }

    res.status(200).json({ success: true, record });
  } catch (error) {
    console.error('Error fetching record by ID:', error);
    res.status(500).json({ message: 'Failed to fetch record', error: error.message });
  }
};

// Create a new record
// exports.createRecord = async (req, res) => {
//     try {
//       // Only admin can specify userId; otherwise, use the logged-in user
//       const userId = req.user.role === 'admin' && req.body.userId ? req.body.userId : req.user.id;
//       const { petId, veterinarianId, date, notes, diagnosis, treatment } = req.body;
  
//       // Validate Pet
//       const pet = await Pet.findByPk(petId);
//       if (!pet) return res.status(404).json({ message: 'Pet not found' });
  
//       // Validate User
//       const user = await User.findByPk(userId);
//       if (!user) return res.status(404).json({ message: 'User not found' });
  
//       // Validate Veterinarian
//       const vet = await Veterinarian.findByPk(veterinarianId);
//       if (!vet) return res.status(404).json({ message: 'Veterinarian not found' });
  
//       // Create the Record
//       const record = await Record.create({
//         petId,
//         userId,
//         veterinarianId,
//         date,
//         notes,
//         diagnosis,
//         treatment
//       });
  
//       res.status(201).json({ message: 'Medical record created successfully', record });
//     } catch (error) {
//       console.error('Record creation error:', error);
//       res.status(500).json({ message: 'Failed to create medical record', error: error.message });
//     }
//   };

// 
exports.createRecord = async (req, res) => {
  try {
    const { petId, userId, veterinarianId: submittedVetId, date, notes, diagnosis, treatment } = req.body;
    const userRole = req.user.role; // from JWT
    let veterinarianId;

    // Ensure pet exists
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    // Determine veterinarianId
    if (userRole === 'admin') {
      // Admins must provide vet ID manually
      if (!submittedVetId) return res.status(400).json({ message: 'Veterinarian ID is required' });

      const vet = await Veterinarian.findByPk(submittedVetId);
      if (!vet) return res.status(404).json({ message: 'Veterinarian not found' });

      veterinarianId = submittedVetId;
    } else {
      // For regular vets, use their associated vet profile
      const vet = await Veterinarian.findOne({ where: { userId: req.user.id } });
      if (!vet) return res.status(403).json({ message: 'You are not authorized to create records' });

      veterinarianId = vet.id;
    }

    // Determine userId to associate
    let userIdToUse = userId;
    if (!userIdToUse) {
      userIdToUse = pet.userId;
    }

    // Confirm user exists (optional but recommended)
    const user = await User.findByPk(userIdToUse);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Create the medical record
    const record = await Record.create({
      petId,
      userId: userIdToUse,
      veterinarianId,
      date,
      notes,
      diagnosis,
      treatment,
    });

    res.status(201).json(record);
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Update a record
exports.updateRecord = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const recordId = req.params.id;
    const { date, notes, diagnosis, treatment, petId, veterinarianId } = req.body;

    const record = await Record.findByPk(recordId);
    if (!record) return res.status(404).json({ message: 'Record not found' });

    if (record.userId !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to update this record' });
    }

    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    const vet = await Veterinarian.findByPk(veterinarianId);
    if (!vet) return res.status(404).json({ message: 'Veterinarian not found' });

    // Update values
    Object.assign(record, { date, notes, diagnosis, treatment, petId, veterinarianId });
    await record.save();

    res.status(200).json({ message: 'Record updated successfully', record });
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ message: 'Failed to update record', error: error.message });
  }
};

// Delete a record
exports.deleteRecord = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const recordId = req.params.id;

    const record = await Record.findByPk(recordId);
    if (!record) return res.status(404).json({ message: 'Record not found' });

    if (record.userId !== userId && role !== 'admin' && role !== 'veterinarian') {
  return res.status(403).json({ message: 'You are not authorized to delete this record' });
}


    await record.destroy();

    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ message: 'Failed to delete record', error: error.message });
  }
};