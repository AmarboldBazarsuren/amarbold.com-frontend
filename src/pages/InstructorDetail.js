import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Users, ArrowLeft, Clock, Star } from 'lucide-react';
import axios from 'axios';
import './InstructorDetail.css';

function InstructorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstructorDetail();
    // eslint-disable-next-line
  }, [id]);

  const fetchInstructorDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/instructors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setInstructor(response.data.instructor);
      }
    } catch (error) {
      console.error('Багшийн мэдээлэл татахад алдаа:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="instructor-detail-loading">
        <div className="loader"></div>
        <p>Уншиж байна...</p>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="instructor-not-found">
        <h2>Багш олдсонгүй</h2>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Буцах
        </button>
      </div>
    );
  }

  return (
    <div className="instructor-detail">
      <button className="btn-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        Буцах
      </button>

      {/* Instructor Header */}
      <div className="instructor-header">
        <div className="instructor-banner-large">
          {instructor.profile_banner ? (
            <img src={instructor.profile_banner} alt="" />
          ) : (
            <div className="banner-gradient-large"></div>
          )}
        </div>

        <div className="instructor-info-section">
          <div className="instructor-avatar-xl">
            {instructor.profile_image ? (
              <img src={instructor.profile_image} alt={instructor.name} />
            ) : (
              <div className="avatar-placeholder-xl">
                {instructor.name?.charAt(0) || 'B'}
              </div>
            )}
          </div>

          <div className="instructor-details">
            <h1 className="instructor-name-large">{instructor.name}</h1>
            {instructor.teaching_categories && (
              <p className="instructor-category-large">{instructor.teaching_categories}</p>
            )}

            <div className="instructor-stats-large">
              <div className="stat-box-large">
                <BookOpen size={28} />
                <div>
                  <div className="stat-value-large">{instructor.total_courses || 0}</div>
                  <div className="stat-label-large">Хичээл</div>
                </div>
              </div>
              <div className="stat-box-large">
                <Users size={28} />
                <div>
                  <div className="stat-value-large">{instructor.total_students || 0}</div>
                  <div className="stat-label-large">Суралцагч</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {instructor.bio && (
        <div className="instructor-bio-section">
          <h2 className="section-title">Багшийн тухай</h2>
          <div className="bio-content">
            <p>{instructor.bio}</p>
          </div>
        </div>
      )}

      {/* Courses */}
      <div className="instructor-courses-section">
        <h2 className="section-title">Хичээлүүд ({instructor.courses?.length || 0})</h2>
        
        {instructor.courses && instructor.courses.length > 0 ? (
          <div className="courses-grid">
            {instructor.courses.map(course => (
              <div 
                key={course.id} 
                className="course-card"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="course-image">
                  <img src={course.thumbnail || '/placeholder-course.jpg'} alt={course.title} />
                  <div className="course-badge">{course.category}</div>
                </div>
                <div className="course-content">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description">{course.description}</p>
                  <div className="course-meta">
                    <div className="course-stats">
                      <div className="stat">
                        <Clock size={16} />
                        <span>{course.duration || '10'} цаг</span>
                      </div>
                      <div className="stat">
                        <Star size={16} />
                        <span>{course.rating || '4.5'}</span>
                      </div>
                      <div className="stat">
                        <Users size={16} />
                        <span>{course.students || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="course-footer">
                    <div className="course-price">
                      {course.is_free || course.price === 0 ? (
                        <span className="free-badge">Үнэгүй</span>
                      ) : (
                        <span className="price">₮{course.price?.toLocaleString()}</span>
                      )}
                    </div>
                    <button className="btn-enroll">
                      Үзэх
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-courses">
            <BookOpen size={64} />
            <p>Хичээл байхгүй байна</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default InstructorDetail;