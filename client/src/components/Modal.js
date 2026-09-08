import React from 'react';
import '../CSS/Modal.css';

const Modal = ({ isOpen, onClose, content }) => {
  if (!isOpen) return null;  // Don't render modal if not open

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ❌
        </button>
        {content}
      </div>
    </div>
  );
};

export default Modal;
