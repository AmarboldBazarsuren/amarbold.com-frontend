import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import '../styles/CourseManage.css';
import api from '../config/api';

function CourseManage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Section форм
  // 🔥 showSectionForm устгасан - үргэлж харагдана
  const [sectionFormData, setSectionFormData] = useState({
    title: '',
    description: '',
    order_number: 0
  });
  const [editingSection, setEditingSection] = useState(null);
  
  // Lesson форм
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

  const fetchCourse = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`${process.env.REACT_APP_API_URL}/api/courses/${id}`);
      
      if (response.data.success) {
        setCourse(response.data.course);
        setSections(response.data.course.sections || []);
      }
    } catch (error) {
      console.error('Хичээл татахад алдаа:', error);
      alert('Хичээл татахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const handleAddSection = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingSection) {
        await axios.put(
          `/api/admin/sections/${editingSection.id}`,
          sectionFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Section амжилттай шинэчлэгдлээ');
      } else {
        await axios.post(
          `/api/admin/courses/${id}/sections`,
          sectionFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Section амжилттай нэмэгдлээ');
      }
      
      setSectionFormData({ title: '', description: '', order_number: 0 });
      setEditingSection(null);
      fetchCourse();
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Энэ section-ийг устгах уу? Доторх бүх хичээлүүд устана.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `/api/admin/sections/${sectionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Section амжилттай устгагдлаа');
      fetchCourse();
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
          `/api/admin/lessons/${editingLesson.id}`,
          lessonFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Хичээл амжилттай шинэчлэгдлээ');
      } else {
        await axios.post(
          `/api/admin/sections/${selectedSection.id}/lessons`,
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
      fetchCourse();
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  const handleEditLesson = (lesson) => {
    const lessonSection = sections.find(section => 
      section.lessons?.some(l => l.id === lesson.id)
    );
    
    if (lessonSection) {
      setSelectedSection(lessonSection);
      setEditingLesson(lesson);
      setLessonFormData({
        title: lesson.title,
        description: lesson.description || '',
        video_url: lesson.video_url || '',
        duration: lesson.duration || 0,
        order_number: lesson.order_number || 0,
        is_free_preview: lesson.is_free_preview || false
      });
      setShowLessonForm(true);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Энэ хичээлийг устгах уу?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `/api/admin/lessons/${lessonId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Хичээл амжилттай устгагдлаа');
      fetchCourse();
    } catch (error) {
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  if (loading) {
    return (
      <div className="course-manage-loading">
        <div className="loader"></div>
        <p>Уншиж байна...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-manage-error">
        <h2>Хичээл олдсонгүй</h2>
        <button className="btn btn-primary" onClick={() => navigate('/admin')}>
          Буцах
        </button>
      </div>
    );
  }

  return (
    <div className="course-manage">
      <button className="btn-back" onClick={() => navigate(`/course/${id}`)}>
        <ArrowLeft size={20} />
        Буцах
      </button>

      <div className="manage-header">
        <h1>{course.title} - Агуулга удирдах</h1>
        <p style={{ color: '#808080', marginTop: '8px' }}>
          Section нэмээд, дараа нь хичээлүүдийг нэмж эхлээрэй
        </p>
      </div>

      {/* SECTION ФОРМ */}
      <div className="section-form-card">
        <div className="form-header">
          <h2>{editingSection ? 'Бүлэг засах' : 'Шинэ бүлэг нэмэх'}</h2>
        </div>
        <form onSubmit={handleAddSection}>
          <div className="input-group">
            <label>Бүлгийн нэр *</label>
            <input
              type="text"
              value={sectionFormData.title}
              onChange={(e) => setSectionFormData({...sectionFormData, title: e.target.value})}
              placeholder="Жишээ: 1-р бүлэг - Танилцуулга"
              required
            />
          </div>
          <div className="input-group">
            <label>Тайлбар</label>
            <textarea
              value={sectionFormData.description}
              onChange={(e) => setSectionFormData({...sectionFormData, description: e.target.value})}
              rows="2"
              placeholder="Энэ бүлгийн тухай товч мэдээлэл (заавал биш)"
            />
          </div>
        
          <div className="form-actions">
            {editingSection && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditingSection(null);
                  setSectionFormData({ title: '', description: '', order_number: 0 });
                }}
              >
                Цуцлах
              </button>
            )}
            <button type="submit" className="btn btn-primary">
              {editingSection ? 'Шинэчлэх' : 'Бүлэг нэмэх'}
            </button>
          </div>
        </form>
      </div>

      {/* SECTIONS LIST */}
      {sections.length > 0 ? (
        <div className="sections-list">
          {sections.map((section, idx) => (
            <div key={section.id} className="section-card">
              <div className="section-header">
                <div>
                  <h3>{idx + 1}. {section.title}</h3>
                  {section.description && (
                    <p style={{ color: '#808080', fontSize: '14px', marginTop: '4px' }}>
                      {section.description}
                    </p>
                  )}
                </div>
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

              {/* LESSON ФОРМ */}
              {showLessonForm && selectedSection?.id === section.id && (
                <div className="lesson-form">
                  <h4>{editingLesson ? 'Хичээл засах' : 'Шинэ хичээл нэмэх'}</h4>
                  <form onSubmit={handleAddLesson}>
                    <div className="input-group">
                      <label>Хичээлийн нэр *</label>
                      <input
                        type="text"
                        value={lessonFormData.title}
                        onChange={(e) => setLessonFormData({...lessonFormData, title: e.target.value})}
                        placeholder="Жишээ: 1.1 - HTML танилцуулга"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label>Тайлбар</label>
                      <textarea
                        value={lessonFormData.description}
                        onChange={(e) => setLessonFormData({...lessonFormData, description: e.target.value})}
                        rows="2"
                        placeholder="Энэ хичээлийн тухай товч мэдээлэл (заавал биш)"
                      />
                    </div>
                    <div className="input-group">
                      <label>YouTube Video URL *</label>
                      <input
                        type="text"
                        value={lessonFormData.video_url}
                        onChange={(e) => setLessonFormData({...lessonFormData, video_url: e.target.value})}
                        placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        required
                      />
                      <small style={{color: '#808080', fontSize: '12px', marginTop: '4px', display: 'block'}}>
                        YouTube видео линк оруулна уу
                      </small>
                    </div>
                    <div className="form-row">
                      <div className="input-group">
                        <label>Үргэлжлэх хугацаа (секунд)</label>
                        <input
                          type="number"
                          value={lessonFormData.duration}
                          onChange={(e) => setLessonFormData({...lessonFormData, duration: parseInt(e.target.value) || 0})}
                          placeholder="300"
                        />
                        <small style={{color: '#808080', fontSize: '11px', marginTop: '4px', display: 'block'}}>
                          Жишээ: 5 минут = 300 секунд
                        </small>
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
                        {editingLesson ? 'Шинэчлэх' : 'Хичээл нэмэх'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* LESSONS LIST */}
              {section.lessons && section.lessons.length > 0 ? (
                <div className="lessons-list">
                  {section.lessons.map((lesson, lessonIdx) => (
                    <div key={lesson.id} className="lesson-card">
                      <div className="lesson-info">
                        <span className="lesson-number">{lessonIdx + 1}.</span>
                        <div className="lesson-details">
                          <span className="lesson-title">{lesson.title}</span>
                          {lesson.description && (
                            <span className="lesson-desc">{lesson.description}</span>
                          )}
                        </div>
                      </div>
                      <div className="lesson-meta">
                        {lesson.is_free_preview && <span className="free-badge">Үнэгүй</span>}
                        <span className="lesson-duration">
                          {Math.floor(lesson.duration / 60)}:{String(lesson.duration % 60).padStart(2, '0')}
                        </span>
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
                <div className="no-lessons">
                  <p>Энэ бүлэгт хичээл байхгүй байна.</p>
                  <button 
                    className="btn btn-primary btn-sm"
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
                    Эхний хичээлийг нэмэх
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Plus size={64} style={{ color: '#333', marginBottom: '16px' }} />
          <h3>Бүлэг байхгүй байна</h3>
          <p>Дээрх формоор эхний бүлгээ нэмж эхлээрэй</p>
        </div>
      )}
    </div>
  );
}

export default CourseManage;