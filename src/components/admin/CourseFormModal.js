// src/components/admin/CourseFormModal.js - БҮРЭН VALIDATION

import React, { useState, useEffect } from 'react';
import ImageUpload from '../ImageUpload';
import api from '../../config/api';

function CourseFormModal({ 
  show, 
  onClose, 
  formData, 
  onChange, 
  onSubmit, 
  editingCourse 
}) {
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (show) {
      fetchCategories();
    }
  }, [show]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Ангилал татахад алдаа:', error);
    }
  };

  // ✅ УГ ТООЛЛЫН ФУНКЦ
  const countWords = (text) => {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // ✅ REAL-TIME VALIDATION
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'title':
        if (!value || value.trim().length < 3) {
          newErrors.title = 'Хичээлийн нэр дор хаяж 3 тэмдэгттэй байх ёстой';
        } else {
          delete newErrors.title;
        }
        break;

      case 'description':
        const descWords = countWords(value);
        if (descWords < 5) {
          newErrors.description = `Товч тайлбар дор хаяж 5 үгтэй байх ёстой (одоо: ${descWords} үг)`;
        } else {
          delete newErrors.description;
        }
        break;

      case 'full_description':
        const fullDescWords = countWords(value);
        if (fullDescWords < 15) {
          newErrors.full_description = `Дэлгэрэнгүй тайлбар дор хаяж 15 үгтэй байх ёстой (одоо: ${fullDescWords} үг)`;
        } else {
          delete newErrors.full_description;
        }
        break;

      case 'thumbnail':
        if (!value || value.trim() === '') {
          newErrors.thumbnail = 'Хичээлийн зураг заавал оруулна уу';
        } else {
          delete newErrors.thumbnail;
        }
        break;

      case 'preview_video_url':
        if (!value || value.trim() === '') {
          newErrors.preview_video_url = 'Танилцуулга видео URL заавал оруулна уу';
        } else if (!value.includes('youtube.com') && !value.includes('youtu.be')) {
          newErrors.preview_video_url = 'Зөвхөн YouTube видео линк оруулах боломжтой';
        } else {
          delete newErrors.preview_video_url;
        }
        break;

      case 'category_id':
        if (!value || value === '') {
          newErrors.category_id = 'Ангилал сонгоно уу';
        } else {
          delete newErrors.category_id;
        }
        break;

      case 'price':
        if (!value || parseFloat(value) < 5000) {
          newErrors.price = 'Үнэ дор хаяж 5000₮-с дээш байх ёстой';
        } else {
          delete newErrors.price;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ ONCHANGE HANDLER
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Parent onChange дуудах
    onChange(e);

    // Touched тэмдэглэх
    setTouched({ ...touched, [name]: true });

    // Validate
    validateField(name, value);
  };

  // ✅ ONBLUR - Focus алдахад validation
  const handleBlur = (name) => {
    setTouched({ ...touched, [name]: true });
    validateField(name, formData[name]);
  };

  // ✅ SUBMIT - Бүх талбар шалгах
  const handleSubmit = (e) => {
    e.preventDefault();

    // Бүх талбар шалгах
    const allTouched = {
      title: true,
      description: true,
      full_description: true,
      thumbnail: true,
      preview_video_url: true,
      category_id: true,
      price: true
    };
    setTouched(allTouched);

    // Validation
    let hasErrors = false;
    Object.keys(allTouched).forEach(field => {
      if (!validateField(field, formData[field])) {
        hasErrors = true;
      }
    });

    if (hasErrors) {
      alert('❌ Бүх талбарыг зөв бөглөнө үү!');
      return;
    }

    // Submit
    onSubmit(e);
  };

  if (!show) return null;

  // ✅ HELPER - Border color
  const getBorderColor = (fieldName, wordCount = null, requiredWords = 0) => {
    if (!touched[fieldName]) return 'rgba(255, 255, 255, 0.1)';
    if (errors[fieldName]) return '#ff3b30';
    if (wordCount !== null) {
      return wordCount >= requiredWords ? '#34c759' : '#ff3b30';
    }
    return '#34c759';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{editingCourse ? 'Хичээл засах' : 'Шинэ хичээл нэмэх'}</h2>
        <form onSubmit={handleSubmit}>
          
          {/* TITLE */}
          <div className="input-group">
            <label>Хичээлийн нэр *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={() => handleBlur('title')}
              required
              minLength={3}
              maxLength={255}
              style={{
                borderColor: getBorderColor('title')
              }}
            />
            {touched.title && errors.title && (
              <small style={{ color: '#ff3b30', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                ❌ {errors.title}
              </small>
            )}
          </div>

          {/* DESCRIPTION */}
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
              onChange={handleChange}
              onBlur={() => handleBlur('description')}
              rows="3"
              required
              style={{
                borderColor: getBorderColor('description', countWords(formData.description), 5)
              }}
            />
            <small style={{
              color: countWords(formData.description) >= 5 ? '#34c759' : '#ff3b30', 
              fontSize: '11px', 
              marginTop: '4px', 
              display: 'block',
              fontWeight: '600'
            }}>
              {countWords(formData.description) >= 5 && '✓ '}
              Одоогийн үг: {countWords(formData.description)} / 5
            </small>
            {touched.description && errors.description && (
              <small style={{ color: '#ff3b30', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                ❌ {errors.description}
              </small>
            )}
          </div>

          {/* FULL DESCRIPTION */}
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
              onChange={handleChange}
              onBlur={() => handleBlur('full_description')}
              rows="6"
              required
              style={{
                borderColor: getBorderColor('full_description', countWords(formData.full_description), 15)
              }}
            />
            <small style={{
              color: countWords(formData.full_description) >= 15 ? '#34c759' : '#ff3b30', 
              fontSize: '11px', 
              marginTop: '4px', 
              display: 'block',
              fontWeight: '600'
            }}>
              {countWords(formData.full_description) >= 15 && '✓ '}
              Одоогийн үг: {countWords(formData.full_description)} / 15
            </small>
            {touched.full_description && errors.full_description && (
              <small style={{ color: '#ff3b30', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                ❌ {errors.full_description}
              </small>
            )}
          </div>

          {/* IMAGE UPLOAD */}
          <ImageUpload
            label="Хичээлийн зураг * (2:1 харьцаа)"
            onUploadSuccess={(imageUrl) => {
              handleChange({
                target: { name: 'thumbnail', value: imageUrl }
              });
            }}
            currentImage={formData.thumbnail}
            uploadType="course-thumbnail"
          />
          {touched.thumbnail && errors.thumbnail && (
            <small style={{ color: '#ff3b30', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              ❌ {errors.thumbnail}
            </small>
          )}

          {/* VIDEO URL */}
          <div className="input-group">
            <label>Танилцуулга видео URL *</label>
            <input
              type="url"
              name="preview_video_url"
              value={formData.preview_video_url}
              onChange={handleChange}
              onBlur={() => handleBlur('preview_video_url')}
              placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              required
              style={{
                borderColor: getBorderColor('preview_video_url')
              }}
            />
            <small style={{color: '#808080', fontSize: '12px', marginTop: '4px', display: 'block'}}>
              YouTube видео линк оруулна уу. Энэ видео хичээлийн дэлгэрэнгүй хуудсанд харагдана.
            </small>
            {touched.preview_video_url && errors.preview_video_url && (
              <small style={{ color: '#ff3b30', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                ❌ {errors.preview_video_url}
              </small>
            )}
          </div>

          {/* CATEGORY & PRICE */}
          <div className="form-row">
            <div className="input-group">
              <label>Ангилал *</label>
              <select
                name="category_id"
                value={formData.category_id || ''}
                onChange={handleChange}
                onBlur={() => handleBlur('category_id')}
                required
                style={{
                  borderColor: getBorderColor('category_id'),
                  background: 'rgba(255, 255, 255, 0.05)', // ✅ ХАРАГДАХ BACKGROUND
                  color: '#ffffff' // ✅ ЦАГААН ТЕКСТ
                }}
              >
                <option value="" style={{ background: '#1a1a1a', color: '#808080' }}>
                  Ангилал сонгох
                </option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} style={{ background: '#1a1a1a', color: '#ffffff' }}>
                    {cat.icon && `${cat.icon} `}{cat.name}
                  </option>
                ))}
              </select>
              {touched.category_id && errors.category_id && (
                <small style={{color: '#ff3b30', fontSize: '11px', marginTop: '4px', display: 'block'}}>
                  ❌ {errors.category_id}
                </small>
              )}
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
                onChange={handleChange}
                onBlur={() => handleBlur('price')}
                min="5000"
                step="1000"
                required
                style={{
                  borderColor: getBorderColor('price')
                }}
              />
              {touched.price && formData.price && formData.price < 5000 && (
                <small style={{color: '#ff3b30', fontSize: '11px', marginTop: '4px', display: 'block', fontWeight: '600'}}>
                  ❌ Үнэ 5000₮-с дээш байх ёстой
                </small>
              )}
            </div>
          </div>

          {/* DURATION */}
          <div className="input-group">
            <label>Үргэлжлэх хугацаа (цаг)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="0"
              step="0.5"
            />
          </div>

          {/* FREE CHECKBOX */}
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_free"
                checked={formData.is_free}
                onChange={handleChange}
              />
              <span>Үнэгүй хичээл</span>
            </label>
          </div>

          {/* ACTIONS */}
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