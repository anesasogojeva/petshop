const Appointment = require('../models/Appointment');
const Pet = require('../models/Pet');
const User = require('../models/User');
const Veterinarian = require('../models/Veterinarian');
const Slot = require('../models/Slot');
const { Op } = require('sequelize');

// Get appointments for logged-in user or vet
exports.getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let appointments;

    if (userRole === 'veterinarian') {
      // Find veterinarian profile
      const veterinarian = await Veterinarian.findOne({ where: { userId } });
      if (!veterinarian) return res.status(404).json({ message: 'Veterinarian profile not found' });

      appointments = await Appointment.findAll({
        where: { veterinarianId: veterinarian.id },
        include: [
          { model: Pet, as: 'Pet' },
          { model: Veterinarian, as: 'Veterinarian', include: [{ model: User, attributes: ['name'] }] },
          { model: Slot, as: 'Slot' }
        ]
      });
    } else {
      // Normal user (pet owner)
      appointments = await Appointment.findAll({
        where: { userId },
        include: [
          { model: Pet, as: 'Pet' },
          { model: Veterinarian, as: 'Veterinarian', include: [{ model: User, attributes: ['name'] }] },
          { model: Slot, as: 'Slot' }
        ]
      });
    }

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
};

// Get all appointments (admin)
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: Pet, as: 'Pet' },
        { model: Veterinarian, as: 'Veterinarian', include: [{ model: User }] },
        { model: Slot, as: 'Slot' }
      ]
    });

    if (appointments.length === 0) {
      return res.status(200).json({ success: true, message: 'No appointments found', appointments: [] });
    }

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments', error: error.message });
  }
};

// Get appointment by ID (only if owner or admin)
exports.getAppointmentById = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findOne({
      where: { id: appointmentId },
      include: [
        { model: Pet, as: 'Pet' },
        { model: Veterinarian, as: 'Veterinarian', include: [{ model: User }] },
        { model: Slot, as: 'Slot' }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Authorization check: only owner or admin can view
    if (appointment.userId !== userId && role !== 'admin' && role !== 'veterinarian') {
      return res.status(403).json({ message: 'You are not authorized to view this appointment' });
    }

    res.status(200).json({ success: true, appointment });
  } catch (error) {
    console.error('Error fetching appointment by ID:', error);
    res.status(500).json({ message: 'Failed to fetch appointment', error: error.message });
  }
};

// Create appointment using slotId
// exports.createAppointment = async (req, res) => {
//   try {
//     const { slotId, petId, reason, veterinarianId, userId: selectedUserId } = req.body;
//     const userRole = req.user.role;

//     const userIdToUse = userRole === 'admin' && selectedUserId ? selectedUserId : req.user.id;

//     // Validate pet
//     const pet = await Pet.findByPk(petId);
//     if (!pet) return res.status(404).json({ message: 'Pet not found' });

//     // Validate slot
//     const slot = await Slot.findByPk(slotId);
//     if (!slot) return res.status(404).json({ message: 'Slot not found' });

//     // Validate veterinarian
//     const vet = await Veterinarian.findByPk(veterinarianId);
//     if (!vet) return res.status(404).json({ message: 'Veterinarian not found' });

//     // Check slot-vet match
//     if (slot.userId !== veterinarianId) {
//       return res.status(400).json({ message: 'Slot does not belong to this veterinarian' });
//     }

//     // Check if slot is already booked
//     if (slot.isBooked) {
//       return res.status(400).json({ message: 'This slot is already booked' });
//     }

//     // Create the appointment
//     const appointment = await Appointment.create({
//       slotId,
//       reason,
//       petId,
//       userId: userIdToUse,
//       veterinarianId,
//     });

//     // Mark the slot as booked
//     slot.isBooked = true;
//     await slot.save();

//     res.status(201).json({ message: 'Appointment created and slot booked', appointment });
//   } catch (error) {
//     console.error('Create appointment error:', error);
//     res.status(500).json({ message: 'Failed to create appointment', error: error.message });
//   }
// };
// Create appointment using slotId only
exports.createAppointment = async (req, res) => {
  try {
    const { slotId, petId, reason, userId: selectedUserId } = req.body;
    const userRole = req.user.role;
    const userIdToUse = userRole === 'admin' && selectedUserId ? selectedUserId : req.user.id;

    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    const slot = await Slot.findByPk(slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    if (slot.isBooked) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }

    // 🔍 Find veterinarian linked to slot's userId
    const veterinarian = await Veterinarian.findOne({
      where: { userId: slot.userId },
    });

    if (!veterinarian) {
      return res.status(404).json({ message: 'Veterinarian not found for this slot' });
    }

    // ✅ Create appointment with correct vet
    const appointment = await Appointment.create({
      slotId,
      reason,
      petId,
      userId: userIdToUse,
      veterinarianId: veterinarian.id,
    });

    slot.isBooked = true;
    await slot.save();

    res.status(201).json({ message: 'Appointment created and slot booked', appointment });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Failed to create appointment', error: error.message });
  }
};




// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const appointmentId = req.params.id;
    const { slotId, reason, petId, veterinarianId } = req.body;

    const appointment = await Appointment.findByPk(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Authorization check
    if (role !== 'admin' && appointment.userId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this appointment' });
    }

    // Validate pet
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    // Validate slot
    const newSlot = await Slot.findByPk(slotId);
    if (!newSlot) return res.status(404).json({ message: 'Slot not found' });

    // Validate veterinarian
    const vet = await Veterinarian.findOne({ where: { userId: newSlot.userId } });
    if (!vet) return res.status(404).json({ message: 'Veterinarian not found for this slot' });


    // Check slot-vet match
    // Check slot-vet match using userId from slot
    const expectedVet = await Veterinarian.findOne({ where: { userId: newSlot.userId } });
    if (!expectedVet || expectedVet.id !== veterinarianId) {
      return res.status(400).json({ message: 'Slot does not belong to this veterinarian' });
    }

    // Check if slot is already booked by a different appointment
    const existingAppointment = await Appointment.findOne({
      where: {
        slotId,
        id: { [Op.ne]: appointmentId },
      }
    });
    if (existingAppointment) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }

    // If slot changed, free old slot and book new slot
    if (appointment.slotId !== slotId) {
      // Free old slot
      const oldSlot = await Slot.findByPk(appointment.slotId);
      if (oldSlot) {
        oldSlot.isBooked = false;
        await oldSlot.save();
      }

      // Book new slot
      newSlot.isBooked = true;
      await newSlot.save();
    }

    // Update appointment fields
    appointment.slotId = slotId;
    appointment.reason = reason;
    appointment.petId = petId;
    appointment.veterinarianId = veterinarianId;

    await appointment.save();

    res.status(200).json({ message: 'Appointment updated successfully', appointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Failed to update appointment', error: error.message });
  }
};

// Update only the status of an appointment (admin)
const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { status } = req.body;
    const { id: userId, role } = req.user;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (role === 'veterinarian') {
      const veterinarian = await Veterinarian.findOne({ where: { userId } });
      if (!veterinarian || appointment.veterinarianId !== veterinarian.id) {
        return res.status(403).json({ message: 'You are not authorized to update this appointment' });
      }
    } else if (role === 'user') {
      if (appointment.userId !== userId) {
        return res.status(403).json({ message: 'You are not authorized to update this appointment' });
      }
      if (status !== 'cancelled') {
        return res.status(403).json({ message: 'You can only cancel your own appointments' });
      }
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({ message: 'Appointment status updated successfully', appointment });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Failed to update appointment status', error: error.message });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findByPk(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.userId !== userId && role !== 'admin' && role !== 'veterinarian') {
      return res.status(403).json({ message: 'You are not authorized to delete this appointment' });
    }

    // ✅ Free up the slot correctly
    const slot = await Slot.findByPk(appointment.slotId);
    if (slot) {
      slot.isBooked = false; // This is the correct field
      await slot.save();
    }

    await appointment.destroy();

    res.status(200).json({ message: 'Appointment deleted successfully and slot is now available' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Failed to delete appointment', error: error.message });
  }
};


// Mark slot as booked (after appointment creation)
exports.bookSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    const slot = await Slot.findByPk(slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    if (slot.isBooked) {
      return res.status(400).json({ message: 'Slot already booked' });
    }

    slot.isBooked = true;
    await slot.save();

    res.status(200).json({ message: 'Slot booked successfully' });
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({ message: 'Failed to book slot', error: error.message });
  }
};