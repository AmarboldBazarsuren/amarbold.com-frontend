import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, PlayCircle, TrendingUp } from 'lucide-react';
import '../styles/MyCourses.css';
import api from '../config/api';  // ✅ Энийг нэмэх

function MyCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/courses/my-courses',);
      
      // Backend-с ирсэн өгөгдлийг шалгах
      if (response.data.success && Array.isArray(response.data.data)) {
        setEnrolledCourses(response.data.data);
      } else {
        console.error('Буруу өгөгдлийн format:', response.data);
        setEnrolledCourses([]);
      }
    } catch (error) {
      console.error('Хичээлүүдийг татахад алдаа гарлаа:', error);
      setEnrolledCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="mycourses-loading">
        <div className="loader"></div>
        <p>Хичээлүүдийг уншиж байна...</p>
      </div>
    );
  }

  return (
    <div className="mycourses">
      <div className="mycourses-header">
        <h1 className="mycourses-title">Миний хичээлүүд</h1>
        <p className="mycourses-subtitle">
          Таны бүртгүүлсэн бүх хичээлүүд энд байна
        </p>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="no-courses">
          <BookOpen size={80} />
          <h3>Танд одоогоор хичээл байхгүй байна</h3>
          <p>Хичээл худалдаж авснаар энд харагдах болно</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/dashboard')}
          >
            Хичээл үзэх
          </button>
        </div>
      ) : (
        <>
          <div className="progress-overview">
            <div className="progress-card">
              <div className="progress-icon">
                <BookOpen size={28} />
              </div>
              <div className="progress-info">
                <div className="progress-value">{enrolledCourses.length}</div>
                <div className="progress-label">Нийт хичээл</div>
              </div>
            </div>
            <div className="progress-card">
              <div className="progress-icon completed">
                <CheckCircle size={28} />
              </div>
              <div className="progress-info">
                <div className="progress-value">
                  {enrolledCourses.filter(c => c.progress === 100).length}
                </div>
                <div className="progress-label">Дууссан</div>
              </div>
            </div>
            <div className="progress-card">
              <div className="progress-icon in-progress">
                <PlayCircle size={28} />
              </div>
              <div className="progress-info">
                <div className="progress-value">
                  {enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length}
                </div>
                <div className="progress-label">Үргэлжилж буй</div>
              </div>
            </div>
            <div className="progress-card">
              <div className="progress-icon">
                <TrendingUp size={28} />
              </div>
              <div className="progress-info">
                <div className="progress-value">
                  {Math.round(
                    enrolledCourses.reduce((acc, c) => acc + (c.progress || 0), 0) / 
                    enrolledCourses.length
                  )}%
                </div>
                <div className="progress-label">Дундаж явц</div>
              </div>
            </div>
          </div>

          <div className="mycourses-grid">
            {enrolledCourses.map(course => (
              <div 
                key={course.id} 
                className="mycourse-card"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="mycourse-image">
                  <img src={course.thumbnail || '/placeholder-course.jpg'} alt={course.title} />
                  {course.progress === 100 && (
                    <div className="completed-badge">
                      <CheckCircle size={24} />
                      <span>Дууссан</span>
                    </div>
                  )}
                </div>
                <div className="mycourse-content">
                  <h3 className="mycourse-title">{course.title}</h3>
                  <div className="mycourse-instructor">
                    <div className="instructor-avatar">
                      {course.instructor?.name?.charAt(0) || 'B'}
                    </div>
                    <span>{course.instructor?.name || 'Багш'}</span>
                  </div>
                  
                  <div className="course-progress">
                    <div className="progress-header">
                      <span className="progress-text">Явц</span>
                      <span className="progress-percentage">{course.progress || 0}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                 <div className="mycourse-meta">
                    <div className="meta-item">
                      <Clock size={16} />
                      <span>{course.duration || '10'} цаг</span>
                    </div>
                    <div className="meta-item">
                      <PlayCircle size={16} />
                      <span>{course.completedLessons || 0}/{course.totalLessons || 20} хичээл</span>
                    </div>
                    {/* ✅ Хямдралтай худалдаж авсан бол харуулах */}
                    {course.discount_percent && (
                      <div className="meta-item" style={{ color: '#ffc107' }}>
                        <span style={{
                          padding: '2px 6px',
                          background: 'rgba(255, 193, 7, 0.2)',
                          border: '1px solid rgba(255, 193, 7, 0.4)',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          -{course.discount_percent}% хямдралтай авсан
                        </span>
                      </div>
                    )}
                  </div>

                  <button className="btn-continue">
                    {course.progress === 0 ? 'Эхлэх' : 
                     course.progress === 100 ? 'Дахин үзэх' : 'Үргэлжлүүлэх'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MyCourses;