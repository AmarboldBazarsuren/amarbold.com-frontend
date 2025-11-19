import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function InstructorCarousel({ title, instructors, onInstructorClick }) {
  const [maxScroll, setMaxScroll] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const carouselRef = useRef(null);
  const trackRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationRef = useRef(null);
  const scrollPosRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (trackRef.current && carouselRef.current) {
      const maxScrollWidth = trackRef.current.scrollWidth - carouselRef.current.clientWidth;
      setMaxScroll(maxScrollWidth);
      setCanScrollRight(maxScrollWidth > 0);
    }
  }, [instructors]);

  const updateButtons = useCallback(() => {
    setCanScrollLeft(scrollPosRef.current > 10);
    setCanScrollRight(scrollPosRef.current < maxScroll - 10);
  }, [maxScroll]);

  // 🔥 ULTRA SMOOTH MOMENTUM
  const animateMomentum = useCallback(() => {
    if (Math.abs(velocityRef.current) > 0.1) {
      velocityRef.current *= 0.94;
      scrollPosRef.current += velocityRef.current;

      if (scrollPosRef.current < 0) {
        scrollPosRef.current *= 0.7;
        velocityRef.current *= 0.5;
        if (Math.abs(scrollPosRef.current) < 1) {
          scrollPosRef.current = 0;
          velocityRef.current = 0;
        }
      } else if (scrollPosRef.current > maxScroll) {
        const overshoot = scrollPosRef.current - maxScroll;
        scrollPosRef.current = maxScroll + overshoot * 0.7;
        velocityRef.current *= 0.5;
        if (overshoot < 1) {
          scrollPosRef.current = maxScroll;
          velocityRef.current = 0;
        }
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(-${scrollPosRef.current}px, 0, 0)`;
      }

      updateButtons();
      rafRef.current = requestAnimationFrame(animateMomentum);
    } else {
      velocityRef.current = 0;
      updateButtons();
    }
  }, [maxScroll, updateButtons]);

  const scroll = (direction) => {
    const scrollAmount = 200;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosRef.current - scrollAmount)
      : Math.min(maxScroll, scrollPosRef.current + scrollAmount);
    
    scrollPosRef.current = newPosition;
    velocityRef.current = 0;
    
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      trackRef.current.style.transform = `translate3d(-${newPosition}px, 0, 0)`;
      
      setTimeout(() => {
        if (trackRef.current) {
          trackRef.current.style.transition = 'none';
        }
        updateButtons();
      }, 800);
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  };

  const handleDragStart = useCallback((pageX) => {
    isDraggingRef.current = true;
    startXRef.current = pageX;
    currentXRef.current = pageX;
    lastXRef.current = pageX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
    }

    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grabbing';
      carouselRef.current.style.userSelect = 'none';
    }
  }, []);

  const handleDragMove = useCallback((pageX) => {
    if (!isDraggingRef.current) return;

    currentXRef.current = pageX;
    const currentTime = performance.now();
    const timeDiff = currentTime - lastTimeRef.current;

    if (timeDiff > 0) {
      const distance = lastXRef.current - pageX;
      velocityRef.current = (distance / timeDiff) * 16;
    }

    lastXRef.current = pageX;
    lastTimeRef.current = currentTime;

    const totalDistance = startXRef.current - pageX;
    let newPos = scrollPosRef.current + totalDistance;
    
    if (newPos < 0) {
      newPos = newPos * 0.3;
    } else if (newPos > maxScroll) {
      const overshoot = newPos - maxScroll;
      newPos = maxScroll + overshoot * 0.3;
    }
    
    startXRef.current = pageX;
    scrollPosRef.current = newPos;

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(-${newPos}px, 0, 0)`;
    }
  }, [maxScroll]);

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;

    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab';
      carouselRef.current.style.userSelect = '';
    }

    if (scrollPosRef.current < 0) {
      velocityRef.current = Math.abs(velocityRef.current);
    } else if (scrollPosRef.current > maxScroll) {
      velocityRef.current = -Math.abs(velocityRef.current);
    }

    if (Math.abs(velocityRef.current) > 0.1) {
      rafRef.current = requestAnimationFrame(animateMomentum);
    } else {
      updateButtons();
    }
  }, [animateMomentum, maxScroll, updateButtons]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    handleDragStart(e.pageX);
  }, [handleDragStart]);

  const handleMouseMove = useCallback((e) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      handleDragMove(e.pageX);
    }
  }, [handleDragMove]);

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      handleDragEnd();
    }
  }, [handleDragEnd]);

  const handleMouseLeave = useCallback(() => {
    if (isDraggingRef.current) {
      handleDragEnd();
    }
  }, [handleDragEnd]);

  const handleTouchStart = useCallback((e) => {
    handleDragStart(e.touches[0].pageX);
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e) => {
    if (isDraggingRef.current) {
      e.preventDefault();
      handleDragMove(e.touches[0].pageX);
    }
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    if (isDraggingRef.current) {
      handleDragEnd();
    }
  }, [handleDragEnd]);

  const handleCardClick = useCallback((instructorId, e) => {
    const dragDistance = Math.abs(startXRef.current - currentXRef.current);
    if (dragDistance > 5) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onInstructorClick(instructorId);
  }, [onInstructorClick]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

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
            disabled={!canScrollLeft}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            className="carousel-btn"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div 
        ref={carouselRef}
        className="instructors-carousel-simple"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          cursor: 'grab',
          touchAction: 'pan-y',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <div 
          ref={trackRef}
          className="carousel-track-simple"
          style={{ 
            transform: 'translate3d(0px, 0, 0)',
            transition: 'none',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            perspective: 1000
          }}
        >
          {instructors.map((instructor) => (
            <div 
              key={instructor.id} 
              className="carousel-item-simple"
              onClick={(e) => handleCardClick(instructor.id, e)}
              style={{ 
                cursor: 'pointer',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none'
              }}
            >
              <div className="instructor-simple-card">
                {instructor.profile_image ? (
                  <img 
                    src={instructor.profile_image} 
                    alt={instructor.name}
                    className="instructor-simple-image"
                    draggable="false"
                    style={{ 
                      pointerEvents: 'none',
                      userSelect: 'none',
                      WebkitUserDrag: 'none'
                    }}
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