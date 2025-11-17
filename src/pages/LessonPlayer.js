import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, CheckCircle, Lock, ChevronDown, ChevronUp, Check, Star } from 'lucide-react';
import RatingModal from '../components/RatingModal';
import '../styles/LessonPlayer.css';
import api from '../config/api';  // ✅ Энийг нэмэх

function LessonPlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [courseProgress, setCourseProgress] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1).split('?')[0];
      }
      
      if (urlObj.hostname.includes('youtube.com')) {
        if (urlObj.searchParams.has('v')) {
          return urlObj.searchParams.get('v');
        }
        
        if (urlObj.pathname.includes('/embed/')) {
          return urlObj.pathname.split('/embed/')[1].split('?')[0];
        }
        
        if (urlObj.pathname.includes('/v/')) {
          return urlObj.pathname.split('/v/')[1].split('?')[0];
        }
      }
      
      return null;
    } catch (e) {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[7].length === 11) ? match[7] : null;
    }
  };

  useEffect(() => {
    fetchCourse();
    checkUserRating();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/api/courses/${courseId}`);
      
      if (response.data.success) {
        setCourse(response.data.course);
        setIsEnrolled(response.data.isEnrolled);
        
        // 🔥 Багш эсэхийг шалгах
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const courseInstructorId = response.data.course.instructor?.id;
        const ownerStatus = currentUser?.id === courseInstructorId;
        setIsOwner(ownerStatus);
        
        const expanded = {};
        response.data.course.sections?.forEach(section => {
          expanded[section.id] = true;
        });
        setExpandedSections(expanded);
        
        if (response.data.course.sections?.[0]?.lessons?.[0]) {
          const firstLesson = response.data.course.sections[0].lessons[0];
          // 🔥 Багш бол бүх хичээлийг үзнэ, бүртгүүлсэн эсвэл үнэгүй preview
          if (ownerStatus || response.data.isEnrolled || firstLesson.is_free_preview) {
            setCurrentLesson(firstLesson);
          }
        }

        // ✅ Прогресс татах - Зөвхөн бүртгүүлсэн бол
        if (response.data.isEnrolled) {
          await fetchProgress();
        }
      }
    } catch (error) {
      console.error('Хичээл татахад алдаа:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserRating = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(
        `/api/ratings/courses/${courseId}/my-rating`
      );
      if (response.data.success) {
        setUserRating(response.data.data);
      }
    } catch (error) {
      console.error('Үнэлгээ шалгахад алдаа:', error);
    }
  };

  const handleRateSubmit = async (data) => {
    try {
      const token = localStorage.getItem('token');
      await api.post(
        `/api/ratings/courses/${courseId}`,
        data,
      );
      alert('Үнэлгээ амжилттай өгөгдлөө!');
      setShowRatingModal(false);
      checkUserRating();
    } catch (error) {
      alert(error.response?.data?.message || 'Үнэлгээ өгөхөд алдаа гарлаа');
    }
  };

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(
        `/api/lessons/${courseId}/progress`
      );

      if (response.data.success) {
        const completed = new Set(
          response.data.data.lessons
            .filter(l => l.is_completed)
            .map(l => l.id)
        );
        setCompletedLessons(completed);
        setCourseProgress(response.data.data.progress);
      }
    } catch (error) {
      console.error('Прогресс татахад алдаа:', error);
    }
  };

  const toggleLessonComplete = async (lessonId, e) => {
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('token');
      const isCompleted = completedLessons.has(lessonId);

      if (isCompleted) {
        await api.delete(
          `/api/lessons/${lessonId}/complete`,
        );
        
        const newCompleted = new Set(completedLessons);
        newCompleted.delete(lessonId);
        setCompletedLessons(newCompleted);
      } else {
        const response = await api.post(
          `/api/lessons/${lessonId}/complete`,
          {}
        );

        if (response.data.success) {
          const newCompleted = new Set(completedLessons);
          newCompleted.add(lessonId);
          setCompletedLessons(newCompleted);
          setCourseProgress(response.data.data.progress);
        }
      }
    } catch (error) {
      console.error('Хичээл тэмдэглэхэд алдаа:', error);
      alert(error.response?.data?.message || 'Алдаа гарлаа');
    }
  };

  const handleLessonClick = (lesson) => {
    // 🔥 Багш, бүртгүүлсэн эсвэл үнэгүй preview
    const canPlay = isOwner || isEnrolled || lesson.is_free_preview;
    
    if (!canPlay) {
      alert('Энэ хичээлийг үзэхийн тулд эхлээд бүртгүүлнэ үү');
      return;
    }
    setCurrentLesson(lesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  if (loading) {
    return (
      <div className="lesson-player-loading">
        <div className="loader"></div>
        <p>Уншиж байна...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="lesson-player-error">
        <h2>Хичээл олдсонгүй</h2>
        <button className="btn btn-primary" onClick={() => navigate('/my-courses')}>
          Буцах
        </button>
      </div>
    );
  }

  return (
    <div className="lesson-player-layout">
      {/* Зүүн тал - Хичээлийн жагсаалт */}
      <aside className="lesson-sidebar">
        <div className="sidebar-header">
          <button className="btn-back-sidebar" onClick={() => navigate(`/course/${courseId}`)}>
            <ArrowLeft size={20} />
          </button>
          <div className="course-title-sidebar">
            <h2>{course.title}</h2>
            {/* 🔥 Прогресс зөвхөн бүртгүүлсэн хүнд харуулах */}
            {isEnrolled && (
              <div className="course-progress-sidebar">
                <span>{courseProgress}% дууссан</span>
                <div className="progress-bar-mini">
                  <div 
                    className="progress-fill-mini" 
                    style={{ width: `${courseProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            {/* 🔥 Багш бол "Таны хичээл" гэж харуулах */}
            {isOwner && (
              <div style={{
                marginTop: '8px',
                padding: '4px 8px',
                background: 'rgba(255, 193, 7, 0.15)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#ffc107',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                Таны хичээл
              </div>
            )}
          </div>
        </div>

        {/* 🔥 Үнэлгээ - Зөвхөн бүртгүүлсэн болон 80% дууссан бол */}
        {isEnrolled && courseProgress >= 80 && (
          <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              onClick={() => setShowRatingModal(true)}
              style={{
                width: '100%',
                padding: '12px',
                background: userRating 
                  ? 'rgba(52, 199, 89, 0.1)' 
                  : 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                border: userRating ? '1px solid rgba(52, 199, 89, 0.3)' : 'none',
                borderRadius: '8px',
                color: userRating ? '#34c759' : '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Star size={18} fill={userRating ? '#34c759' : '#ffffff'} />
              {userRating ? `Үнэлгээ: ${userRating.rating} од` : 'Үнэлгээ өгөх'}
            </button>
          </div>
        )}

        <div className="lessons-list-sidebar">
          {course.sections?.map((section, sectionIdx) => (
            <div key={section.id} className="section-sidebar">
              <div 
                className="section-header-sidebar"
                onClick={() => toggleSection(section.id)}
              >
                <div className="section-info-sidebar">
                  <h3>{sectionIdx + 1}. {section.title}</h3>
                  <span>{section.lessons?.length || 0} хичээл</span>
                </div>
                {expandedSections[section.id] ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>

              {expandedSections[section.id] && (
                <div className="lessons-section-list">
                  {section.lessons?.map((lesson, lessonIdx) => {
                    // 🔥 Багш бол бүх хичээлийг үзнэ
                    const canPlay = isOwner || isEnrolled || lesson.is_free_preview;
                    const isActive = currentLesson?.id === lesson.id;
                    const isCompleted = completedLessons.has(lesson.id);
                    
                    return (
                      <div
                        key={lesson.id}
                        className={`lesson-item-sidebar ${!canPlay ? 'locked' : ''} ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                        onClick={() => canPlay && handleLessonClick(lesson)}
                      >
                        <div className="lesson-icon-sidebar">
                          {canPlay ? (
                            isActive ? <PlayCircle size={20} /> : <PlayCircle size={20} />
                          ) : (
                            <Lock size={20} />
                          )}
                        </div>
                        <div className="lesson-info-sidebar">
                          <div className="lesson-title-sidebar">
                            {lessonIdx + 1}. {lesson.title}
                          </div>
                          <div className="lesson-meta-sidebar">
                            {lesson.is_free_preview && <span className="free-badge">Үнэгүй</span>}
                            <span>{Math.floor(lesson.duration / 60)}:{String(lesson.duration % 60).padStart(2, '0')}</span>
                          </div>
                        </div>
                        
                        {/* ✅ CHECK MARK - Зөвхөн бүртгүүлсэн хүнд */}
                        {isEnrolled && canPlay && (
                          <button
                            className={`check-btn ${isCompleted ? 'checked' : ''}`}
                            onClick={(e) => toggleLessonComplete(lesson.id, e)}
                            title={isCompleted ? 'Үзээгүй болгох' : 'Үзсэн гэж тэмдэглэх'}
                          >
                            <Check size={18} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Баруун тал - Видео Player */}
      <main className="lesson-content">
        {currentLesson ? (
          <>
            <div className="video-player-container">
              {getYouTubeVideoId(currentLesson.video_url) ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(currentLesson.video_url)}`}
                  title={currentLesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="video-error">
                  <p>Видео тоглуулах боломжгүй. YouTube URL: {currentLesson.video_url || 'хоосон'}</p>
                </div>
              )}
            </div>

            <div className="lesson-details">
              <div className="lesson-header-main">
                <h1 className="lesson-title-main">{currentLesson.title}</h1>
                
                {/* ✅ COMPLETE BUTTON - Зөвхөн бүртгүүлсэн хүнд */}
                {isEnrolled && (
                  <button
                    className={`btn-complete-lesson ${completedLessons.has(currentLesson.id) ? 'completed' : ''}`}
                    onClick={(e) => toggleLessonComplete(currentLesson.id, e)}
                  >
                    <CheckCircle size={20} />
                    {completedLessons.has(currentLesson.id) ? 'Дууссан' : 'Дуусгах'}
                  </button>
                )}
              </div>
              
              {currentLesson.description && (
                <div className="lesson-description-main">
                  <h3>Хичээлийн тухай</h3>
                  <p>{currentLesson.description}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="no-lesson-selected">
            <PlayCircle size={64} />
            <h3>Хичээл сонгоно уу</h3>
            <p>Зүүн талаас хичээл сонгож үзээрэй</p>
          </div>
        )}
      </main>

      <RatingModal
        show={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        courseTitle={course?.title}
        onSubmit={handleRateSubmit}
        existingRating={userRating}
      />
    </div>
  );
}

export default LessonPlayer;