import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

function RatingModal({ show, onClose, courseTitle, onSubmit, existingRating }) {
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState(existingRating?.review || '');
  const [submitting, setSubmitting] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Үнэлгээ сонгоно уу');
      return;
    }

    setSubmitting(true);
    await onSubmit({ rating, review });
    setSubmitting(false);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'rgba(26, 26, 26, 0.98)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: 0 }}>
            Үнэлгээ өгөх
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 59, 48, 0.1)',
              border: '1px solid rgba(255, 59, 48, 0.3)',
              color: '#ff3b30',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '16px', color: '#b0b0b0', marginBottom: '32px' }}>
          {courseTitle}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Star
                    size={40}
                    fill={(hover || rating) >= star ? '#ffc107' : 'none'}
                    color={(hover || rating) >= star ? '#ffc107' : '#808080'}
                  />
                </button>
              ))}
            </div>
            <p style={{ fontSize: '18px', color: '#00d4ff', fontWeight: '600' }}>
              {rating > 0 ? `${rating}.0 од` : 'Үнэлгээ сонгоно уу'}
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#b0b0b0', fontSize: '14px' }}>
              Сэтгэгдэл (заавал биш)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Энэ хичээлийн талаар санал бодлоо хуваалцана уу..."
              rows="4"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Болих
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              style={{
                flex: 1,
                padding: '14px',
                background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: '600',
                cursor: submitting || rating === 0 ? 'not-allowed' : 'pointer',
                opacity: submitting || rating === 0 ? 0.6 : 1
              }}
            >
              {submitting ? 'Илгээж байна...' : 'Үнэлгээ өгөх'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RatingModal;