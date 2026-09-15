const Adoption = require('../models/Adoption');
const Pet = require('../models/Pet');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { sendEmail } = require('../utils/mailService');

const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:3000').split(',')[0].trim();
const LOGO_URL = `${CLIENT_URL}/logoLart.png`;

exports.createAdoption = async (req, res) => {
  try {
    const userId = req.user.role === 'admin' && req.body.userId ? req.body.userId : req.user.id;
    const { petId } = req.body;

    const pet = await Pet.findByPk(petId);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    const existingAdoption = await Adoption.findOne({ where: { petId } });
    if (existingAdoption) {
      return res.status(400).json({ message: 'This pet is already adopted' });
    }

    const adoption = await Adoption.create({ userId, petId });
    pet.adopted = true;
    await pet.save();

    res.status(201).json({ message: 'Pet adopted successfully', adoption });

    const user = await User.findByPk(userId);
    if (user && user.email) {
      const subject = `🎉 Welcome ${pet.name} to your family!`;

      const text = `Hi ${user.name},\n\nCongratulations on adopting ${pet.name}, a ${pet.age}-year-old ${pet.breed}!\n\nWe’re so happy they’ve found a home with you. 🐾`;

      const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #FCEEEE;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 30px auto;
      background-color:rgb(255, 255, 255);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      padding: 30px;
      text-align: center;
    }
    .header {
      font-size: 24px;
      color: #C58177;
      margin-bottom: 10px;
    }
    .logo {
      width: 60px;
      height: 60px;
      margin-bottom: 10px;
    }
    .content {
      font-size: 16px;
      color: #C58177;
      margin-bottom: 20px;
    }
    .pet-name {
      font-size: 20px;
      font-weight: bold;
      color: #C58177;
      margin-bottom: 10px;
    }
    .footer {
      font-size: 12px;
      color: #A67B8B;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <img src="${LOGO_URL}" alt="Paw Logo" class="logo" />
    <div class="header">Pet Care App</div>
    <div class="content">
      Hi <strong>${user.name}</strong>,<br/><br/>
      We're thrilled to let you know that <span class="pet-name">${pet.name}</span>, a sweet ${pet.age}-year-old ${pet.breed}, has been adopted into your loving home! 🐾<br/><br/>
      Thank you for making a difference in their life.
    </div>
    <div class="footer">
      You’re now part of the Pet Care family. ❤️<br />
      With love,<br />
      Pet Care Team
    </div>
  </div>
</body>
</html>
`;



      try {
        await sendEmail(user.email, subject, text, html);
      } catch (emailErr) {
        console.error('Failed to send adoption confirmation email:', emailErr);
      }
    }
  } catch (error) {
    console.error('Adoption creation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to create adoption', error: error.message });
    }
  }
};

exports.getMyAdoptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const adoptions = await Adoption.findAll({
      where: { userId },
      include: [{ model: Pet }]
    });
    res.status(200).json({ adoptions });
  } catch (error) {
    console.error('Error fetching user adoptions:', error);
    res.status(500).json({ message: 'Failed to fetch adoptions', error: error.message });
  }
};

exports.getAllAdoptions = async (req, res) => {
  try {
    const adoptions = await Adoption.findAll({
      include: [{ model: Pet }, { model: User }]
    });
    res.status(200).json({ adoptions });
  } catch (error) {
    console.error('Error fetching adoptions:', error);
    res.status(500).json({ message: 'Failed to fetch adoptions', error: error.message });
  }
};
exports.getAdoptionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adoptions = await Adoption.findAll({
      where: { userId },
      include: [{ model: Pet }, {
        model: User,
        attributes: ['name', 'email']
      }]
    });
    res.status(200).json({ adoptions });
  } catch (error) {
    console.error('Error fetching adoptions:', error);
    res.status(500).json({ message: 'Failed to fetch adoptions', error: error.message });
  }
};


exports.deleteAdoption = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const adoptionId = req.params.id;

    const adoption = await Adoption.findByPk(adoptionId);
    if (!adoption) {
      return res.status(404).json({ message: 'Adoption not found' });
    }

    if (adoption.userId !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to delete this adoption' });
    }

    // Fetch the associated pet
    const pet = await Pet.findByPk(adoption.petId);

    // Delete the adoption
    await adoption.destroy();

    // Update pet status if found
    if (pet) {
      pet.adopted = false;
      await pet.save();
    }

    res.status(200).json({ message: 'Adoption cancelled successfully' });
  } catch (error) {
    console.error('Error deleting adoption:', error);
    res.status(500).json({ message: 'Failed to delete adoption', error: error.message });
  }
};


exports.updateAdoption = async (req, res) => {
  try {
    const { id: currentUserId, role } = req.user;
    const adoptionId = req.params.id;
    const { petId, userId: newUserId } = req.body;

    const adoption = await Adoption.findByPk(adoptionId);
    if (!adoption) {
      return res.status(404).json({ message: 'Adoption not found' });
    }

    if (adoption.userId !== currentUserId && role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to update this adoption' });
    }

    // Handle userId update (only admins)
    if (role === 'admin' && newUserId && newUserId !== adoption.userId) {
      const newUser = await User.findByPk(newUserId);
      if (!newUser) {
        return res.status(404).json({ message: 'New user not found' });
      }
      adoption.userId = newUserId;
    }

    // Handle petId update
    if (petId && petId !== adoption.petId) {
      const oldPet = await Pet.findByPk(adoption.petId);
      const newPet = await Pet.findByPk(petId);
      if (!newPet) {
        return res.status(404).json({ message: 'New pet not found' });
      }

      const existingAdoption = await Adoption.findOne({ where: { petId } });
      if (existingAdoption && existingAdoption.id !== adoption.id) {
        return res.status(400).json({ message: 'This pet is already adopted' });
      }

      if (oldPet) {
        oldPet.adopted = false;
        await oldPet.save();
      }
      newPet.adopted = true;
      await newPet.save();

      adoption.petId = petId;
    }

    await adoption.save();
    res.status(200).json({ message: 'Adoption updated successfully', adoption });
  } catch (error) {
    console.error('Error updating adoption:', error);
    res.status(500).json({ message: 'Failed to update adoption', error: error.message });
  }
};
