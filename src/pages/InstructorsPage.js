// src/pages/InstructorsPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import api from '../config/api';

function InstructorsPage() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await api.get('/api/instructors');
      if (response.data.success && Array.isArray(response.data.data)) {
        setInstructors(response.data.data);
      }
    } catch (error) {
      console.error('Багш нар татахад алдаа:', error);
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (instructor.teaching_categories && 
                          instructor.teaching_categories.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleInstructorClick = (instructorId) => {
    navigate(`/instructor/${instructorId}`);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Багш нарыг уншиж байна...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Багш нар</h1>
          <p className="dashboard-subtitle">
            {filteredInstructors.length} багш олдлоо
          </p>
        </div>
      </div>

      <DashboardFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterCategory=""
        onCategoryChange={() => {}}
        showCategoryFilter={false}
      />

      {/* 🔥 БАГШ НАРЫН GRID - CAROUSEL БИШ */}
      <div className="instructors-simple-section">
        <div className="instructors-simple-grid">
          {filteredInstructors.map((instructor) => (
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
  );
}

export default InstructorsPage;