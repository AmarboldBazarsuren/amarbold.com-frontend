import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PlayCircle, Clock, BookOpen, Star, CheckCircle, Lock, 
  ChevronDown, ChevronUp, Users, Award, ArrowLeft 
} from 'lucide-react';
import axios from 'axios';
import '../styles/CourseDetail.css';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isOwner, setIsOwner] = useState(false)
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [instructorProfile, setInstructorProfile] = useState(null);

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

  const fetchCourseDetail = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
  setCourse(response.data.course);
  setIsEnrolled(response.data.isEnrolled);
  
  // ✅ Багш эсэхийг шалгах
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const courseInstructorId = response.data.course.instructor?.id;
  setIsOwner(currentUser?.id === courseInstructorId);
}
    } catch (error) {
      console.error('Хичээлийн мэдээлэл татахад алдаа гарлаа:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchInstructorProfile = useCallback(async () => {
    if (!course?.instructor?.id) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/users/instructor/${course.instructor.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setInstructorProfile(response.data.instructor);
      }
    } catch (error) {
      console.error('Багшийн мэдээлэл татахад алдаа:', error);
    }
  }, [course?.instructor?.id]);

  useEffect(() => {
    fetchCourseDetail();
  }, [fetchCourseDetail]);

  useEffect(() => {
    if (course?.instructor?.id) {
      fetchInstructorProfile();
    }
  }, [course?.instructor?.id, fetchInstructorProfile]);

  const handleEnroll = async () => {
    setPurchasing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/courses/${id}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEnrolled(true);
      alert('Амжилттай бүртгүүллээ!');
    } catch (error) {
      alert(error.response?.data?.message || 'Бүртгүүлэхэд алдаа гарлаа');
    } finally {
      setPurchasing(false);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleLessonClick = (lesson) => {
    if (!isEnrolled && !lesson.is_free_preview) {
      alert('Энэ хичээлийг үзэхийн тулд эхлээд бүртгүүлнэ үү');
      return;
    }
    navigate(`/course/${id}/learn`);
  };

  if (loading) {
    return (
      <div className="course-detail-loading">
        <div className="loader"></div>
        <p>Хичээл уншиж байна...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-not-found">
        <h2>Хичээл олдсонгүй</h2>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Буцах
        </button>
      </div>
    );
  }

  return (
    <div className="course-detail">
      <button className="btn-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        Буцах
      </button>

      <div className="course-hero">
        <div className="course-hero-content">
          <div className="course-category-badge">{course.category}</div>
          <h1 className="course-hero-title">{course.title}</h1>
          <p className="course-hero-description">{course.description}</p>
          
          <div className="course-hero-meta">
            <div className="meta-item">
              <Star size={20} />
              <span>{course.rating || '4.8'} үнэлгээ</span>
            </div>
            <div className="meta-item">
              <Users size={20} />
              <span>{course.students || '0'} суралцагч</span>
            </div>
            <div className="meta-item">
              <Clock size={20} />
              <span>{course.duration || '10'} цаг</span>
            </div>
            <div className="meta-item">
              <BookOpen size={20} />
              <span>{course.sections?.length || 0} бүлэг</span>
            </div>
          </div>

          {/* ✅✅ ЗӨВХӨН ТАНИЛЦУУЛГА ВИДЕО - Багшийн хэсэг устгасан */}
          {course.preview_video_url && (
            <div className="preview-video-section">
              <div className="preview-label">Танилцуулга видео</div>
              <div className="preview-video-wrapper">
                {getYouTubeVideoId(course.preview_video_url) ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(course.preview_video_url)}`}
                    title="Preview Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="video-error">
                    <p>Видео тоглуулах боломжгүй</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ✅ ПРОФАЙЛ ҮЗЭХ ТОВЧ - Үргэлж харагдана */}
          <button
            onClick={() => navigate(`/instructor/${course.instructor.id}`)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '14px 24px',
              marginTop: course.preview_video_url ? '16px' : '0',
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '10px',
              color: '#00d4ff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 255, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Users size={18} />
            Багшийн профайл үзэх
          </button>
        </div>

        <div className="course-hero-card">
          <div className="course-thumbnail">
            <img src={course.thumbnail || '/placeholder-course.jpg'} alt={course.title} />
          </div>
          
          <div className="course-price-section">
            {course.is_free || course.price === 0 ? (
              <div className="price-free">Үнэгүй</div>
            ) : (
              <>
                {course.discount_price ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="original-price" style={{ 
                      fontSize: '20px',
                      color: '#808080', 
                      textDecoration: 'line-through' 
                    }}>
                      ₮{course.price?.toLocaleString()}
                    </div>
                    <div className="discount-price" style={{ 
                      fontSize: '36px',
                      fontWeight: '800',
                      color: '#34c759'
                    }}>
                      ₮{course.discount_price?.toLocaleString()}
                    </div>
                    {course.discount_percent && (
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: 'rgba(255, 193, 7, 0.2)',
                        border: '1px solid rgba(255, 193, 7, 0.4)',
                        borderRadius: '6px',
                        color: '#ffc107',
                        fontSize: '14px',
                        fontWeight: '700',
                        width: 'fit-content'
                      }}>
                        -{course.discount_percent}% хямдрал
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="price">₮{course.price?.toLocaleString()}</div>
                )}
              </>
            )}
          </div>

          <div className="course-includes">
            <h4>Энэ хичээлд орно:</h4>
            <ul>
              <li><PlayCircle size={16} /> Видео хичээлүүд</li>
              <li><Clock size={16} /> {course.duration || '10'} цагийн контент</li>
              <li><BookOpen size={16} /> Дэлгэрэнгүй материал</li>
              <li><Award size={16} /> Гэрчилгээ олгоно</li>
            </ul>
          </div>

          {/* Өөрийн хичээл биш бөгөөд бүртгүүлээгүй бол худалдаж авах товч */}
{!isOwner && !isEnrolled && (
  <button 
    onClick={handleEnroll}
    disabled={purchasing}
    style={{
      width: '100%',
      padding: '16px 24px',
      marginTop: '24px',
      background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
      border: 'none',
      borderRadius: '12px',
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: '700',
      cursor: purchasing ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 16px rgba(0, 212, 255, 0.3)',
      opacity: purchasing ? 0.6 : 1
    }}
    onMouseOver={(e) => {
      if (!purchasing) {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 212, 255, 0.5)';
      }
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 212, 255, 0.3)';
    }}
  >
    {purchasing ? (
      <>
        <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
        Бүртгэж байна...
      </>
    ) : (
      <>
        <PlayCircle size={20} />
        {course.is_free ? 'Үнэгүй бүртгүүлэх' : 'Худалдаж авах'}
      </>
    )}
  </button>
)}

{/* Өөрийн хичээл бол агуулга удирдах товчнууд */}
{isOwner && (
  <div style={{ marginTop: '24px' }}>
    <div style={{
      width: '100%',
      padding: '12px',
      background: 'rgba(255, 193, 7, 0.15)',
      border: '1px solid rgba(255, 193, 7, 0.3)',
      borderRadius: '8px',
      color: '#ffc107',
      fontSize: '14px',
      fontWeight: '600',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginBottom: '12px'
    }}>
      <CheckCircle size={18} />
      Таны хичээл
    </div>
    
    <button 
      onClick={() => navigate(`/course/${id}/learn`)}
      style={{
        width: '100%',
        padding: '14px 24px',
        marginBottom: '12px',
        background: 'rgba(0, 212, 255, 0.1)',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        borderRadius: '10px',
        color: '#00d4ff',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.3s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'rgba(0, 212, 255, 0.15)';
        e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
      }}
    >
      <PlayCircle size={20} />
      Хичээл үзэх
    </button>
    
    <button 
      onClick={() => navigate('/admin')}
      style={{
        width: '100%',
        padding: '14px 24px',
        background: 'rgba(255, 193, 7, 0.1)',
        border: '1px solid rgba(255, 193, 7, 0.3)',
        borderRadius: '10px',
        color: '#ffc107',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.3s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'rgba(255, 193, 7, 0.15)';
        e.currentTarget.style.borderColor = 'rgba(255, 193, 7, 0.5)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'rgba(255, 193, 7, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(255, 193, 7, 0.3)';
      }}
    >
      <BookOpen size={20} />
      Агуулга удирдах
    </button>
  </div>
)}

{/* Бүртгүүлсэн хэрэглэгч (өөрийнх биш) */}
{!isOwner && isEnrolled && (
  <>
    <div style={{
      width: '100%',
      padding: '12px',
      marginTop: '24px',
      background: 'rgba(52, 199, 89, 0.15)',
      border: '1px solid rgba(52, 199, 89, 0.3)',
      borderRadius: '8px',
      color: '#34c759',
      fontSize: '14px',
      fontWeight: '600',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    }}>
      <CheckCircle size={18} />
      Та энэ хичээлд бүртгүүлсэн байна
    </div>
    <button 
      onClick={() => navigate(`/course/${id}/learn`)}
      style={{
        width: '100%',
        padding: '14px 24px',
        marginTop: '12px',
        background: 'rgba(0, 212, 255, 0.1)',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        borderRadius: '10px',
        color: '#00d4ff',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.3s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'rgba(0, 212, 255, 0.15)';
        e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
      }}
    >
      <PlayCircle size={20} />
      Хичээл үзэх
    </button>
  </>
)}

          
        </div>
      </div>

      {course.sections?.length > 0 && (
        <div className="course-content-section">
          <h2 className="section-title">Хичээлийн агуулга</h2>
          <div className="course-curriculum">
            {course.sections.map((section, index) => (
              <div key={section.id || index} className="curriculum-section">
                <div 
                  className="section-header"
                  onClick={() => toggleSection(section.id || index)}
                >
                  <div className="section-info">
                    <h3>{section.title}</h3>
                    <span className="section-meta">
                      {section.lessons?.length || 0} хичээл
                    </span>
                  </div>
                  {expandedSections[section.id || index] ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
                
                {expandedSections[section.id || index] && section.lessons?.length > 0 && (
                  <div className="section-lessons">
                    {section.lessons.map((lesson, lessonIdx) => {
                      const canPlay = isEnrolled || lesson.is_free_preview;
                      return (
                        <div 
                          key={lesson.id || lessonIdx} 
                          className={`lesson-item ${!canPlay ? 'locked' : 'playable'}`}
                          onClick={() => canPlay && handleLessonClick(lesson)}
                          style={{ cursor: canPlay ? 'pointer' : 'not-allowed' }}
                        >
                          <div className="lesson-info">
                            {canPlay ? (
                              <PlayCircle size={18} />
                            ) : (
                              <Lock size={18} />
                            )}
                            <span className="lesson-title">{lesson.title}</span>
                            {lesson.is_free_preview && (
                              <span className="free-preview-badge">Үнэгүй</span>
                            )}
                          </div>
                          <span className="lesson-duration">
                            {Math.floor((lesson.duration || 0) / 60)}:{String((lesson.duration || 0) % 60).padStart(2,'0')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="course-description-section">
        <h2 className="section-title">Хичээлийн тухай</h2>
        <div className="course-description-content">
          <p>{course.fullDescription || course.full_description || course.description}</p>
        </div>
      </div>

      {instructorProfile && instructorProfile.bio && (
        <div className="instructor-profile-section">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Багшийн тухай</h2>
            <button
              onClick={() => navigate(`/instructor/${course.instructor.id}`)}
              style={{
                padding: '10px 20px',
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '8px',
                color: '#00d4ff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(0, 212, 255, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
              }}
            >
              <BookOpen size={16} />
              Бүх хичээл үзэх
            </button>
          </div>
          <div className="instructor-profile-card">
            {instructorProfile.profile_banner && (
              <div className="instructor-banner">
                <img src={instructorProfile.profile_banner} alt="Banner" />
              </div>
            )}
            <div className="instructor-profile-content">
              <div className="instructor-profile-left">
                {instructorProfile.profile_image ? (
                  <img 
                    src={instructorProfile.profile_image} 
                    alt={instructorProfile.name}
                    className="instructor-profile-image"
                  />
                ) : (
                  <div className="instructor-profile-avatar">
                    {instructorProfile.name?.charAt(0) || 'B'}
                  </div>
                )}
                <div className="instructor-profile-info">
                  <h3>{instructorProfile.name}</h3>
                  {instructorProfile.teaching_categories && (
                    <p className="teaching-cats">{instructorProfile.teaching_categories}</p>
                  )}
                  <div className="instructor-stats-small">
                    <div className="stat-item-small">
                      <BookOpen size={16} />
                      <span>{instructorProfile.total_courses || 0} хичээл</span>
                    </div>
                    <div className="stat-item-small">
                      <Users size={16} />
                      <span>{instructorProfile.total_students || 0} суралцагч</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="instructor-bio">
                <h4>Танилцуулга</h4>
                <p>{instructorProfile.bio}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetail;