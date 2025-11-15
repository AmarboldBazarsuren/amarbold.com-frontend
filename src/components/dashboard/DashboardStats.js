import React from 'react';
import { BookOpen, TrendingUp, Star, Users } from 'lucide-react';

function DashboardStats({ coursesCount, instructorsCount, activeInstructors, averageRating }) {
  return (
    <div className="dashboard-stats">
      <div className="stat-card">
        <div className="stat-icon">
          <BookOpen size={28} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{coursesCount}</div>
          <div className="stat-label">Нийт хичээл</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <Users size={28} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{instructorsCount}</div>
          <div className="stat-label">Багш нар</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <TrendingUp size={28} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{activeInstructors}+</div>
          <div className="stat-label">Идэвхтэй багш</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <Star size={28} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{averageRating}</div>
          <div className="stat-label">Дундаж үнэлгээ</div>
        </div>
      </div>
    </div>
  );
}

export default DashboardStats;