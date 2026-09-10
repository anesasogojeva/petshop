import React, { useEffect, useState } from "react";
import axios from "axios";
import "../CSS/AboutUs.css";
import dogPaw from '../images/Dog paw-amico.png';
import veterinaryImage from '../images/Veterinary-pana.png';
import petFood from '../images/pet food-rafiki.png';
import adopt from '../images/Adopt a pet-cuate.png';
import toy from '../images/Playful cat-amico.png';
import services from '../images/Animal shelter-amico.png';
import Header from './Header';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


const AboutUs = () => {
  const [reviews, setReviews] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [openModal, setOpenModal] = useState(null); // will store card id or key
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const modalContents = {
    mission: {
      title: "Our Mission",
      image: "https://img.freepik.com/free-vector/mission-concept-illustration_114360-8300.jpg",
      content: "Our mission is to provide loving homes and essential supplies for every pet in need. We believe that every animal deserves compassion and care, and we work tirelessly to make that happen through our adoption programs, community support, and quality services."
    },
    vision: {
      title: "Our Vision",
      image: "https://img.freepik.com/free-vector/pet-care-concept-illustration_114360-4972.jpg",
      content: "Our vision is to create a future where every animal is safe, cared for, and loved. We strive to lead the way in animal welfare by raising awareness, providing top-notch veterinary services, and building a community passionate about pet health and happiness."
    },
    services: {
      title: "Our Services",
      image: services,
      content: "We offer expert veterinary care, pet grooming, nutrition guidance, and adoption support — all under one roof. Whether you need a routine check-up, grooming, or help finding a forever home for a pet, we’re here to assist you every step of the way."
    },
    grooming: {
      title: "Pet Grooming",
      image: dogPaw,
      content: "Our professional grooming service caters to all breeds and ensures your pets stay clean, healthy, and happy. From baths to haircuts, nail trims to ear cleaning, our skilled team treats your pets with love and care."
    },
    veterinary: {
      title: "Veterinary Care",
      image: veterinaryImage,
      content: "Our veterinary care includes comprehensive medical checkups, vaccinations, emergency treatment, and ongoing health monitoring to keep your pet in optimal condition."
    },
    nutrition: {
      title: "Pet Nutrition",
      image: petFood,
      content: "We provide tailored diet plans and high-quality food products designed to support your pet’s health at every life stage, from playful puppies to senior cats."
    },
  };


  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reviews`);

        const filtered = response.data.filter((review) => {
          const comment = review.comment?.toLowerCase() || "";
          return !(
            comment.includes("keq") ||
            comment.includes("tmerr") ||
            comment.includes("mos bleni ketu")
          );
        });

        setReviews(filtered);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      }
    };

    fetchReviews();
  }, []);

  const handleAdoptClick = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setShowLoginPrompt(true);  // Show message instead of alert
    } else {
      navigate('/adopt');
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/register');
  };


  return (
    <>
      <div className="about-us-container">
        <Header />

        <main className="main-content">
          <h2 className="section-title">About Us</h2>

          {/* FIRST SET OF 3 CARDS */}

          <p className="about-intro">
            At PetShop 🐾, we believe every tail has a story. From cuddly companions to bold adventurers, our mission is to support every pet and their person through every stage of life.
          </p>
          <div className="about-video">
            <iframe width="560" height="315" src="https://www.youtube.com/embed/qhMSwosTc_Y?si=XOH782cGzxuueITM" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
          </div>


          <div className="card-grid">
            <div className="card">
              <img
                src="https://img.freepik.com/free-vector/veterinary-doctor-concept-illustration_114360-8300.jpg"
                alt="Our Mission"
              />
              <h3>Our Mission</h3>
              <p>
                To provide loving homes and essential supplies for every pet in
                need.
              </p>
              <button onClick={() => setOpenModal("mission")}>More</button>
            </div>

            <div className="card">
              <img
                src="https://img.freepik.com/free-vector/pet-care-concept-illustration_114360-4972.jpg"
                alt="Our Vision"
              />
              <h3>Our Vision</h3>
              <p>
                Creating a future where every animal is safe, cared for, and
                loved.
              </p>
              <button onClick={() => setOpenModal("vision")}>More</button>
            </div>

            <div className="card">
              <img
                src={services}
                alt="Our Services"
              />
              <h3>Our Services</h3>
              <p>
                We offer expert veterinary care, pet grooming, nutrition guidance,
                and adoption support — all under one roof.
              </p>
              <button onClick={() => setOpenModal("services")}>Explore</button>
            </div>
          </div>

          {/* SECOND SET OF CARDS - SERVICES */}
          <h2 className="section-title">Our Services</h2>
          <div className="card-grid">
            <div className="card">
              <img
                src={dogPaw}
                alt="Pet Grooming"
              />
              <h3>Pet Grooming</h3>
              <p>Professional grooming for all breeds to keep your pets clean, healthy, and happy.</p>
              <button onClick={() => setOpenModal("grooming")}>Learn More</button>
            </div>

            <div className="card">
              <img
                src={veterinaryImage}
                alt="Veterinary Care"
              />
              <h3>Veterinary Care</h3>
              <p>Comprehensive medical checkups, vaccinations, and emergency treatment services.</p>
              <button onClick={() => setOpenModal("veterinary")}>Learn More</button>
            </div>

            <div className="card">
              <img
                src={petFood}
                alt="Pet Nutrition"
              />
              <h3>Pet Nutrition</h3>
              <p>Tailored diet plans and high-quality food products for optimal pet health.</p>
              <button onClick={() => setOpenModal("nutrition")}>Learn More</button>
            </div>

            <div className="card">
              <img
                src={adopt}
                alt="Pet Adoption"
              />
              <h3>Pet Adoption</h3>
              <p>Helping pets find their forever homes through a safe and loving process.</p>
              <button onClick={handleAdoptClick} className="adopt-btn">Adopt Now</button>

            </div>

            <div className="card">
              <img
                src={toy}
                alt="Pet Supplies"
              />
              <h3>Pet Supplies</h3>
              <p>A wide range of accessories, toys, and hygiene products for every pet’s needs.</p>
              <Link to="/productList">
                <button>Shop Now</button>
              </Link>
            </div>

          </div>
        </main>
      </div>
      <section className="testimonials">
        <h2 className="section-titles">What Our Customers Say</h2>

        {reviews.length === 0 ? (
          <p>Loading reviews...</p>
        ) : (
          <div className="testimonial-grid">
            {reviews.map((review, index) => (
              <div key={index} className="testimonial-card">
                <p>"{review.comment}"</p>
                <h4>- {review.User?.name || "Anonymous"}</h4>
              </div>
            ))}
          </div>
        )}
      </section>



      <section className="fun-facts">
        <h2 className="section-title">Did You Know?</h2>
        <div className="facts-grid">
          <div className="fact-card">
            <h3>500+</h3>
            <p>Pets Adopted</p>
          </div>
          <div className="fact-card">
            <h3>20+</h3>
            <p>Certified Vets</p>
          </div>
          <div className="fact-card">
            <h3>1K+</h3>
            <p>Happy Customers</p>
          </div>
          <div className="fact-card">
            <h3>24/7</h3>
            <p>Emergency Service</p>
          </div>
        </div>
      </section>

      <section className="community">
        <h2 className="section-title">In the Community</h2>
        <p>We regularly host adoption drives, pet health workshops, and fundraising events to support local shelters.</p>
        <button onClick={() => setShowEventModal(true)}>See Events</button>

        {showEventModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Upcoming Event</h3>
              <p><strong>Event:</strong> Pet Health & Adoption Fair</p>
              <p><strong>Date:</strong> July 15, 2025</p>
              <p><strong>Location:</strong> City Park, Prishtina</p>
              <p><strong>Details:</strong> Free vet checkups, pet adoption booths, and giveaways. Bring your furry friend!</p>
              <button onClick={() => setShowEventModal(false)}>Close</button>
            </div>
          </div>
        )}
      </section>
      {openModal !== null && (
        <div className="modal-overlay" onClick={() => setOpenModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setOpenModal(null)}>✖</button>
            <img src={modalContents[openModal].image} alt={modalContents[openModal].title} />
            <h3>{modalContents[openModal].title}</h3>
            <p>{modalContents[openModal].content}</p>





          </div>
        </div>
      )}
      {showLoginPrompt && (
        <div className="login-prompt-overlay">
          <div className="login-prompt-message">
            <button
              className="close-btn"
              onClick={() => setShowLoginPrompt(false)}
              aria-label="Close"
            >
              ×
            </button>
            <p>You must be logged in to visit the adoption page.</p>
            <button onClick={handleLoginClick} className="login-btn">Log In</button>
            <button onClick={handleSignupClick} className="signup-btn">Sign Up</button>
          </div>
        </div>
      )}


      <Footer />
    </>
  );
};

export default AboutUs;