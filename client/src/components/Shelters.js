
import React, { useState } from 'react';
import Modal from './Modal';
import '../CSS/Shelters.css';
import '../CSS/Modal.css';
import prishtinashelter from '../images/prishtina-shelter.jpg';
import pejashelter from '../images/peja-shelter.jpg';
import mitrovicashelter from '../images/mitrovica-shelter.jpg';
import gjakovashelter from '../images/gjakova-shelter.jpg';
import prishtina1 from '../images/prishtina1.jpg';
import prishtina2 from '../images/prishtina2.jpg';
import peja1 from '../images/peja1.jpg';
import peja2 from '../images/peja2.jpg';
import mitrovica1 from '../images/mitrovica1.jpg';
import mitrovica2 from '../images/mitrovica2.jpg';
import gjakova1 from '../images/gjakova1.jpg';
import gjakova2 from '../images/gjakova2.jpg';
import Header from './Header';
import Footer from './Footer';

const animalFacts = [
  {
    fact: "Dogs have a sense of time and can miss their owners.",
    image: "https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    fact: "Cats sleep for 70% of their lives.",
    image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=60"
  },
  {
    fact: "Rabbits can see nearly 360 degrees around them.",
    image: "https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YnVubnl8ZW58MHx8MHx8fDA%3D"
  },
  {
    fact: "Parrots are among the most intelligent birds.",
    image: "https://images.unsplash.com/photo-1604826010917-65cf53d6249b?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHBhcnJvdHxlbnwwfHwwfHx8MA%3D%3D"
  }
];

const shelters = [
  {
  name: "Prishtina Animal Shelter",
  city: "Prishtinë",
  description: "Helping over 100 dogs find homes every year. Located near Germia Park.",
  phone: "+383 44 123 456",
  email: "info@prishtinashelter.com",
  image: prishtinashelter,
  moreText: `Prishtina Animal Shelter is dedicated to providing a safe haven for abandoned and injured animals.  
  We actively partner with local veterinarians to ensure the best medical care and organize
   monthly adoption events to connect pets with loving families.` ,
  extraImages: [prishtina1, prishtina2]
}
,
  {
    name: "Peja Pet Haven",
    city: "Pejë",
    description: "Calm and welcoming shelter for abandoned animals in western Kosovo.",
    phone: "+383 49 987 654",
    email: "pejapet@haven.com",
    image: pejashelter,
    moreText: `At Peja Pet Haven, we believe every animal deserves a second chance. 
      Our dedicated team provides not only shelter but also rehabilitation and 
      socialization for pets awaiting their forever homes. 
      We organize community education programs to promote responsible pet ownership and 
      collaborate with local clinics to ensure top-notch veterinary care.`,
     extraImages: [peja1, peja2]
  },
  {
    name: "Mitrovica Animal Care",
    city: "Mitrovicë",
    description: "Focused on rescue and rehabilitation across the north.",
    phone: "+383 44 765 432",
    email: "contact@mitrovica-care.org",
    image: mitrovicashelter,
    moreText: `Mitrovica Animal Care is committed to rescuing vulnerable animals and 
      helping them heal physically and emotionally. 
      Our outreach includes spay and neuter campaigns to reduce stray populations and improve animal 
      welfare throughout the region.`,
     extraImages: [mitrovica1, mitrovica2]
  },
  {
    name: "Gjakova Rescue Home",
    city: "Gjakovë",
    description: "Provides temporary care for pets until they're adopted.",
    phone: "+383 45 321 789",
    email: "hello@gjakovarescue.com",
    image: gjakovashelter,
    moreText: `Gjakova Rescue Home operates as a beacon of hope for lost and abandoned pets. 
      We provide a safe, nurturing environment with a focus on long-term wellbeing and behavior training. 
      Our passionate volunteers regularly host adoption fairs and work closely with local 
      authorities to rescue animals in distress .`,
     extraImages: [gjakova1, gjakova2]
  }
];

const Shelters = () => {
    const [selectedShelter, setSelectedShelter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (shelter) => {
    setSelectedShelter(shelter);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedShelter(null);
    setIsModalOpen(false);
  };

  const [factIndex, setFactIndex] = React.useState(0);

const nextFact = () => {
  setFactIndex((factIndex + 1) % animalFacts.length);
};

const prevFact = () => {
  setFactIndex((factIndex - 1 + animalFacts.length) % animalFacts.length);
};

  return (
    <>
      <Header />
      <main className="shelters-page">
        <section className="shelters-hero">
          <h1>Animal Shelters in Kosovo</h1>
          <p>Discover some of the most dedicated animal shelters working across Kosovo.</p>
        </section>

          <section className="shelters-grid">
      {shelters.map((shelter, index) => (
        <div className="shelter-card" key={index}>
          <div className="shelter-front">
            <h3>{shelter.name}</h3>
            <p className="city">📍 {shelter.city}</p>
            <img src={shelter.image} alt={shelter.name} className="shelter-img" />
          </div>
          
          <div className="shelter-back">
            <p>{shelter.description}</p>
            <p>📞 {shelter.phone}</p>
            <p>✉️ {shelter.email}</p>
            <button className="read-more-btn" onClick={() => openModal(shelter)}>
              📖 Read More
        </button>
          </div>

        </div>
      ))}
    </section>
      <section className="fun-facts-slider">
      <h2>Fun Animal Facts</h2>
      <img
        src={animalFacts[factIndex].image}
        alt={`Fact ${factIndex + 1}`}
        className="fun-facts-image"
      />
      <p className="fun-facts-text">
        {animalFacts[factIndex].fact}
      </p>
      <div className="fun-facts-nav">
        <button onClick={prevFact}>← Previous</button>
        <button onClick={nextFact}>Next →</button>
      </div>
    </section>



      </main>
      <Footer />
        <Modal
  isOpen={isModalOpen}
  onClose={closeModal}
  content={
    selectedShelter && (
      <div>
        <h2>{selectedShelter.name}</h2>
        <p><strong>City:</strong> {selectedShelter.city}</p>
        
        <img
          src={selectedShelter.image}
          alt={selectedShelter.name}
          style={{ width: "90%", borderRadius: "8px", marginTop: "1rem" }}
        />
        <p style={{ marginTop: "1rem" }}>{selectedShelter.moreText}</p>
        <div className="extra-images">
          {selectedShelter.extraImages && selectedShelter.extraImages.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Extra ${idx + 1}`}
              style={{ width: "48%", margin: "1%", borderRadius: "8px" }}
            />
          ))}
        </div>
      </div>
    )
  }
/>
    </>
  );
};

export default Shelters;
