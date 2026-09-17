import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../CSS/PetAdoption.css';
import { resolveImageUrl } from '../utils/resolveImageUrl';
import { jwtDecode } from "jwt-decode";
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Header from './Header';
import Footer from './Footer';

const PetAdoption = () => {
  const [pets, setPets] = useState([]);
  const [modalPet, setModalPet] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const petsPerPage = 6;
  const [filteredPets, setFilteredPets] = useState([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [petLogs, setPetLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [isAdopting, setIsAdopting] = useState(false);
  const [message, setMessage] = useState({ open: false, text: '', severity: 'success' });

  const showMessage = (text, severity = 'success') => setMessage({ open: true, text, severity });
  const handleCloseMessage = () => setMessage((prev) => ({ ...prev, open: false }));
  




 
  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedBreed, selectedType, sortOrder]);

  useEffect(() => {
    applyFilters();
  }, [search, selectedBreed, selectedType, sortOrder, pets, currentPage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);
  const token = localStorage.getItem('accessToken');

  let decodedToken = null;
  try {
    if (token) decodedToken = jwtDecode(token);
  } catch (e) {
    // invalid token, will handle below in render
  }


const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchPets = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/pets`, config);
      const petsWithImages = await Promise.all(
        res.data.map(async (pet) => {
          try {
            const imgRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/pets/${pet.id}/image`);
            const images = imgRes.data.images || [];
            const sortedImages = images.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
            return { ...pet, images: sortedImages };
          } catch {
            return { ...pet, images: [] };
          }
        })
      );
      setPets(petsWithImages);
    } catch (err) {
      console.error('Error fetching pets', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...pets];
    if (search.trim()) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (selectedBreed) filtered = filtered.filter(p => p.breed === selectedBreed);
    if (selectedType) filtered = filtered.filter(p => p.type === selectedType);
    if (sortOrder === 'asc') filtered = filtered.sort((a, b) => a.age - b.age);
    else if (sortOrder === 'desc') filtered = filtered.sort((a, b) => b.age - a.age);
    setFilteredCount(filtered.length);
    const indexOfLastPet = currentPage * petsPerPage;
    const indexOfFirstPet = indexOfLastPet - petsPerPage;
    setFilteredPets(filtered.slice(indexOfFirstPet, indexOfLastPet));
  };

  const handleAdopt = async (pet) => {
    setModalPet(pet);
    setPetLogs([]);
    setLoadingLogs(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/pet-logs/${pet.id}`, config);
      setPetLogs(res.data.logs || []);
    } catch (err) {
      console.error('Error fetching pet logs', err);
      setPetLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const confirmAdoption = async (petId) => {
    if (!token) {
      showMessage('You should be logged in to adopt a pet.', 'error');
      return;
    }
    setIsAdopting(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/adoption`, { petId }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPets(prev =>
        prev.map(p => p.id === petId ? { ...p, adopted: true } : p)
      );

      showMessage('Adoption successful! A confirmation email has been sent.', 'success');
      setModalPet(null);
    } catch (err) {
      showMessage(err.response?.data?.message || "We couldn't complete the adoption. Please try again.", 'error');
    } finally {
      setIsAdopting(false);
    }
  };

  const breeds = [...new Set(pets.map(p => p.breed))];
  const types = [...new Set(pets.map(p => p.type))];


  return (
    <>
      <Header />
      <div className="container">
      <header className="header">

        <h1>Adopt a Pet</h1>
        <p className="subtitle">Find your perfect companion today!</p>
      </header>

      <section className="filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search pets by name"
        />
        <select
          value={selectedBreed}
          onChange={(e) => setSelectedBreed(e.target.value)}
          aria-label="Filter by breed"
        >
          <option value="">All Breeds</option>
          {breeds.map((breed) => (
            <option key={breed} value={breed}>{breed}</option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          aria-label="Filter by type"
        >
          <option value="">All Types</option>
          {types.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          aria-label="Sort pets"
        >
          <option value="default">Default Order</option>
          <option value="asc">Sort by Age (Asc)</option>
          <option value="desc">Sort by Age (Desc)</option>
        </select>
      </section>

      <section className="card-grid">
        {filteredPets.map(pet => {
          const primaryImage = pet.images?.find(img => img.isPrimary) || pet.images?.[0];
          return (
            <article
              key={pet.id}
              className={`card${pet.adopted ? ' card-adopted' : ''}`}
              tabIndex={0}
              aria-label={`Pet named ${pet.name}${pet.adopted ? ', already adopted' : ''}`}
            >
              {primaryImage ? (
                <img
                  src={resolveImageUrl(primaryImage.imageUrl)}
                  alt={pet.name}
                  className="pet-image"
                />
              ) : (
                <div className="no-image">No Image</div>
              )}
              <h2>{pet.name}</h2>
              <p className="breed-age">{pet.breed} • {pet.age} years old</p>
              {pet.adopted ? (
                <button className="adopted-btn" disabled>Adopted</button>
              ) : (
                <button className="adopt-btn" onClick={() => handleAdopt(pet)}>Adopt</button>
              )}
            </article>
          );
        })}
      </section>

      <Box mt={4} display="flex" justifyContent="center">
        <Pagination
          count={Math.max(1, Math.ceil(filteredCount / petsPerPage))}
          page={currentPage}
          onChange={(e, value) => setCurrentPage(value)}
          sx={{
            '& .MuiPaginationItem-root': {
              color: 'primary.main',
            },
            '& .MuiPaginationItem-root.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'white',
            },
            '& .MuiPaginationItem-root:hover': {
              backgroundColor: 'primary.light',
            },
          }}
          aria-label="Pet list pagination"
        />
      </Box>

      {/* Modal Popup */}
      {modalPet && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.className === 'modal-overlay') setModalPet(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>{modalPet.name}</h2>
            <div className="image-carousel">
              {modalPet.images.length === 0 ? (
                <div className="no-image">No Image</div>
              ) : (
                modalPet.images.map((img, idx) => (
                  <img
                    key={img._id || idx}
                    src={resolveImageUrl(img.imageUrl)}
                    alt={`Photo ${idx + 1} of ${modalPet.name}`}
                    className="pet-image"
                  />
                ))
              )}
            </div>
            <p><strong>Breed:</strong> {modalPet.breed}</p>
            <p><strong>Age:</strong> {modalPet.age}</p>
            <p>{modalPet.description}</p>

            <div className="pet-logs">
              <h3>Pet Logs</h3>
              {loadingLogs ? (
                <p>Loading logs...</p>
              ) : petLogs.length === 0 ? (
                <p>No logs available.</p>
              ) : (
                <ul>
                  {petLogs.map((log, idx) => (
                    <li key={idx}>
                      <strong>{new Date(log.date).toLocaleDateString()}:</strong> {log.note}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setModalPet(null)}>Close</button>
              {!modalPet.adopted && (
                <button className="adopt-btn" onClick={() => confirmAdoption(modalPet.id)} disabled={isAdopting}>
                  {isAdopting ? 'Processing...' : 'Confirm Adoption'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
      <Footer />
      <Snackbar
        open={message.open}
        autoHideDuration={4000}
        onClose={handleCloseMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseMessage} severity={message.severity} sx={{ width: '100%' }}>
          {message.text}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PetAdoption;
