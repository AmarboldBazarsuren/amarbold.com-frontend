import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

function CourseContentModal({ 
  show, 
  onClose, 
  course,
  sections,
  showSectionForm,
  setShowSectionForm,
  sectionFormData,
  setSectionFormData,
  editingSection,
  setEditingSection,
  onAddSection,
  onEditSection,
  onDeleteSection,
  showLessonForm,
  setShowLessonForm,
  selectedSection,
  setSelectedSection,
  lessonFormData,
  setLessonFormData,
  editingLesson,
  setEditingLesson,
  onAddLesson,
  onEditLesson,
  onDeleteLesson
}) {
  if (!show || !course) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <h2>{course.title} - Агуулга удирдах</h2>
        
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
            <form onSubmit={onAddSection}>
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
                    onClick={() => onEditSection(section)}
                    title="Засах"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="btn-icon btn-danger"
                    onClick={() => onDeleteSection(section.id)}
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
                            onClick={() => onEditLesson(lesson)}
                            title="Засах"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="btn-icon btn-danger"
                            onClick={() => onDeleteLesson(lesson.id)}
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
  );
}

export default CourseContentModal;