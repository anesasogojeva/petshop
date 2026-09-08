const PetLog = require('../models/PetLog');
const Pet = require('../models/Pet');

// Add a new log to a pet
exports.createPetLog = async (req, res) => {
  try {
    const { petId, note } = req.body;

    // Check if the pet exists in MSSQL database
    const pet = await Pet.findByPk(petId);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found in MSSQL database' });
    }

    // Add log to logs array in MongoDB
    const updatedPetLog = await PetLog.findOneAndUpdate(
      { petId },
      { $push: { logs: { note, date: new Date() } } },
      { upsert: true, new: true }
    );

    // Format response to exclude _id
    const cleanedLogs = updatedPetLog.logs.map(log => ({
      note: log.note,
      date: log.date
    }));

    return res.status(201).json({
      petId: updatedPetLog.petId,
      logs: cleanedLogs
    });

  } catch (error) {
    console.error('Error creating pet log:', error);
    return res.status(500).json({ error: 'Failed to create pet log', details: error.message });
  }
};

// Get logs for a pet
exports.getPetLogs = async (req, res) => {
  const { petId } = req.params;

  try {
    const petLog = await PetLog.findOne({ petId });

    if (!petLog) {
      return res.status(404).json({ error: 'No logs found for this pet' });
    }

    const pet = await Pet.findByPk(petId);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found in SQL' });
    }

    // Format logs to exclude _id
    const cleanedLogs = petLog.logs.map(log => ({
      note: log.note,
      date: log.date
    }));

    res.status(200).json({
      petId: petLog.petId,
      petName: pet.name,
      logs: cleanedLogs
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs', details: error.message });
  }
};

// Update a log
exports.updatePetLog = async (req, res) => {
  const { petId, logId } = req.params;
  const { note } = req.body;

  try {
    const petLog = await PetLog.findOneAndUpdate(
      { petId, "logs._id": logId },
      { $set: { "logs.$.note": note, "logs.$.date": new Date() } },
      { new: true }
    );

    if (!petLog) {
      return res.status(404).json({ error: "Log not found" });
    }

    const cleanedLogs = petLog.logs.map(log => ({
      note: log.note,
      date: log.date
    }));

    res.status(200).json({
      petId: petLog.petId,
      logs: cleanedLogs
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to update log', details: error.message });
  }
};

// Delete a log
exports.deletePetLog = async (req, res) => {
  const { petId, logId } = req.params;

  try {
    const petLog = await PetLog.findOneAndUpdate(
      { petId },
      { $pull: { logs: { _id: logId } } },
      { new: true }
    );

    if (!petLog) {
      return res.status(404).json({ error: "Log not found" });
    }

    const cleanedLogs = petLog.logs.map(log => ({
      note: log.note,
      date: log.date
    }));

    res.status(200).json({
      message: "Log deleted",
      petId: petLog.petId,
      logs: cleanedLogs
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to delete log', details: error.message });
  }
};