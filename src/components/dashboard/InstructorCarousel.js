import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Users } from 'lucide-react';

function InstructorCarousel({ title, instructors, onInstructorClick }) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef(null);
  const [maxScroll, setMaxScroll] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollPosition, setStartScrollPosition] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      const track = carouselRef.current;
      const maxScrollWidth = track.scrollWidth - track.clientWidth;
      setMaxScroll(maxScrollWidth);
    }
  }, [instructors]);

  const scroll = (direction) => {
    const scrollAmount = 320 + 28; // card width + gap
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(maxScroll, scrollPosition + scrollAmount);
    
    setScrollPosition(newPosition);
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX);
    setStartScrollPosition(scrollPosition);
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (startX - x) * 1.5;
    const newPosition = Math.max(0, Math.min(maxScroll, startScrollPosition + walk));
    setScrollPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab';
    }
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    setStartScrollPosition(scrollPosition);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX;
    const walk = (startX - x) * 1.2;
    const newPosition = Math.max(0, Math.min(maxScroll, startScrollPosition + walk));
    setScrollPosition(newPosition);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (instructors.length === 0) {
    return null;
  }

  return (
    <div className="instructors-carousel-section">
      <div className="carousel-header">
        <h2 className="carousel-title">{title}</h2>
        <div className="carousel-controls">
          <button 
            className="carousel-btn"
            onClick={() => scroll('left')}
            disabled={scrollPosition === 0}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            className="carousel-btn"
            onClick={() => scroll('right')}
            disabled={scrollPosition >= maxScroll}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div 
        className="instructors-carousel"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div 
          ref={carouselRef}
          className="carousel-track"
          style={{ 
            transform: `translateX(-${scrollPosition}px)`,
            transition: isDragging ? 'none' : 'transform 0.5s ease'
          }}
        >
          {instructors.map((instructor) => (
            <div 
              key={instructor.id} 
              className="carousel-item"
              onClick={(e) => {
                if (isDragging) {
                  e.preventDefault();
                  return;
                }
                onInstructorClick(instructor.id);
              }}
              style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
            >
              <div className="instructor-card">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InstructorCarousel;