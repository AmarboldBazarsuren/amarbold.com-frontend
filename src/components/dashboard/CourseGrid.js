import React from 'react';
import { Clock, Star, BookOpen } from 'lucide-react';

function CourseGrid({ courses, onCourseClick }) {
  if (courses.length === 0) {
    return (
      <div className="no-results">
        <BookOpen size={64} />
        <h3>Хичээл олдсонгүй</h3>
        <p>Өөр түлхүүр үгээр хайж үзээрэй</p>
      </div>
    );
  }

  return (
    <div className="courses-grid">
      {courses.map(course => (
        <div 
          key={course.id} 
          className="course-card"
          onClick={() => onCourseClick(course.id)}
        >
          <div className="course-image">
            <img 
              src={course.thumbnail || '/placeholder-course.jpg'} 
              alt={course.title} 
            />
            <div className="course-badge">{course.category}</div>
            {/* ✅ Хямдралын badge */}
            {course.discount_percent && (
              <div className="discount-badge-card">-{course.discount_percent}%</div>
            )}
          </div>
          
          <div className="course-content">
            <h3 className="course-title">{course.title}</h3>
            <p className="course-description">{course.description}</p>
            
            <div className="course-meta">
              <div className="course-instructor">
                <div className="instructor-avatar">
                  {course.instructor?.name?.charAt(0) || 'B'}
                </div>
                <span>{course.instructor?.name || 'Багш'}</span>
              </div>
              
              <div className="course-stats">
                <div className="stat">
                  <Clock size={16} />
                  <span>{course.duration || '10'} цаг</span>
                </div>
                <div className="stat">
                  <Star size={16} />
                  <span>{course.rating || '4.5'}</span>
                </div>
              </div>
            </div>
            
            <div className="course-footer">
              <div className="course-price">
                {course.price === 0 ? (
                  <span className="free-badge">Үнэгүй</span>
                ) : (
                  <>
                    {/* ✅ Хямдралтай үнэ харуулах */}
                    {course.discount_price ? (
                      <div className="price-with-discount">
                        <span className="original-price">₮{course.price?.toLocaleString()}</span>
                        <span className="discount-price">₮{course.discount_price?.toLocaleString()}</span>
                      </div>
                    ) : (
                      <span className="price">₮{course.price?.toLocaleString()}</span>
                    )}
                  </>
                )}
              </div>
              <button className="btn-enroll">
                Үзэх
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CourseGrid;