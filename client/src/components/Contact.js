import React, { useState } from 'react';
import '../CSS/Contact.css';
import Header from './Header';
import Footer from './Footer';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState(null); // 'sending' | 'sent' | 'error'

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setStatus('sent');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubmitted(true);
  };

  return (
    <div className="contact-page">
      {/* Header */}
      <Header />

      {/* Contact Content */}
      <div className="contact-wrapper">
        <div className="contact-left">
          <h2 className="contact-title">
            <span className="highlight">Here to</span> <span className="focus">help</span>
          </h2>

          <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Enter your full name..." value={formData.name} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Enter your email address..." value={formData.email} onChange={handleChange} required />
            <textarea name="message" placeholder="Type your message here..." value={formData.message} onChange={handleChange} required />
            <button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending...' : 'Send message →'}
            </button>
            {status === 'sent' && <p className="form-feedback success">Thanks — your message has been sent!</p>}
            {status === 'error' && <p className="form-feedback error">Something went wrong. Please try again.</p>}
          </form>
        </div>

        <div className="contact-right">
          <h3>Join our newsletter</h3>
          <p>Add your details and you’ll receive our quarterly email, including what’s happening with the wildlife, nature and communities.</p>
          {newsletterSubmitted ? (
            <p className="form-feedback success">Thanks for signing up!</p>
          ) : (
            <form onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Enter your email address..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button type="submit" className="signup-link-button">
                Sign up →
              </button>
            </form>
          )}
          <Link to="/register" className="secondary-link">
            Or create a full account →
          </Link>


          <strong>Alternatively contact us at:</strong>
          <p>info@example.com</p>
          <p>+123 456 789</p>
          <p>Example Org</p>
          <p>P.O. Box 123</p>
          <p>City</p>
          <p>Country</p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Contact;




