// src/pages/Dashboard.js - ЗАСВАРЛАСАН

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import api from '../config/api';

// Components
import DashboardStats from '../components/dashboard/DashboardStats';
import CourseCarousel from '../components/dashboard/CourseCarousel'; // ✅ Carousel ашиглана
import InstructorCarousel from '../components/dashboard/InstructorCarousel';

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
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Хичээлүүд</h1>
          <p className="dashboard-subtitle">
            {courses.length} хичээл олдлоо
          </p>
        </div>
      </div>

      {/* 🔥 ХИЧЭЭЛҮҮД - CAROUSEL */}
      {courses.length > 0 && (
        <div className="section-wrapper">
          <CourseCarousel
            title="Бүх хичээлүүд"
            courses={courses}
            onCourseClick={handleCourseClick}
          />
        </div>
      )}

      {/* 🔥 БАГШ НАР - CAROUSEL */}
      {recentInstructors.length > 0 && (
        <div className="section-wrapper">
          <InstructorCarousel
            title="Багш нар"
            instructors={recentInstructors}
            onInstructorClick={handleInstructorClick}
          />
        </div>
      )}

      {/* 🔥 Статистик - ДООД ТАЛД */}
      <div className="section-wrapper">
        <h2 className="section-title-simple">МЭДЭЭЛЭЛ</h2>
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