import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, CheckCircle, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import '../styles/LessonPlayer.css';

function LessonPlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // ✅ САЙЖРУУЛСАН YouTube Video ID функц
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      
      // youtu.be хэлбэр
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1).split('?')[0];
      }
      
      // youtube.com хэлбэр
      if (urlObj.hostname.includes('youtube.com')) {
        // watch?v= хэлбэр
        if (urlObj.searchParams.has('v')) {
          return urlObj.searchParams.get('v');
        }
        
        // embed/ хэлбэр
        if (urlObj.pathname.includes('/embed/')) {
          return urlObj.pathname.split('/embed/')[1].split('?')[0];
        }
        
        // /v/ хэлбэр
        if (urlObj.pathname.includes('/v/')) {
          return urlObj.pathname.split('/v/')[1].split('?')[0];
        }
      }
      
      return null;
    } catch (e) {
      // URL parse хийж чадахгүй бол regex ашиглана
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[7].length === 11) ? match[7] : null;
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCourse(response.data.course);
        setIsEnrolled(response.data.isEnrolled);
        
        // Бүх section-г задлах
        const expanded = {};
        response.data.course.sections?.forEach(section => {
          expanded[section.id] = true;
        });
        setExpandedSections(expanded);
        
        // Эхний хичээлийг сонгох
        if (response.data.course.sections?.[0]?.lessons?.[0]) {
          const firstLesson = response.data.course.sections[0].lessons[0];
          if (response.data.isEnrolled || firstLesson.is_free_preview) {
            setCurrentLesson(firstLesson);
          }
        }
      }
    } catch (error) {
      console.error('Хичээл татахад алдаа:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (lesson) => {
    if (!isEnrolled && !lesson.is_free_preview) {
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
            <p>{course.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0)} хичээл</p>
          </div>
        </div>

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
                    const canPlay = isEnrolled || lesson.is_free_preview;
                    const isActive = currentLesson?.id === lesson.id;
                    
                    return (
                      <div
                        key={lesson.id}
                        className={`lesson-item-sidebar ${!canPlay ? 'locked' : ''} ${isActive ? 'active' : ''}`}
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
              <h1 className="lesson-title-main">{currentLesson.title}</h1>
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
    </div>
  );
}

export default LessonPlayer;