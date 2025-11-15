import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, DollarSign, TrendingUp, 
  Plus, Edit, Trash2, Eye 
} from 'lucide-react';
import axios from 'axios';
import '../styles/AdminDashboard.css';
import { Tag, Calendar, Percent } from 'lucide-react';
function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0,
    topCourses: []
  });
  const [courses, setCourses] = useState([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [sectionFormData, setSectionFormData] = useState({
    title: '',
    description: '',
    order_number: 0
  });
  
  const [editingSection, setEditingSection] = useState(null);
  
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    duration: 0,
    order_number: 0,
    is_free_preview: false
  });
  
  const [editingLesson, setEditingLesson] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    full_description: '',
    category_id: 1,
    price: 0,
    is_free: false,
    duration: 0,
    level: 'beginner',
    thumbnail: ''
  });
const [showDiscountModal, setShowDiscountModal] = useState(false);
const [selectedCourseForDiscount, setSelectedCourseForDiscount] = useState(null);
const [discountFormData, setDiscountFormData] = useState({
  discount_percent: 10,
  start_date: '',
  end_date: ''
});
const [courseDiscounts, setCourseDiscounts] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    fetchStats();
    fetchAllCourses();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Статистик татахад алдаа:', error);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCourses(response.data.data || []);
      }
    } catch (error) {
      console.error('Хичээлүүд татахад алдаа:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingCourse) {
        await axios.put(
          `http://localhost:5000/api/admin/courses/${editingCourse.id}`,
          { ...formData, status: 'published' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Хичээл амжилттай шинэчлэгдлээ');
      } else {
        await axios.post(
          'http://localhost:5000/api/admin/courses',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Хичээл амжилттай үүсгэлээ');
      }
      
      setShowCourseForm(false);
      setEditingCourse(null);
      resetForm();
      fetchAllCourses();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      full_description: course.full_description || course.description,
      category_id: course.category_id || 1,
      price: course.price,
      is_free: course.is_free,
      duration: course.duration,
      level: course.level,
      thumbnail: course.thumbnail || ''
    });
    setShowCourseForm(true);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Энэ хичээлийг устгах уу?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/admin/courses/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Хичээл амжилттай устгагдлаа');
      fetchAllCourses();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      full_description: '',
      category_id: 1,
      price: 0,
      is_free: false,
      duration: 0,
      level: 'beginner',
      thumbnail: ''
    });
  };

  const handleManageCourse = async (course) => {
    setSelectedCourse(course);
    await fetchCourseSections(course.id);
    setShowSectionForm(false);
    setShowLessonForm(false);
  };

  const fetchCourseSections = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.course.sections) {
        setSections(response.data.course.sections);
      }
    } catch (error) {
      console.error('Section татахад алдаа:', error);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingSection) {
        await axios.put(
          `http://localhost:5000/api/admin/sections/${editingSection.id}`,
          sectionFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Section амжилттай шинэчлэгдлээ');
      } else {
        await axios.post(
          `http://localhost:5000/api/admin/courses/${selectedCourse.id}/sections`,
          sectionFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Section амжилттай нэмэгдлээ');
      }
      
      setSectionFormData({ title: '', description: '', order_number: 0 });
      setEditingSection(null);
      setShowSectionForm(false);
      fetchCourseSections(selectedCourse.id);
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setSectionFormData({
      title: section.title,
      description: section.description || '',
      order_number: section.order_number || 0
    });
    setShowSectionForm(true);
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Энэ section-ийг устгах уу?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/admin/sections/${sectionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Section амжилттай устгагдлаа');
      fetchCourseSections(selectedCourse.id);
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };
const handleOpenDiscountModal = async (course) => {
  setSelectedCourseForDiscount(course);
  setShowDiscountModal(true);
  
  // Existing discounts татах
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `http://localhost:5000/api/discounts/courses/${course.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (response.data.success) {
      setCourseDiscounts(response.data.data);
    }
  } catch (error) {
    console.error('Хямдрал татахад алдаа:', error);
  }
};
const handleCreateDiscount = async (e) => {
  e.preventDefault();
  
  if (!discountFormData.discount_percent || !discountFormData.start_date || !discountFormData.end_date) {
    alert('Бүх талбарыг бөглөнө үү');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    await axios.post(
      `http://localhost:5000/api/discounts/courses/${selectedCourseForDiscount.id}`,
      discountFormData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    alert('Хямдрал амжилттай үүсгэлээ!');
    setDiscountFormData({ discount_percent: 10, start_date: '', end_date: '' });
    handleOpenDiscountModal(selectedCourseForDiscount); // Refresh
  } catch (error) {
    alert(error.response?.data?.message || 'Алдаа гарлаа');
  }
};
const handleDeleteDiscount = async (discountId) => {
  if (!window.confirm('Энэ хямдралыг устгах уу?')) return;
  
  try {
    const token = localStorage.getItem('token');
    await axios.delete(
      `http://localhost:5000/api/discounts/${discountId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    alert('Хямдрал устгагдлаа');
    handleOpenDiscountModal(selectedCourseForDiscount); // Refresh
  } catch (error) {
    alert(error.response?.data?.message || 'Алдаа гарлаа');
  }
};

  const handleAddLesson = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingLesson) {
        await axios.put(
          `http://localhost:5000/api/admin/lessons/${editingLesson.id}`,
          lessonFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Хичээл амжилттай шинэчлэгдлээ');
      } else {
        await axios.post(
          `http://localhost:5000/api/admin/sections/${selectedSection.id}/lessons`,
          lessonFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Хичээл амжилттай нэмэгдлээ');
      }
      
      setLessonFormData({
        title: '',
        description: '',
        video_url: '',
        duration: 0,
        order_number: 0,
        is_free_preview: false
      });
      setEditingLesson(null);
      setShowLessonForm(false);
      fetchCourseSections(selectedCourse.id);
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonFormData({
      title: lesson.title,
      description: lesson.description || '',
      video_url: lesson.video_url || '',
      duration: lesson.duration || 0,
      order_number: lesson.order_number || 0,
      is_free_preview: lesson.is_free_preview || false
    });
    setSelectedSection({ id: lesson.section_id });
    setShowLessonForm(true);
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Энэ хичээлийг устгах уу?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/admin/lessons/${lessonId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Хичээл амжилттай устгагдлаа');
      fetchCourseSections(selectedCourse.id);
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Админ самбар</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setShowCourseForm(true);
            setEditingCourse(null);
            resetForm();
          }}
        >
          <Plus size={20} />
          Хичээл нэмэх
        </button>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        {currentUser?.role === 'admin' && (
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Нийт хэрэглэгчид</div>
            </div>
          </div>
        )}
        
        <div className="stat-card">
          <div className="stat-icon">
            <BookOpen size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCourses}</div>
            <div className="stat-label">
              {currentUser?.role === 'test_admin' ? 'Миний хичээлүүд' : 'Нийт хичээлүүд'}
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalEnrollments}</div>
            <div className="stat-label">Бүртгэлүүд</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">₮{stats.totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Нийт орлого</div>
          </div>
        </div>
      </div>

      {/* Course Form Modal */}
      {showCourseForm && (
        <div className="modal-overlay" onClick={() => setShowCourseForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCourse ? 'Хичээл засах' : 'Шинэ хичээл нэмэх'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Хичээлийн нэр *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Товч тайлбар *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>

              <div className="input-group">
                <label>Дэлгэрэнгүй тайлбар</label>
                <textarea
                  name="full_description"
                  value={formData.full_description}
                  onChange={handleInputChange}
                  rows="5"
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Ангилал *</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="input-group">
                  <label>Үргэлжлэх хугацаа (цаг)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_free"
                    checked={formData.is_free}
                    onChange={handleInputChange}
                  />
                  <span>Үнэгүй хичээл</span>
                </label>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCourseForm(false);
                    setEditingCourse(null);
                    resetForm();
                  }}
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
      )}

      {/* Course Content Management Modal */}
      {selectedCourse && (
        <div className="modal-overlay" onClick={() => setSelectedCourse(null)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedCourse.title} - Агуулга удирдах</h2>
            
            <button 
              className="btn btn-primary mb-3"
              onClick={() => {
                setShowSectionForm(!showSectionForm);
                setEditingSection(null);
                setSectionFormData({ title: '', description: '', order_number: 0 });
              }}
            >
              <Plus size={16} />
              Шинэ бүлэг нэмэх
            </button>

            {showSectionForm && (
              <div className="section-form">
                <h3>{editingSection ? 'Бүлэг засах' : 'Шинэ бүлэг'}</h3>
                <form onSubmit={handleAddSection}>
                  <div className="input-group">
                    <label>Бүлгийн нэр *</label>
                    <input
                      type="text"
                      value={sectionFormData.title}
                      onChange={(e) => setSectionFormData({...sectionFormData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Тайлбар</label>
                    <textarea
                      value={sectionFormData.description}
                      onChange={(e) => setSectionFormData({...sectionFormData, description: e.target.value})}
                      rows="2"
                    />
                  </div>
                  <div className="input-group">
                    <label>Дараалал</label>
                    <input
                      type="number"
                      value={sectionFormData.order_number}
                      onChange={(e) => setSectionFormData({...sectionFormData, order_number: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowSectionForm(false);
                        setEditingSection(null);
                        setSectionFormData({ title: '', description: '', order_number: 0 });
                      }}
                    >
                      Болих
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingSection ? 'Шинэчлэх' : 'Нэмэх'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="sections-list">
              {sections.map((section, idx) => (
                <div key={section.id} className="section-card">
                  <div className="section-header-admin">
                    <h3>{idx + 1}. {section.title}</h3>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon"
                        onClick={() => handleEditSection(section)}
                        title="Засах"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn-icon btn-danger"
                        onClick={() => handleDeleteSection(section.id)}
                        title="Устгах"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedSection(section);
                          setEditingLesson(null);
                          setLessonFormData({
                            title: '',
                            description: '',
                            video_url: '',
                            duration: 0,
                            order_number: 0,
                            is_free_preview: false
                          });
                          setShowLessonForm(true);
                        }}
                      >
                        <Plus size={14} />
                        Хичээл нэмэх
                      </button>
                    </div>
                  </div>

                  {section.lessons && section.lessons.length > 0 ? (
                    <div className="lessons-list">
                      {section.lessons.map((lesson, lessonIdx) => (
                        <div key={lesson.id} className="lesson-card-admin">
                          <span>{lessonIdx + 1}. {lesson.title}</span>
                          <div className="lesson-meta-admin">
                            {lesson.is_free_preview && <span className="free-badge-small">Үнэгүй</span>}
                            <span>{Math.floor(lesson.duration / 60)}:{String(lesson.duration % 60).padStart(2, '0')}</span>
                            <div className="action-buttons">
                              <button 
                                className="btn-icon"
                                onClick={() => handleEditLesson(lesson)}
                                title="Засах"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                className="btn-icon btn-danger"
                                onClick={() => handleDeleteLesson(lesson.id)}
                                title="Устгах"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-lessons">Хичээл байхгүй байна</p>
                  )}
                </div>
              ))}
            </div>

            {sections.length === 0 && (
              <div className="empty-state-small">
                <p>Бүлэг байхгүй байна. Эхлээд бүлэг нэмнэ үү.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Lesson Modal */}
      {showLessonForm && selectedSection && (
        <div className="modal-overlay" onClick={() => setShowLessonForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingLesson ? 'Хичээл засах' : `Хичээл нэмэх`}</h2>
            <form onSubmit={handleAddLesson}>
              <div className="input-group">
                <label>Хичээлийн нэр *</label>
                <input
                  type="text"
                  value={lessonFormData.title}
                  onChange={(e) => setLessonFormData({...lessonFormData, title: e.target.value})}
                  required
                />
              </div>

              <div className="input-group">
                <label>Тайлбар</label>
                <textarea
                  value={lessonFormData.description}
                  onChange={(e) => setLessonFormData({...lessonFormData, description: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="input-group">
                <label>YouTube Video URL *</label>
                <input
                  type="text"
                  value={lessonFormData.video_url}
                  onChange={(e) => setLessonFormData({...lessonFormData, video_url: e.target.value})}
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
                    value={lessonFormData.duration}
                    onChange={(e) => setLessonFormData({...lessonFormData, duration: parseInt(e.target.value)})}
                  />
                </div>

                <div className="input-group">
                  <label>Дараалал</label>
                  <input
                    type="number"
                    value={lessonFormData.order_number}
                    onChange={(e) => setLessonFormData({...lessonFormData, order_number: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={lessonFormData.is_free_preview}
                    onChange={(e) => setLessonFormData({...lessonFormData, is_free_preview: e.target.checked})}
                  />
                  <span>Үнэгүй урьдчилан үзэх (Бүртгэлгүй хүн ч үзнэ)</span>
                </label>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowLessonForm(false);
                    setEditingLesson(null);
                    setLessonFormData({
                      title: '',
                      description: '',
                      video_url: '',
                      duration: 0,
                      order_number: 0,
                      is_free_preview: false
                    });
                  }}
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
      )}
{showDiscountModal && selectedCourseForDiscount && (
  <div className="modal-overlay" onClick={() => setShowDiscountModal(false)}>
    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
      <h2>{selectedCourseForDiscount.title} - Хямдрал удирдах</h2>
      
      {/* Хямдрал үүсгэх форм */}
      <div className="discount-form-section">
        <h3>Шинэ хямдрал үүсгэх</h3>
        <form onSubmit={handleCreateDiscount}>
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
                value={discountFormData.discount_percent}
                onChange={(e) => setDiscountFormData({...discountFormData, discount_percent: parseInt(e.target.value)})}
                required
              />
            </div>
            <div className="input-group">
              <label>
                <Calendar size={16} />
                Эхлэх огноо
              </label>
              <input
                type="datetime-local"
                value={discountFormData.start_date}
                onChange={(e) => setDiscountFormData({...discountFormData, start_date: e.target.value})}
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
                value={discountFormData.end_date}
                onChange={(e) => setDiscountFormData({...discountFormData, end_date: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="discount-preview">
            <div className="preview-item">
              <span>Анхны үнэ:</span>
              <strong>₮{selectedCourseForDiscount.price?.toLocaleString()}</strong>
            </div>
            <div className="preview-item">
              <span>Хямдрал:</span>
              <strong className="discount-badge">{discountFormData.discount_percent}%</strong>
            </div>
            <div className="preview-item">
              <span>Хямдралтай үнэ:</span>
              <strong className="discount-price">
                ₮{Math.round(selectedCourseForDiscount.price * (1 - discountFormData.discount_percent / 100)).toLocaleString()}
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
        <h3>Одоогийн хямдралууд ({courseDiscounts.length})</h3>
        {courseDiscounts.length === 0 ? (
          <p style={{ color: '#808080', textAlign: 'center', padding: '20px' }}>
            Хямдрал байхгүй байна
          </p>
        ) : (
          <div className="discounts-list">
            {courseDiscounts.map(discount => (
              <div key={discount.id} className={`discount-item ${discount.status}`}>
                <div className="discount-info">
                  <div className="discount-percent-big">{discount.discount_percent}%</div>
                  <div className="discount-details">
                    <div className="discount-dates">
                      <Calendar size={14} />
                      {new Date(discount.start_date).toLocaleDateString('mn-MN')} - {new Date(discount.end_date).toLocaleDateString('mn-MN')}
                    </div>
                    <div className="discount-status-badge">
                      {discount.status === 'active' && <span className="badge-active">Идэвхтэй</span>}
                      {discount.status === 'upcoming' && <span className="badge-upcoming">Удахгүй</span>}
                      {discount.status === 'expired' && <span className="badge-expired">Дууссан</span>}
                    </div>
                  </div>
                </div>
                <div className="discount-actions">
                  {discount.status === 'active' || discount.status === 'upcoming' ? (
                    <button 
                      className="btn-icon btn-danger"
                      onClick={() => handleDeleteDiscount(discount.id)}
                      title="Устгах"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}
      {/* Courses Table */}
      <div className="courses-section">
        <h2>
          {currentUser?.role === 'test_admin' 
            ? `Миний хичээлүүд (${courses.length})` 
            : `Бүх хичээлүүд (${courses.length})`}
        </h2>
        {loading ? (
          <div className="loading">Уншиж байна...</div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={64} />
            <p>
              {currentUser?.role === 'test_admin' 
                ? 'Та одоогоор хичээл нэмээгүй байна' 
                : 'Хичээл байхгүй байна'}
            </p>
          </div>
        ) : (
          <div className="courses-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Нэр</th>
                  <th>Ангилал</th>
                  <th>Үнэ</th>
                  <th>Суралцагчид</th>
                  <th>Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id}>
                    <td>{course.id}</td>
                    <td>{course.title}</td>
                    <td>{course.category}</td>
                    <td>
                      {course.is_free ? (
                        <span className="badge-free">Үнэгүй</span>
                      ) : (
                        `₮${course.price.toLocaleString()}`
                      )}
                    </td>
                    <td>{course.students || 0}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon"
                          onClick={() => handleManageCourse(course)}
                          title="Агуулга удирдах"
                        >
                          <BookOpen size={16} />
                        </button>
                        <button 
                          className="btn-icon"
                          onClick={() => window.open(`/course/${course.id}`, '_blank')}
                          title="Үзэх"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="btn-icon"
                          onClick={() => handleEdit(course)}
                          title="Засах"
                        >
                             <button 
    className="btn-icon"
    onClick={() => handleOpenDiscountModal(course)}
    title="Хямдрал"
    style={{ color: '#ffc107' }}
  ></button>
                          <Edit size={16} />
                        </button>
                        {currentUser?.role === 'admin' && (
                          <button 
                            className="btn-icon btn-danger"
                            onClick={() => handleDelete(course.id)}
                            title="Устгах"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;