import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function InstructorCarousel({ title, instructors, onInstructorClick }) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef(null);
  const [maxScroll, setMaxScroll] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollPosition, setStartScrollPosition] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastX, setLastX] = useState(0);
  const [lastTime, setLastTime] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    if (carouselRef.current) {
      const track = carouselRef.current;
      const maxScrollWidth = track.scrollWidth - track.clientWidth;
      setMaxScroll(maxScrollWidth);
    }
  }, [instructors]);

  // 🔥 MOMENTUM SCROLL - Зуурсны дараа өөрөө гүйнэ
  useEffect(() => {
    if (!isDragging && Math.abs(velocity) > 0.5) {
      const animate = () => {
        setVelocity((v) => v * 0.95); // Аажмаар удааширна
        setScrollPosition((pos) => {
          const newPos = pos + velocity;
          return Math.max(0, Math.min(maxScroll, newPos));
        });

        if (Math.abs(velocity) > 0.5) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDragging, velocity, maxScroll]);

  const scroll = (direction) => {
    const scrollAmount = 164; // 140px + 24px gap
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(maxScroll, scrollPosition + scrollAmount);
    
    setScrollPosition(newPosition);
    setVelocity(0);
  };

  // 🔥 DRAG START
  const handleDragStart = (pageX) => {
    setIsDragging(true);
    setStartX(pageX);
    setLastX(pageX);
    setLastTime(Date.now());
    setStartScrollPosition(scrollPosition);
    setVelocity(0);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // 🔥 DRAG MOVE
  const handleDragMove = (pageX) => {
    if (!isDragging) return;
    
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTime;
    
    if (timeDiff > 0) {
      const currentVelocity = (lastX - pageX) / timeDiff * 16; // 60fps
      setVelocity(currentVelocity);
    }
    
    setLastX(pageX);
    setLastTime(currentTime);
    
    const walk = (startX - pageX) * 1.2;
    const newPosition = Math.max(0, Math.min(maxScroll, startScrollPosition + walk));
    setScrollPosition(newPosition);
  };

  // 🔥 DRAG END - Momentum эхэлнэ
  const handleDragEnd = () => {
    setIsDragging(false);
    // velocity state-д аль хэдийн байна, useEffect автоматаар momentum эхлүүлнэ
  };

  // Mouse handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleDragStart(e.pageX);
  };

  const handleMouseMove = (e) => {
    handleDragMove(e.pageX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleDragEnd();
    }
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    handleDragStart(e.touches[0].pageX);
  };

  const handleTouchMove = (e) => {
    handleDragMove(e.touches[0].pageX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Card click handler - Drag хийж байвал дарахгүй
  const handleCardClick = (instructorId, e) => {
    const dragDistance = Math.abs(startX - lastX);
    if (dragDistance > 10) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onInstructorClick(instructorId);
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
            transition: 'none'
          }}
        >
          {instructors.map((instructor) => (
            <div 
              key={instructor.id} 
              className="carousel-item-simple"
              onClick={(e) => handleCardClick(instructor.id, e)}
              style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
            >
              <div className="instructor-simple-card">
                {instructor.profile_image ? (
                  <img 
                    src={instructor.profile_image} 
                    alt={instructor.name}
                    className="instructor-simple-image"
                    draggable="false"
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