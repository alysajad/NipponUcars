import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function ImageViewer360({ folderPath, frameCount = 36, activeIndex, initialScale = 1, customFrames = null }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startFrame, setStartFrame] = useState(0);
  const containerRef = useRef();

  // Reset to front view when the active car index changes (from inventory slider)
  useEffect(() => {
    setFrameIndex(0);
  }, [activeIndex]);

  // Preload images to ensure smooth rotation
  useEffect(() => {
    // The DOM now handles preloading since all 36 img tags are rendered,
    // but we can leave this here if we want to explicitly preload into browser cache.
    if (!customFrames) {
      for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = `${folderPath}/frame_${i.toString().padStart(2, '0')}.jpg`;
      }
    }
  }, [folderPath, frameCount, customFrames]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX || e.touches?.[0]?.clientX || 0);
    setStartFrame(frameIndex);
    e.preventDefault(); // Prevent default drag behavior on the image
  };

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const deltaX = clientX - startX;
    
    // Sensitivity: how many pixels to drag to change one frame
    const sensitivity = 10;
    let framesToMove = Math.floor(deltaX / sensitivity);
    
    // Invert so dragging right rotates car left (feels more natural like spinning an object)
    let newFrame = (startFrame - framesToMove) % frameCount;
    if (newFrame < 0) newFrame += frameCount;
    
    setFrameIndex(newFrame);
  }, [isDragging, startX, startFrame, frameCount]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global mouse up to catch drops outside the container
  useEffect(() => {
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    
    return () => {
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, [handlePointerUp, handlePointerMove]);

  // Removed single imageSrc calculation as we'll map over all frames

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none' // Prevent scrolling while spinning on mobile
      }}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
    >
      {Array.from({ length: frameCount }).map((_, i) => {
        const src = customFrames ? customFrames[i] : `${folderPath}/frame_${i.toString().padStart(2, '0')}.jpg`;
        return (
          <img 
            key={i}
            src={src} 
            alt={`360 view frame ${i}`} 
            style={{
            position: i === frameIndex ? 'relative' : 'absolute',
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transform: `scale(${initialScale})`,
            transition: 'transform 0.3s ease',
            pointerEvents: 'none', // Let container handle events
            userSelect: 'none',
            opacity: frameIndex === i ? 1 : 0,
            visibility: frameIndex === i ? 'visible' : 'hidden'
          }}
          draggable="false"
        />
        );
      })}
      
      {/* Visual hint for interaction */}
      <div style={{
        position: 'absolute',
        bottom: '25%',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(4px)',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        color: 'var(--dark-grey)',
        pointerEvents: 'none',
        opacity: isDragging ? 0 : 0.8,
        transition: 'opacity 0.3s'
      }}>
        <span style={{ marginRight: '8px' }}>⟵</span> 
        DRAG TO ROTATE 
        <span style={{ marginLeft: '8px' }}>⟶</span>
      </div>
    </div>
  );
}
