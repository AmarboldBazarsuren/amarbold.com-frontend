// src/pages/Dashboard.js - ШИНЭЧИЛСЭН

// src/pages/Dashboard.js - ШИНЭЧИЛСЭН DESIGN

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import api from '../config/api';

// Components
import DashboardStats from '../components/dashboard/DashboardStats';
import CourseCarousel from '../components/dashboard/CourseCarousel';

function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalInstructors: 0,
    activeInstructors: 0,
    averageRating: '4.8'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
    fetchStats();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/api/courses');
      if (response.data.success && Array.isArray(response.data.data)) {
        setCourses(response.data.data);
      }
    } catch (error) {
      console.error('Хичээл татахад алдаа:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await api.get('/api/instructors');
      if (response.data.success && Array.isArray(response.data.data)) {
        setInstructors(response.data.data);
      }
    } catch (error) {
      console.error('Багш нар татахад алдаа:', error);
      setInstructors([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/courses/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Статистик татахад алдаа:', error);
    }
  };

  const recentCourses = [...courses]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  const recentInstructors = [...instructors]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 12);

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleInstructorClick = (instructorId) => {
    navigate(`/instructor/${instructorId}`);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Хичээлүүдийг уншиж байна...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
     

      {/* 🔥 Сүүлд нэмэгдсэн хичээлүүд - ЖИЖИГ */}
      {recentCourses.length > 0 && (
        <div className="section-wrapper">
          <CourseCarousel
            title="Сүүлд нэмэгдсэн хичээлүүд"
            courses={recentCourses}
            onCourseClick={handleCourseClick}
          />
        </div>
      )}

      {/* 🔥 Багш нар - ЗӨВХӨН ЗУРАГ */}
      {recentInstructors.length > 0 && (
        <div className="section-wrapper">
          <div className="instructors-simple-section">
            <h2 className="section-title-simple">Багш нар</h2>
            <div className="instructors-simple-grid">
              {recentInstructors.map((instructor) => (
                <div 
                  key={instructor.id} 
                  className="instructor-simple-card"
                  onClick={() => handleInstructorClick(instructor.id)}
                >
                  {instructor.profile_image ? (
                    <img 
                      src={instructor.profile_image} 
                      alt={instructor.name}
                      className="instructor-simple-image"
                    />
                  ) : (
                    <div className="instructor-simple-placeholder">
                      {instructor.name?.charAt(0) || 'B'}
                    </div>
                  )}
                  <div className="instructor-simple-info">
                    <h3>{instructor.name}</h3>
                    {instructor.teaching_categories && (
                      <p>{instructor.teaching_categories}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🔥 Статистик - ДООД ТАЛД */}
      <div className="section-wrapper">
        <h2 className="section-title-simple">INFORMATION</h2>
        <DashboardStats 
          coursesCount={stats.totalCourses}
          instructorsCount={stats.totalInstructors}
          activeInstructors={stats.activeInstructors}
          averageRating={stats.averageRating}
        />
      </div>
    </div>
  );
}

export default Dashboard;