import React from 'react';

function LessonFormModal({ 
  show, 
  onClose, 
  formData, 
  onChange, 
  onSubmit, 
  editingLesson 
}) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{editingLesson ? 'Хичээл засах' : 'Хичээл нэмэх'}</h2>
        <form onSubmit={onSubmit}>
          <div className="input-group">
            <label>Хичээлийн нэр *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => onChange({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <label>Тайлбар</label>
            <textarea
              value={formData.description}
              onChange={(e) => onChange({...formData, description: e.target.value})}
              rows="3"
            />
          </div>

          <div className="input-group">
            <label>YouTube Video URL *</label>
            <input
              type="text"
              value={formData.video_url}
              onChange={(e) => onChange({...formData, video_url: e.target.value})}
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
            <small style={{color: '#808080', fontSize: '12px', marginTop: '4px', display: 'block'}}>
              Жишээ: https://www.youtube.com/watch?v=dQw4w9WgXcQ
            </small>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Үргэлжлэх хугацаа (секунд)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => onChange({...formData, duration: parseInt(e.target.value)})}
              />
            </div>

      
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_free_preview}
                onChange={(e) => onChange({...formData, is_free_preview: e.target.checked})}
              />
              <span>Үнэгүй урьдчилан үзэх (Бүртгэлгүй хүн ч үзнэ)</span>
            </label>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
            >
              Болих
            </button>
            <button type="submit" className="btn btn-primary">
              {editingLesson ? 'Шинэчлэх' : 'Нэмэх'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LessonFormModal;