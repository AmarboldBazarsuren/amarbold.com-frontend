import React from 'react';
import { Users, BookOpen, TrendingUp, DollarSign } from 'lucide-react';

function AdminStats({ stats, currentUser }) {
  return (
    <div className="stats-grid">
      {currentUser?.role === 'admin' && (
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Нийт хэрэглэгчид</div>
          </div>
        </div>
      )}
      
      <div className="stat-card">
        <div className="stat-icon">
          <BookOpen size={32} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.totalCourses}</div>
          <div className="stat-label">
            {currentUser?.role === 'test_admin' ? 'Миний хичээлүүд' : 'Нийт хичээлүүд'}
          </div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <TrendingUp size={32} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.totalEnrollments}</div>
          <div className="stat-label">Бүртгэлүүд</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <DollarSign size={32} />
        </div>
        <div className="stat-content">
          <div className="stat-value">₮{stats.totalRevenue.toLocaleString()}</div>
          <div className="stat-label">Нийт орлого</div>
        </div>
      </div>
    </div>
  );
}

export default AdminStats;