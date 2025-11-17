import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import '../styles/AdminCategories.css';
import api from '../config/api';
function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/categories',);
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Ангилал татахад алдаа:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingCategory) {
        await axios.put(
          `/api/categories/${editingCategory.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Ангилал амжилттай шинэчлэгдлээ');
      } else {
        await axios.post(
          '/api/categories',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Ангилал амжилттай нэмэгдлээ');
      }
      
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', icon: '' });
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId, categoryName) => {
    if (!window.confirm(`"${categoryName}" ангилалыг устгах уу?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `/api/categories/${categoryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Ангилал устгагдлаа');
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loader"></div>
        <p>Уншиж байна...</p>
      </div>
    );
  }

  return (
    <div className="admin-categories">
      <div className="categories-header">
        <h1>Ангилал удирдах</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditingCategory(null);
            setFormData({ name: '', description: '', icon: '' });
          }}
        >
          <Plus size={20} />
          Ангилал нэмэх
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCategory ? 'Ангилал засах' : 'Шинэ ангилал'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Ангиллын нэр *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Жишээ: Програмчлал"
                  required
                />
              </div>

              <div className="input-group">
                <label>Тайлбар</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  placeholder="Энэ ангиллын тухай товч мэдээлэл..."
                />
              </div>

              <div className="input-group">
                <label>Icon (заавал биш)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  placeholder="📚 эсвэл lucide icon нэр"
                />
                <small style={{color: '#808080', fontSize: '12px', marginTop: '4px', display: 'block'}}>
                  Emoji эсвэл Lucide icon нэр оруулах боломжтой
                </small>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCategory(null);
                  }}
                >
                  Болих
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Шинэчлэх' : 'Нэмэх'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="categories-grid">
        {categories.length === 0 ? (
          <div className="empty-state">
            <Tag size={64} />
            <p>Ангилал байхгүй байна</p>
          </div>
        ) : (
          categories.map(category => (
            <div key={category.id} className="category-card">
              <div className="category-icon">
                {category.icon || '📚'}
              </div>
              <div className="category-info">
                <h3>{category.name}</h3>
                {category.description && (
                  <p className="category-desc">{category.description}</p>
                )}
                <span className="course-count">
                  {category.course_count} хичээл
                </span>
              </div>
              <div className="category-actions">
                <button 
                  className="btn-icon"
                  onClick={() => handleEdit(category)}
                  title="Засах"
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="btn-icon btn-danger"
                  onClick={() => handleDelete(category.id, category.name)}
                  title="Устгах"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminCategories;