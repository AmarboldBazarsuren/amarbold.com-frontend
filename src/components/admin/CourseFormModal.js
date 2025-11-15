import React from 'react';

function CourseFormModal({ 
  show, 
  onClose, 
  formData, 
  onChange, 
  onSubmit, 
  editingCourse 
}) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{editingCourse ? 'Хичээл засах' : 'Шинэ хичээл нэмэх'}</h2>
        <form onSubmit={onSubmit}>
          <div className="input-group">
            <label>Хичээлийн нэр *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Товч тайлбар *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              rows="3"
              required
            />
          </div>

          <div className="input-group">
            <label>Дэлгэрэнгүй тайлбар</label>
            <textarea
              name="full_description"
              value={formData.full_description}
              onChange={onChange}
              rows="5"
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Ангилал *</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={onChange}
                required
              >
                <option value="1">Програмчлал</option>
                <option value="2">Дизайн</option>
                <option value="3">Бизнес</option>
                <option value="4">Маркетинг</option>
                <option value="5">Хувийн хөгжил</option>
              </select>
            </div>

            <div className="input-group">
              <label>Түвшин *</label>
              <select
                name="level"
                value={formData.level}
                onChange={onChange}
                required
              >
                <option value="beginner">Анхан</option>
                <option value="intermediate">Дунд</option>
                <option value="advanced">Ахисан</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Үнэ (₮)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={onChange}
                min="0"
              />
            </div>

            <div className="input-group">
              <label>Үргэлжлэх хугацаа (цаг)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={onChange}
                min="0"
              />
            </div>
          </div>

          <div className="input-group">
            <label>Зургийн URL</label>
            <input
              type="text"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={onChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_free"
                checked={formData.is_free}
                onChange={onChange}
              />
              <span>Үнэгүй хичээл</span>
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
              {editingCourse ? 'Шинэчлэх' : 'Нэмэх'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CourseFormModal;