import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PlayCircle, Clock, BookOpen, Star, CheckCircle, Lock, 
  ChevronDown, ChevronUp, Users, Award, ArrowLeft 
} from 'lucide-react';
import axios from 'axios';
import './CourseDetail.css';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [instructorProfile, setInstructorProfile] = useState(null);

  // ❌ Эдгээр state-үүдийг УСТГА - Popup хэрэггүй болсон
  // const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  // const [currentLesson, setCurrentLesson] = useState(null);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setCourse(response.data.course);
          setIsEnrolled(response.data.isEnrolled);
        }
      } catch (error) {
        console.error('Хичээлийн мэдээлэл татахад алдаа гарлаа:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [id]);

  useEffect(() => {
    if (course?.instructor?.id) {
      const getInstructor = async () => {
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
      };
      getInstructor();
    }
  }, [course]);

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

  // ✅ ШИНЭ: Хичээл дарахад шууд LessonPlayer хуудас руу шилжинэ
  const handleLessonClick = (lesson) => {
    // Бүртгүүлсэн эсвэл үнэгүй хичээл эсэхийг шалгах
    if (!isEnrolled && !lesson.is_free_preview) {
      alert('Энэ хичээлийг үзэхийн тулд эхлээд бүртгүүлнэ үү');
      return;
    }

    // ✅ Шууд LessonPlayer хуудас руу шилжинэ
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

          <div className="course-instructor-card">
            <div className="instructor-label">Багш</div>
            <div className="instructor-content">
              {instructorProfile?.profile_image ? (
                <img 
                  src={instructorProfile.profile_image} 
                  alt={course.instructor?.name}
                  className="instructor-image"
                />
              ) : (
                <div className="instructor-avatar-large">
                  {course.instructor?.name?.charAt(0) || 'B'}
                </div>
              )}
              <div className="instructor-info">
                <div className="instructor-name">{course.instructor?.name || 'Багш нэр'}</div>
                {instructorProfile?.teaching_categories && (
                  <div className="instructor-category">{instructorProfile.teaching_categories}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="course-hero-card">
          <div className="course-thumbnail">
            <img src={course.thumbnail || '/placeholder-course.jpg'} alt={course.title} />
          </div>
          <div className="course-price-section">
            {course.is_free || course.price === 0 ? (
              <div className="price-free">Үнэгүй</div>
            ) : (
              <div className="price">₮{course.price?.toLocaleString()}</div>
            )}
            {!isEnrolled ? (
              <button 
                className="btn btn-primary btn-full"
                onClick={handleEnroll}
                disabled={purchasing}
              >
                {purchasing ? (
                  <>
                    <div className="spinner"></div>
                    Бүртгүүлж байна...
                  </>
                ) : (
                  <>
                    <PlayCircle size={20} />
                    Хичээл авах
                  </>
                )}
              </button>
            ) : (
              <>
                <button className="btn btn-success btn-full" disabled>
                  <CheckCircle size={20} />
                  Бүртгүүлсэн
                </button>
                {/* ✅ Хичээл үзэх товч */}
                <button 
                  className="btn btn-primary btn-full"
                  onClick={() => navigate(`/course/${id}/learn`)}
                  style={{ marginTop: '12px' }}
                >
                  <PlayCircle size={20} />
                  Хичээл үзэх
                </button>
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
        </div>
      </div>

      {/* ✅ Хичээлийн агуулга - Дарахад LessonPlayer руу шилжинэ */}
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
                    {section.lessons.map((lesson, lessonIndex) => {
                      const canPlay = isEnrolled || lesson.is_free_preview;
                      return (
                        <div 
                          key={lesson.id || lessonIndex} 
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

      {/* ❌ VIDEO PLAYER MODAL-г бүтнээр УСТГАХ - Popup хэрэггүй болсон */}

      <div className="course-description-section">
        <h2 className="section-title">Хичээлийн тухай</h2>
        <div className="course-description-content">
          <p>{course.fullDescription || course.full_description || course.description}</p>
        </div>
      </div>

      {instructorProfile && instructorProfile.bio && (
        <div className="instructor-profile-section">
          <h2 className="section-title">Багшийн тухай</h2>
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