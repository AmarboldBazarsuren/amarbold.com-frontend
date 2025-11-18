import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    const scrollAmount = 130; // 110px + 20px gap
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
        className="instructors-carousel-simple"
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
          className="carousel-track-simple"
          style={{ 
            transform: `translateX(-${scrollPosition}px)`,
            transition: isDragging ? 'none' : 'transform 0.5s ease'
          }}
        >
          {instructors.map((instructor) => (
            <div 
              key={instructor.id} 
              className="carousel-item-simple"
              onClick={(e) => {
                if (isDragging) {
                  e.preventDefault();
                  return;
                }
                onInstructorClick(instructor.id);
              }}
              style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
            >
              <div className="instructor-simple-card">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InstructorCarousel;