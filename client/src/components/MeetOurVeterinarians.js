import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../CSS/MeetOurVeterinarians.css';

const MeetOurVeterinarians = () => {
  const [vets, setVets] = useState([]);
  const [imagesByVet, setImagesByVet] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVets = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/veterinarian');
        setVets(data);

        const imagesResults = await Promise.all(
          data.map(vet =>
            axios
              .get(`http://localhost:5000/api/veterinarian/${vet.id}/image`)
              .then(res => ({
                id: vet.id,
                url: res.data?.images?.find(img => img.isPrimary)?.url || null,
              }))
              .catch(() => ({ id: vet.id, url: null }))
          )
        );

        const imagesMap = {};
        imagesResults.forEach(({ id, url }) => {
          imagesMap[id] = url ? `http://localhost:5000/${url}` : '/default-vet-image.jpg';
        });

        setImagesByVet(imagesMap);
      } catch (err) {
        console.error(err);
        setError('Oops! We couldn’t load our veterinarians. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVets();
  }, []);

  if (loading) {
    return <div className="vet-loading-spinner" />;
  }

  if (error) {
    return <div className="vet-error">{error}</div>;
  }

  return (
    <section className="vet-container">
      <h2 className="vet-heading">Meet Our Veterinarians</h2>
      <p className="vet-subheading">Experienced, licensed professionals dedicated to your pet's health.</p>
      <div className="vet-grid">
        {vets.map(vet => (
          <div key={vet.id} className="vet-card">
            <div className="vet-image-wrapper">
              <img
                src={imagesByVet[vet.id]}
                alt={vet.name}
                className="vet-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-vet-image.jpg';
                }}
              />
            </div>
            <div className="vet-info">
              <h3>{vet.name}</h3>
              {vet.specialization && <p className="vet-specialty">{vet.specialization}</p>}
              {typeof vet.yearsOfExperience === 'number' && (
                <p className="vet-experience">
                  <strong>Experience:</strong> {vet.yearsOfExperience} {vet.yearsOfExperience === 1 ? 'year' : 'years'}
                </p>
              )}
              {vet.User?.email && (
                <p className="vet-contact">
                  <strong>Email:</strong>{' '}
                  <a href={`mailto:${vet.User.email}`} className="vet-email">
                    {vet.User.email}
                  </a>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MeetOurVeterinarians;