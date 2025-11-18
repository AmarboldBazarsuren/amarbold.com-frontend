// src/pages/CoursesPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseGrid from '../components/dashboard/CourseGrid';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import api from '../config/api';

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
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

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
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
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Бүх хичээлүүд</h1>
          <p className="dashboard-subtitle">
            {filteredCourses.length} хичээл олдлоо
          </p>
        </div>
      </div>

      <DashboardFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        showCategoryFilter={true}
      />

      <CourseGrid 
        courses={filteredCourses}
        onCourseClick={handleCourseClick}
      />
    </div>
  );
}

export default CoursesPage;