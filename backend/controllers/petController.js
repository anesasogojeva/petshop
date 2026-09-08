const Pet = require('../models/Pet');

// CREATE pet
exports.createPet = async (req, res) => {
  try {
    const { name, breed, age,gender,type ,adopted, description } = req.body;     
    const normalizedType = type?.toLowerCase().trim();

    const newPet = await Pet.create({ name, breed, age,gender,type: normalizedType, adopted, description });
    res.status(201).json(newPet);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pet', details: error.message });
  }
};

// READ all pets
exports.getAllPets = async (req, res) => {
  try {
    const pets = await Pet.findAll();
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pets', details: error.message });
  }
};

// READ pet by ID
exports.getPetById = async (req, res) => {
  const { id } = req.params;
  try {
    const pet = await Pet.findByPk(id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    res.status(200).json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pet', details: error.message });
  }
};

// UPDATE pet
exports.updatePet = async (req, res) => {
  const { id } = req.params;
  const { name, breed, age,gender,type, adopted, description } = req.body;
   const normalizedType = type?.toLowerCase().trim();
  try {
    const pet = await Pet.findByPk(id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    pet.name = name || pet.name;
    pet.breed = breed || pet.breed;
    pet.age = age || pet.age;
    pet.gender = gender || pet.gender;     pet.type = normalizedType || pet.type;
    pet.adopted = adopted !== undefined ? adopted : pet.adopted;
    pet.description = description || pet.description;
    await pet.save();
    res.status(200).json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update pet', details: error.message });
  }
};

// DELETE pet
exports.deletePet = async (req, res) => {
  const { id } = req.params;
  try {
    const pet = await Pet.findByPk(id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    await pet.destroy();
    res.status(200).json({ message: 'Pet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete pet', details: error.message });
  }
};