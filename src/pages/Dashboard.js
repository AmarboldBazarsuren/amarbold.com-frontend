// src/pages/Dashboard.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Dashboard.css';
import api from '../config/api';

// Components
import DashboardStats from '../components/dashboard/DashboardStats';
import DashboardTabs from '../components/dashboard/DashboardTabs';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import CourseCarousel from '../components/dashboard/CourseCarousel'; // ✅ Шинэ
import CourseGrid from '../components/dashboard/CourseGrid';
import InstructorGrid from '../components/dashboard/InstructorGrid';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('courses');
  const [categoryView, setCategoryView] = useState('recent'); // ✅ Шинэ: 'recent' эсвэл 'all'
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

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // ✅ Сүүлд нэмэгдсэн хичээлүүд (8 хичээл)
  const recentCourses = [...courses]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (instructor.teaching_categories && 
                          instructor.teaching_categories.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

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
          <h1 className="dashboard-title">
            {activeTab === 'courses' ? 'Бүх хичээлүүд' : 'Багш нар'}
          </h1>
          <p className="dashboard-subtitle">
            {activeTab === 'courses' 
              ? 'Өөртөө тохирсон хичээлээ сонгоод суралцаж эхлээрэй'
              : 'Мэргэжлийн багш нараас сонгоорой'
            }
          </p>
        </div>
        
        <DashboardStats 
          coursesCount={stats.totalCourses}
          instructorsCount={stats.totalInstructors}
          activeInstructors={stats.activeInstructors}
          averageRating={stats.averageRating}
        />
      </div>

      {/* Tabs */}
      <DashboardTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Filters */}
      <DashboardFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        showCategoryFilter={activeTab === 'courses'}
      />

      {/* ✅ Category Tabs (Хичээл харуулах горимууд) */}
      {activeTab === 'courses' && (
        <div className="courses-category-tabs">
          <button
            className={`category-tab-btn ${categoryView === 'recent' ? 'active' : ''}`}
            onClick={() => setCategoryView('recent')}
          >
            Сүүлд нэмэгдсэн
          </button>
          <button
            className={`category-tab-btn ${categoryView === 'all' ? 'active' : ''}`}
            onClick={() => setCategoryView('all')}
          >
            Нийт хичээлүүд
          </button>
        </div>
      )}

      {/* Content */}
      {activeTab === 'courses' ? (
        <>
          {/* ✅ Сүүлд нэмэгдсэн - Carousel */}
          {categoryView === 'recent' && (
            <CourseCarousel
              title="Сүүлд нэмэгдсэн хичээлүүд"
              courses={recentCourses}
              onCourseClick={handleCourseClick}
            />
          )}

          {/* ✅ Нийт хичээлүүд - Grid */}
          {categoryView === 'all' && (
            <CourseGrid 
              courses={filteredCourses}
              onCourseClick={handleCourseClick}
            />
          )}
        </>
      ) : (
        <InstructorGrid
          instructors={filteredInstructors}
          onInstructorClick={handleInstructorClick}
        />
      )}
    </div>
  );
}

export default Dashboard;
