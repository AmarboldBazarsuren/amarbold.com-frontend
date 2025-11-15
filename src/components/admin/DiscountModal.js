import React from 'react';
import { Calendar, Percent, Tag, Trash2 } from 'lucide-react';

function DiscountModal({ 
  show, 
  onClose, 
  course,
  formData,
  onChange,
  onSubmit,
  discounts,
  onDeleteDiscount
}) {
  if (!show || !course) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <h2>{course.title} - Хямдрал удирдах</h2>
        
        {/* Хямдрал үүсгэх форм */}
        <div className="discount-form-section">
          <h3>Шинэ хямдрал үүсгэх</h3>
          <form onSubmit={onSubmit}>
            <div className="form-row">
              <div className="input-group">
                <label>
                  <Percent size={16} />
                  Хямдралын хувь (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount_percent}
                  onChange={(e) => onChange({...formData, discount_percent: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="input-group">
                <label>
                  <Calendar size={16} />
                  Дуусах огноо
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => onChange({...formData, end_date: e.target.value})}
                  required
                />
                <small style={{color: '#808080', fontSize: '12px', marginTop: '4px', display: 'block'}}>
                  Хямдрал одоо шууд эхэлж, тохируулсан огноондоо дуусна
                </small>
              </div>
            </div>
            
            <div className="discount-preview">
              <div className="preview-item">
                <span>Анхны үнэ:</span>
                <strong>₮{course.price?.toLocaleString()}</strong>
              </div>
              <div className="preview-item">
                <span>Хямдрал:</span>
                <strong className="discount-badge">{formData.discount_percent}%</strong>
              </div>
              <div className="preview-item">
                <span>Хямдралтай үнэ:</span>
                <strong className="discount-price">
                  ₮{Math.round(course.price * (1 - formData.discount_percent / 100)).toLocaleString()}
                </strong>
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary">
              <Tag size={18} />
              Хямдрал үүсгэх
            </button>
          </form>
        </div>
        
        {/* Existing хямдралууд */}
        <div className="existing-discounts-section">
          <h3>Одоогийн хямдралууд ({discounts.length})</h3>
          {discounts.length === 0 ? (
            <p style={{ color: '#808080', textAlign: 'center', padding: '20px' }}>
              Хямдрал байхгүй байна
            </p>
          ) : (
            <div className="discounts-list">
              {discounts.map(discount => (
                <div key={discount.id} className={`discount-item ${discount.status}`}>
                  <div className="discount-info">
                    <div className="discount-percent-big">{discount.discount_percent}%</div>
                    <div className="discount-details">
                      <div className="discount-dates">
                        <Calendar size={14} />
                        Эхэлсэн: {new Date(discount.start_date).toLocaleDateString('mn-MN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        <br />
                        Дуусах: {new Date(discount.end_date).toLocaleDateString('mn-MN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="discount-status-badge">
                        {discount.status === 'active' && <span className="badge-active">Идэвхтэй</span>}
                        {discount.status === 'upcoming' && <span className="badge-upcoming">Удахгүй</span>}
                        {discount.status === 'expired' && <span className="badge-expired">Дууссан</span>}
                      </div>
                    </div>
                  </div>
                  <div className="discount-actions">
                    {(discount.status === 'active' || discount.status === 'upcoming') && (
                      <button 
                        className="btn-icon btn-danger"
                        onClick={() => onDeleteDiscount(discount.id)}
                        title="Устгах"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DiscountModal;