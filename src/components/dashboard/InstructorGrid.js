import React from 'react';
import { BookOpen, Users } from 'lucide-react';

function InstructorGrid({ instructors, onInstructorClick }) {
  if (instructors.length === 0) {
    return (
      <div className="no-results">
        <Users size={64} />
        <h3>Багш олдсонгүй</h3>
        <p>Багш нар одоогоор байхгүй байна</p>
      </div>
    );
  }

  return (
    <div className="instructors-grid">
      {instructors.map(instructor => (
        <div 
          key={instructor.id} 
          className="instructor-card"
          onClick={() => onInstructorClick(instructor.id)}
        >
          <div className="instructor-banner">
            {instructor.profile_banner ? (
              <img src={instructor.profile_banner} alt="" />
            ) : (
              <div className="banner-gradient"></div>
            )}
          </div>
          
          <div className="instructor-content">
            <div className="instructor-avatar-large">
              {instructor.profile_image ? (
                <img src={instructor.profile_image} alt={instructor.name} />
              ) : (
                <div className="avatar-placeholder">
                  {instructor.name?.charAt(0) || 'B'}
                </div>
              )}
            </div>
            
            <h3 className="instructor-name">{instructor.name}</h3>
            
            {instructor.teaching_categories && (
              <p className="instructor-category">
                {instructor.teaching_categories}
              </p>
            )}
            
            {instructor.bio && instructor.bio !== 'Танилцуулга нэмэгдээгүй байна' && (
              <p className="instructor-bio">
                {instructor.bio.substring(0, 100)}...
              </p>
            )}
            
            <div className="instructor-stats">
              <div className="stat-item">
                <BookOpen size={18} />
                <span>{instructor.total_courses || 0} хичээл</span>
              </div>
              <div className="stat-item">
                <Users size={18} />
                <span>{instructor.total_students || 0} суралцагч</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default InstructorGrid;