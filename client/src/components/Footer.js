// src/components/Footer.js
import React from 'react';
import '../CSS/Footer.css';


const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-top">
          <div className="footer-logo">
            <img
              src={`${process.env.PUBLIC_URL}/logoLart.png`}
              alt="Pawtopia Logo"
              className="footer-logo-icon"
            />
            <h2>Pawtopia</h2>
            <p>Your trusted place to adopt, love, and care for animals.</p>
          </div>

          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/aboutus">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/login">Login</a></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h3>Contact</h3>
            <p>Email: support@pawtopia.com</p>
            <p>Phone: +383 49 123 456</p>
            <p>Location: Prishtine, Kosovo</p>
          </div>

          <div className="footer-social">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="#" aria-label="Facebook" className="social-icon facebook">📘</a>
              <a href="#" aria-label="Instagram" className="social-icon instagram">📸</a>
              <a href="#" aria-label="Twitter" className="social-icon twitter">🐦</a>
              <a href="#" aria-label="YouTube" className="social-icon youtube">▶️</a>
            </div>
          </div>
        </div>

        <hr className="footer-separator" />

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Pawtopia 🐾 | All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
