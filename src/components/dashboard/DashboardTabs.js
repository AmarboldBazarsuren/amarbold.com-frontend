import React from 'react';
import { BookOpen, Users } from 'lucide-react';

function DashboardTabs({ activeTab, onTabChange }) {
  return (
    <div className="dashboard-tabs">
      <button 
        className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
        onClick={() => onTabChange('courses')}
      >
        <BookOpen size={20} />
        Хичээлүүд
      </button>
      <button 
        className={`tab-btn ${activeTab === 'instructors' ? 'active' : ''}`}
        onClick={() => onTabChange('instructors')}
      >
        <Users size={20} />
        Багш нар
      </button>
    </div>
  );
}

export default DashboardTabs;