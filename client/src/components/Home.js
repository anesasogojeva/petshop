import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../CSS/Home.css';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MeetOurVeterinarians from './MeetOurVeterinarians';
import heroImage from '../images/home-dog-cat.jpg';
import PetsIcon from '@mui/icons-material/Pets';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import StorefrontIcon from '@mui/icons-material/Storefront';
import VerifiedIcon from '@mui/icons-material/Verified';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HomeIcon from '@mui/icons-material/Home';

const infoCards = [
  {
    title: 'Checklist for New Adopters',
    image: 'https://cdn-icons-png.flaticon.com/512/942/942748.png',
    description: 'Prepare your home and lifestyle before bringing in a new furry friend.',
    details: 'Make sure to pet-proof your house by securing loose wires and toxic items. Gather essential supplies like food and water bowls, collar and leash, identification tags, comfy bedding, and engaging toys. Decide on house rules, potty routines, and sleeping arrangements beforehand. A calm, quiet environment helps pets settle in smoothly.',
    tags: ['Beginner', 'Checklist'],
    readTime: '2 min read',
    tip: 'Tip: Have a vet visit scheduled in advance.'
  },
  {
    title: 'How Old Is a Pet in Human Years?',
    image: 'https://cdn-icons-png.flaticon.com/512/3626/3626465.png',
    description: 'Understand your pet\'s age better with a human-to-pet years chart.',
    details: 'A one-year-old dog is roughly 15 in human years, but this varies by breed and size. Cats age rapidly in their first two years and then slow down. These conversions help in understanding dietary needs, energy levels, and medical checkups. Use them to tailor your care approach through every life stage.',
    tags: ['Health', 'Awareness'],
    readTime: '3 min read',
    tip: 'Did you know? Smaller breeds age slower than larger breeds.'
  },
  {
    title: 'Training Tips for Beginners',
    image: 'https://cdn-icons-png.flaticon.com/512/616/616430.png',
    description: 'Basic obedience and house-training techniques to start with.',
    details: 'Begin with short, frequent training sessions to teach simple commands like "sit", "stay", "come", and "down". Use positive reinforcement—treats, toys, praise—to reward good behavior. Be patient and consistent. Avoid punishment and remember, repetition builds habits. Socialization with people and other pets is key too.',
    tags: ['Training', 'Obedience'],
    readTime: '4 min read',
    tip: 'Use treats sparingly to reinforce behavior!'
  },
  {
    title: 'Healthy Pet Nutrition',
    image: 'https://cdn-icons-png.flaticon.com/512/3737/3737726.png',
    description: 'Guide to feeding your pet a balanced and healthy diet.',
    details: 'Choose a food brand with high-quality protein sources, limited fillers, and essential fatty acids for coat health. Avoid foods with artificial colors or preservatives. Match food type with your pet’s age, weight, and activity level. Treats should not exceed 10% of daily intake. Always provide clean, fresh water.',
    tags: ['Nutrition', 'Diet'],
    readTime: '3 min read',
    tip: 'Always check labels for "complete and balanced" certification.'
  },
  {
    title: 'First Vet Visit',
    image: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png',
    description: 'What to expect and how to prepare for your pet’s first appointment.',
    details: 'Take a list of questions about vaccinations, feeding, and behavior. Carry adoption papers and any known medical history. Bring a fecal sample for testing if possible. The vet will check eyes, ears, heart, teeth, and overall health. It’s a good time to discuss microchipping and flea/tick prevention too.',
    tags: ['Veterinary', 'Checklist'],
    readTime: '2 min read',
    tip: 'Write down all your questions beforehand!'
  },
  {
    title: 'Best Toys by Pet Type',
    image: 'https://cdn-icons-png.freepik.com/512/5100/5100377.png',
    description: 'Keep your pets engaged and active with recommended toys.',
    details: 'Dogs love tug ropes, chew toys, and treat puzzles. Cats enjoy feather wands, laser pointers, and interactive balls. Birds need bells and mirrors, while small animals like hamsters love tunnels and wheels. Choose safe, size-appropriate toys and clean them regularly. Supervised play ensures safety.',
    tags: ['Playtime', 'Enrichment'],
    readTime: '3 min read',
    tip: 'Rotate toys weekly to keep things fresh.'
  }
];

const stats = [
  { value: '500+', label: 'Pets Adopted' },
  { value: '20+', label: 'Certified Vets' },
  { value: '1,000+', label: 'Happy Customers' },
  { value: '24/7', label: 'Emergency Service' },
];

const steps = [
  { icon: SearchIcon, title: 'Browse Pets', description: 'Explore profiles of pets currently looking for a home, filtered by breed, age and type.' },
  { icon: FavoriteIcon, title: 'Choose a Match', description: 'Review a pet\'s history and log notes, then start the adoption process when you\'re ready.' },
  { icon: HomeIcon, title: 'Bring Them Home', description: 'Confirm the adoption and welcome your new companion — our vets are on hand for check-ups.' },
];

const Home = () => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [reviews, setReviews] = useState([]);

  const openModal = (index) => setSelectedIndex(index);
  const closeModal = () => setSelectedIndex(null);

  const nextCard = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % infoCards.length);
  };

  const prevCard = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev - 1 + infoCards.length) % infoCards.length);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reviews');
        const filtered = response.data.filter((review) => {
          const comment = review.comment?.toLowerCase() || '';
          return !(
            comment.includes('keq') ||
            comment.includes('tmerr') ||
            comment.includes('mos bleni ketu')
          );
        });
        setReviews(filtered.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      }
    };
    fetchReviews();
  }, []);

  const handleAdoptClick = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setShowLoginPrompt(true);
    } else {
      navigate('/adopt');
    }
  };

  const handleLoginClick = () => navigate('/login');
  const handleSignupClick = () => navigate('/register');

  return (
    <>
      <Header />

      <main className="home">
        {/* HERO */}
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Trusted Pet Care Platform</span>
            <h1>Compassionate care for every pet, at every stage.</h1>
            <p className="hero-subtext">
              Adopt from a network of loving shelters, book appointments with certified veterinarians,
              and shop everything your pet needs — all in one place.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={handleAdoptClick}>Adopt a Pet</button>
              <Link to="/productList" className="btn-secondary">Shop Supplies</Link>
            </div>
            <div className="hero-trust-row">
              <span><PetsIcon fontSize="small" /> 14,500+ shelters</span>
              <span><LocalHospitalIcon fontSize="small" /> Licensed veterinarians</span>
              <span><StorefrontIcon fontSize="small" /> Curated pet supplies</span>
            </div>
          </div>

          <div className="hero-visual">
            <img src={heroImage} alt="A cat and a dog peeking over a ledge" className="hero-image" />
            <div className="hero-float-card">
              <VerifiedIcon color="primary" />
              <div>
                <strong>500+ pets</strong>
                <span>found loving homes this year</span>
              </div>
            </div>
          </div>
        </section>

        {/* STATS BAND */}
        <section className="stats-band">
          {stats.map((s) => (
            <div className="stat" key={s.label}>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </section>

        {/* HOW IT WORKS */}
        <section className="section how-it-works">
          <div className="section-heading">
            <h2>How Adoption Works</h2>
            <p>A simple, guided process from browsing to bringing your new companion home.</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <div className="step" key={step.title}>
                <div className="step-number">{i + 1}</div>
                <step.icon className="step-icon" />
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORY QUICK LINKS */}
        <section className="section categories-section">
          <div className="section-heading">
            <h2>Find your kind of companion</h2>
          </div>
          <div className="category-grid">
            <Link to="/adopt" className="category-card">
              <span className="category-emoji" aria-hidden="true">🐶</span>
              <span>Dogs</span>
            </Link>
            <Link to="/adopt" className="category-card">
              <span className="category-emoji" aria-hidden="true">🐱</span>
              <span>Cats</span>
            </Link>
            <Link to="/adopt" className="category-card">
              <span className="category-emoji" aria-hidden="true">🐾</span>
              <span>Other Animals</span>
            </Link>
          </div>
        </section>

        {/* PET CARE RESOURCES */}
        <section className="section resources-section">
          <div className="section-heading">
            <h2>Pet Care Resources</h2>
            <p>Practical guides to help you care for your pet with confidence.</p>
          </div>
          <div className="resources-grid">
            {infoCards.map((card, idx) => (
              <article key={idx} className="resource-card" onClick={() => openModal(idx)}>
                <img src={card.image} alt={card.title} />
                <div className="resource-card-body">
                  <div className="resource-meta">
                    <span className="tags">{card.tags.join(' · ')}</span>
                    <span className="read-time">{card.readTime}</span>
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <span className="resource-link">Learn More →</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <div className="section vets-section">
        <MeetOurVeterinarians />
      </div>

      {reviews.length > 0 && (
        <section className="section testimonials-section">
          <div className="section-heading">
            <h2>What Pet Parents Say</h2>
          </div>
          <div className="testimonial-grid">
            {reviews.map((review, idx) => (
              <div className="testimonial-card" key={idx}>
                <p>&ldquo;{review.comment}&rdquo;</p>
                <span className="testimonial-author">— {review.User?.name || 'Anonymous'}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="cta-band">
        <h2>Ready to give a pet a loving home?</h2>
        <p>Browse adoptable pets near you and start the process today.</p>
        <button className="btn-primary" onClick={handleAdoptClick}>Adopt a Pet</button>
      </section>

      <Footer />

      {showLoginPrompt && (
        <div className="login-prompt-overlay" onClick={() => setShowLoginPrompt(false)}>
          <div className="login-prompt-message" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowLoginPrompt(false)} aria-label="Close">×</button>
            <p>You must be logged in to visit the adoption page.</p>
            <button onClick={handleLoginClick} className="login-btn">Log In</button>
            <button onClick={handleSignupClick} className="signup-btn">Sign Up</button>
          </div>
        </div>
      )}

      {selectedIndex !== null && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeModal} aria-label="Close">✖</button>
            <img src={infoCards[selectedIndex].image} alt={infoCards[selectedIndex].title} />
            <h2>{infoCards[selectedIndex].title}</h2>
            <p>{infoCards[selectedIndex].details}</p>
            <p className="tags">Tags: {infoCards[selectedIndex].tags.join(', ')}</p>
            <small className="read-time">{infoCards[selectedIndex].readTime}</small>
            <p className="tip"><strong>💡 {infoCards[selectedIndex].tip}</strong></p>
            <div className="modal-nav-buttons">
              <button onClick={prevCard}>⟵ Prev</button>
              <button onClick={nextCard}>Next ⟶</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
