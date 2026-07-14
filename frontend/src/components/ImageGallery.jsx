import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageGallery({ frames = [], initialScale = 1 }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset to first image if frames array changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [frames]);

  if (!frames || frames.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
        No Images Available
      </div>
    );
  }

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % frames.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + frames.length) % frames.length);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Render all images to pre-fetch them, hiding inactive ones */}
      {frames.map((src, idx) => (
        <img 
          key={idx}
          src={src} 
          alt={`View ${idx + 1}`} 
          style={{
            position: idx === currentIndex ? 'relative' : 'absolute',
            opacity: idx === currentIndex ? 1 : 0,
            visibility: idx === currentIndex ? 'visible' : 'hidden',
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transform: `scale(${initialScale})`,
            transition: 'opacity 0.3s ease',
          }}
          draggable="false"
          referrerPolicy="no-referrer"
        />
      ))}
      
      {/* Navigation Arrows (only show if more than 1 image) */}
      {frames.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: '15%',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.7)',
              border: 'none',
              borderRadius: '50%',
              padding: '10px',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Previous image"
          >
            <ChevronLeft size={24} color="#333" />
          </button>
          
          <button 
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '15%',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.7)',
              border: 'none',
              borderRadius: '50%',
              padding: '10px',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Next image"
          >
            <ChevronRight size={24} color="#333" />
          </button>
          
          {/* Picture Dots */}
          <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            background: 'rgba(255,255,255,0.5)',
            padding: '6px 12px',
            borderRadius: '20px',
            backdropFilter: 'blur(4px)'
          }}>
            {frames.map((_, idx) => (
              <div 
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: idx === currentIndex ? 'var(--primary-red)' : 'rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
