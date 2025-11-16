// src/components/admin/CourseFormModal.js - UPDATED
import React from 'react';
import axios from 'axios';
import ImageUpload from '../ImageUpload'; // ✅ Шинэ component

function CourseFormModal({ 
  show, 
  onClose, 
  formData, 
  onChange, 
  onSubmit, 
  editingCourse 
}) {
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    if (show) {
      fetchCategories();
    }
  }, [show]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Ангилал татахад алдаа:', error);
    }
  };

  if (!show) return null;

  const countWords = (text) => {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // ✅ Image upload callback
  const handleImageUpload = (imageUrl) => {
    onChange({ target: { name: 'thumbnail', value: imageUrl } });
  };

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
              minLength={3}
              maxLength={255}
            />
          </div>

          <div className="input-group">
            <label>
              Товч тайлбар * 
              <span style={{color: '#808080', fontSize: '12px', fontWeight: '400', marginLeft: '8px'}}>
                (дор хаяж 5 үг)
              </span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              rows="3"
              required
              minLength={10}
            />
            <small style={{
              color: countWords(formData.description) >= 5 ? '#34c759' : '#808080', 
              fontSize: '11px', 
              marginTop: '4px', 
              display: 'block',
              fontWeight: '600'
            }}>
              {countWords(formData.description) >= 5 && '✓ '}
              Одоогийн үг: {countWords(formData.description)} / 5
            </small>
          </div>

          <div className="input-group">
            <label>
              Дэлгэрэнгүй тайлбар * 
              <span style={{color: '#808080', fontSize: '12px', fontWeight: '400', marginLeft: '8px'}}>
                (дор хаяж 15 үг)
              </span>
            </label>
            <textarea
              name="full_description"
              value={formData.full_description}
              onChange={onChange}
              rows="6"
              required
              minLength={30}
            />
            <small style={{
              color: countWords(formData.full_description) >= 15 ? '#34c759' : '#808080', 
              fontSize: '11px', 
              marginTop: '4px', 
              display: 'block',
              fontWeight: '600'
            }}>
              {countWords(formData.full_description) >= 15 && '✓ '}
              Одоогийн үг: {countWords(formData.full_description)} / 15
            </small>
          </div>

          {/* ✅ ЗУРАГ UPLOAD ХЭСЭГ */}
          <ImageUpload
            label="Хичээлийн зураг *"
            onUploadSuccess={handleImageUpload}
            currentImage={formData.thumbnail}
            uploadType="course-thumbnail"
          />

          <div className="input-group">
            <label>Танилцуулга видео URL *</label>
            <input
              type="url"
              name="preview_video_url"
              value={formData.preview_video_url}
              onChange={onChange}
              placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              required
            />
            <small style={{color: '#808080', fontSize: '12px', marginTop: '4px', display: 'block'}}>
              YouTube видео линк оруулна уу. Энэ видео хичээлийн дэлгэрэнгүй хуудсанд харагдана.
            </small>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Ангилал *</label>
              <select
                name="category_id"
                value={formData.category_id || ''}
                onChange={onChange}
                required
              >
                <option value="">Ангилал сонгох</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon && `${cat.icon} `}{cat.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <small style={{color: '#ff3b30', fontSize: '11px', marginTop: '4px', display: 'block'}}>
                  ⚠ Ангилал байхгүй байна. Admin хэсгээс ангилал нэмнэ үү
                </small>
              )}
            </div>

            <div className="input-group">
              <label>
                Үнэ (₮) * 
                <span style={{color: '#808080', fontSize: '12px', fontWeight: '400', marginLeft: '8px'}}>
                  (дор хаяж 5000₮)
                </span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={onChange}
                min="5000"
                step="1000"
                required
              />
              {formData.price && formData.price < 5000 && (
                <small style={{color: '#ff3b30', fontSize: '11px', marginTop: '4px', display: 'block', fontWeight: '600'}}>
                  ⚠ Үнэ 5000₮-с дээш байх ёстой
                </small>
              )}
            </div>
          </div>

          <div className="input-group">
            <label>Үргэлжлэх хугацаа (цаг)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={onChange}
              min="0"
              step="0.5"
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
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={
                countWords(formData.description) < 5 || 
                countWords(formData.full_description) < 15 ||
                (formData.price && formData.price < 5000) ||
                !formData.category_id ||
                !formData.thumbnail // ✅ Зураг заавал шаардлагатай
              }
            >
              {editingCourse ? 'Шинэчлэх' : 'Нэмэх'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CourseFormModal;