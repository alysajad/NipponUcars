import React, { useRef, useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Environment, ContactShadows, useGLTF } from '@react-three/drei';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Replaced manual useLoader with Drei's useGLTF which handles caching and decoders automatically
function useDracoGLTF(path) {
  // useGLTF(path, useDraco, useMeshopt)
  return useGLTF(path, true, true);
}

// Preload models so they fetch instantly in the background, fixing slow render times
useGLTF.preload("https://res.cloudinary.com/vdofesxh/raw/upload/v1783927072/3d_models/hilux-ultra.glb");
useGLTF.preload("https://res.cloudinary.com/vdofesxh/raw/upload/v1783926380/3d_models/toyota_fortuner_2021-optimized.glb");
useGLTF.preload("https://res.cloudinary.com/vdofesxh/raw/upload/v1783926381/3d_models/toyota-corolla-e170-2017-compressed.glb");
useGLTF.preload("https://res.cloudinary.com/vdofesxh/raw/upload/v1783926387/3d_models/2021_tata_safari-compressed.glb");

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn('3D model failed to load:', error.message);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function CarModel({ path, scrollProxy, isActive, initialScale = 1.5, initialY = -1, initialRotation = [0, 0, 0] }) {
  const gltf = useDracoGLTF(path);
  // Clone scene to avoid shared-scene conflicts between Landing & Inventory
  const clonedScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const outerGroup = useRef();
  const innerGroup = useRef();

  useFrame(() => {
    if (outerGroup.current && isActive) {
      outerGroup.current.rotation.y = scrollProxy.rotationY;
      outerGroup.current.position.x = scrollProxy.positionX;
      outerGroup.current.position.z = scrollProxy.positionZ;
    }
  });

  useEffect(() => {
    if (innerGroup.current) {
      if (isActive) {
        innerGroup.current.visible = true;
        // Subtle 10% scale shift
        gsap.fromTo(innerGroup.current.scale,
          { x: initialScale * 0.9, y: initialScale * 0.9, z: initialScale * 0.9 },
          { x: initialScale, y: initialScale, z: initialScale, duration: 1.2, ease: "power2.out", overwrite: "auto" }
        );
        // Gentle slide in
        gsap.fromTo(innerGroup.current.position,
          { z: -3 },
          { z: 0, duration: 1.2, ease: "power2.out", overwrite: "auto" }
        );
      } else {
        // Instantly hide inactive models to prevent them from overlapping with the active one during fast scrolls
        innerGroup.current.visible = false;
      }
    }
  }, [isActive, initialScale]);

  return (
    <group ref={outerGroup} position={[0, initialY, 0]}>
      <group ref={innerGroup} visible={false} rotation={initialRotation}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}

// Adaptive performance - lower DPR on weaker devices
function PerformanceManager() {
  const { gl } = useThree();
  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  }, [gl]);
  return null;
}

export default function LandingCanvas({ activeModelIndex = 0 }) {
  const [isMobile, setIsMobile] = useState(false);

  // Set up mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollProxy = useRef({
    rotationY: -Math.PI / 4,
    positionX: 0, 
    positionZ: 0
  }).current;

  // Update initial positionX when isMobile changes
  useEffect(() => {
    scrollProxy.positionX = isMobile ? 0 : 2.2;
  }, [isMobile, scrollProxy]);

  const containerRef = useRef();

  useEffect(() => {
    const sec4 = document.getElementById('sec-4');
    const scrollEnd = sec4 ? sec4.offsetTop + sec4.offsetHeight : 4000;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".content-layer",
        start: "top top",
        end: () => scrollEnd,
        scrub: 3, // Much smoother/slower scrub
      }
    });

    // Dynamic swings based on mobile (less horizontal movement on narrow screens)
    // Increased X offsets (2.2) to prevent models from overlapping with text blocks
    const m = isMobile ? 0 : 1; 
    
    tl.to(scrollProxy, { rotationY: Math.PI / 3,  positionX: -2.2 * m, positionZ: 0.5,  ease: "none" }, 0); // Sec 1 (Text right)
    tl.to(scrollProxy, { rotationY: Math.PI * 0.7, positionX: 2.2 * m,  positionZ: -0.5, ease: "none" }, 1); // Sec 2 (Text left)
    tl.to(scrollProxy, { rotationY: -Math.PI / 6,  positionX: -2.2 * m,   positionZ: 1,    ease: "none" }, 2); // Sec 3 (Text right)
    
    // Fade out the entire canvas when transitioning to sec-4
    if (containerRef.current) {
      tl.to(containerRef.current, { opacity: 0, ease: "power2.out" }, 2.5);
    }
    
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [scrollProxy, isMobile]);

  return (
    <div className="canvas-container" ref={containerRef} style={{ transition: 'opacity 0.3s' }}>
      <Canvas
        camera={{ position: [0, 2, 8], fov: isMobile ? 65 : 45 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <PerformanceManager />
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.8} castShadow />
        <Environment preset="city" />
        <Suspense fallback={null}>
          <ErrorBoundary><CarModel path="https://res.cloudinary.com/vdofesxh/raw/upload/v1783927072/3d_models/hilux-ultra.glb" scrollProxy={scrollProxy} isActive={activeModelIndex === 0} initialScale={1.5} initialY={isMobile ? -1.5 : -1} /></ErrorBoundary>
          <ErrorBoundary><CarModel path="https://res.cloudinary.com/vdofesxh/raw/upload/v1783926380/3d_models/toyota_fortuner_2021-optimized.glb" scrollProxy={scrollProxy} isActive={activeModelIndex === 1} initialScale={1.8} initialY={isMobile ? -1.5 : -1} /></ErrorBoundary>
          <ErrorBoundary><CarModel path="https://res.cloudinary.com/vdofesxh/raw/upload/v1783926381/3d_models/toyota-corolla-e170-2017-compressed.glb" scrollProxy={scrollProxy} isActive={activeModelIndex === 2} initialScale={1.3} initialY={isMobile ? -1.5 : -1} /></ErrorBoundary>
          <ErrorBoundary><CarModel path="https://res.cloudinary.com/vdofesxh/raw/upload/v1783926387/3d_models/2021_tata_safari-compressed.glb" scrollProxy={scrollProxy} isActive={activeModelIndex === 3} initialScale={1.3} initialY={isMobile ? -1.5 : -1} initialRotation={[0, Math.PI, 0]} /></ErrorBoundary>
          <ContactShadows position={[0, isMobile ? -1.51 : -1.01, 0]} opacity={0.35} scale={20} blur={2.5} far={4} />
        </Suspense>
      </Canvas>
    </div>
  );
}
