const Slot = require('../models/Slot');
const User = require('../models/User');  // Validate user exists if needed

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00"
];

// ✅ Create slots for a user (vet) on a given date
exports.createSlotsForDate = async (req, res) => {
  try {
    const { userId, date } = req.body;

    // Optional: Validate user exists
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const createdSlots = [];

    for (const startTime of TIME_SLOTS) {
      const endHour = String(Number(startTime.split(':')[0]) + 1).padStart(2, '0');
      const endTime = `${endHour}:00`;

      const [slot, created] = await Slot.findOrCreate({
        where: { date, startTime, endTime, userId },
        defaults: { isBooked: false }
      });

      if (created) createdSlots.push(slot);
    }

    res.status(201).json({ message: 'Slots created or already exist', slots: createdSlots });
  } catch (error) {
    console.error('Error creating slots:', error);
    res.status(500).json({ message: 'Failed to create slots', error: error.message });
  }
};

// ✅ Get available slots for a user (vet) and date
exports.getAvailableSlots = async (req, res) => {
  try {
    const { userId, date } = req.query;

    if (!userId || !date) {
      return res.status(400).json({ message: 'userId and date are required' });
    }

    const availableSlots = await Slot.findAll({
      where: {
        userId,
        date,
        isBooked: false
      },
      order: [['startTime', 'ASC']]
    });

    res.status(200).json({ slots: availableSlots });
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ message: 'Failed to fetch slots', error: error.message });
  }
};

// ✅ Mark slot as booked (after appointment creation)
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

    res.status(200).json({ message: 'Slot booked successfully', slot });
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({ message: 'Failed to book slot', error: error.message });
  }
};

// ✅ Unbook a slot (e.g., if appointment is cancelled)
exports.unbookSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    const slot = await Slot.findByPk(slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    slot.isBooked = false;
    await slot.save();

    res.status(200).json({ message: 'Slot unbooked successfully', slot });
  } catch (error) {
    console.error('Error unbooking slot:', error);
    res.status(500).json({ message: 'Failed to unbook slot', error: error.message });
  }
};