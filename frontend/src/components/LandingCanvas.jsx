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

function CarModel({ path, scrollProxy, isActive, initialScale = 1.5, initialY = -1 }) {
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
          { x: initialScale, y: initialScale, z: initialScale, duration: 1.0, ease: "power2.out", overwrite: "auto" }
        );
        // Gentle slide in
        gsap.fromTo(innerGroup.current.position,
          { z: -3 },
          { z: 0, duration: 1.0, ease: "power2.out", overwrite: "auto" }
        );
      } else {
        gsap.to(innerGroup.current.scale, {
          x: initialScale * 0.9, y: initialScale * 0.9, z: initialScale * 0.9,
          duration: 0.6, ease: "power2.in", overwrite: "auto"
        });
        gsap.to(innerGroup.current.position, {
          z: 3,
          duration: 0.6,
          ease: "power2.in",
          overwrite: "auto",
          onComplete: () => {
            if (innerGroup.current) innerGroup.current.visible = false;
          }
        });
      }
    }
  }, [isActive, initialScale]);

  return (
    <group ref={outerGroup} position={[0, initialY, 0]}>
      <group ref={innerGroup} visible={false}>
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

export default function LandingCanvas() {
  const scrollProxy = useRef({
    rotationY: -Math.PI / 4,
    positionX: 0,
    positionZ: 0
  }).current;

  const [activeModel, setActiveModel] = useState(0);

  useEffect(() => {
    const verticalSections = ['sec-0', 'sec-1', 'sec-2', 'sec-3'];
    verticalSections.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) {
        ScrollTrigger.create({
          trigger: el,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveModel(i),
          onEnterBack: () => setActiveModel(i),
        });
      }
    });

    const sec3 = document.getElementById('sec-3');
    const scrollEnd = sec3 ? sec3.offsetTop + sec3.offsetHeight : 3000;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".content-layer",
        start: "top top",
        end: () => scrollEnd,
        scrub: 1.5, // smoother scrub
      }
    });

    tl.to(scrollProxy, { rotationY: Math.PI / 2, positionX: -3, positionZ: 1, ease: "power1.inOut" }, 0);
    tl.to(scrollProxy, { rotationY: Math.PI, positionX: 3, positionZ: -2, ease: "power1.inOut" }, 1);
    tl.to(scrollProxy, { rotationY: -Math.PI / 6, positionX: 0, positionZ: 3, ease: "power1.inOut" }, 2);
    
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [scrollProxy]);

  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 45 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <PerformanceManager />
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.8} castShadow />
        <Environment preset="city" />
        <Suspense fallback={null}>
          <ErrorBoundary><CarModel path="https://res.cloudinary.com/vdofesxh/raw/upload/v1783927072/3d_models/hilux-ultra.glb" scrollProxy={scrollProxy} isActive={activeModel === 0} initialScale={1.5} /></ErrorBoundary>
          <ErrorBoundary><CarModel path="https://res.cloudinary.com/vdofesxh/raw/upload/v1783926380/3d_models/toyota_fortuner_2021-optimized.glb" scrollProxy={scrollProxy} isActive={activeModel === 1} initialScale={1.5} /></ErrorBoundary>
          <ErrorBoundary><CarModel path="https://res.cloudinary.com/vdofesxh/raw/upload/v1783926381/3d_models/toyota-corolla-e170-2017-compressed.glb" scrollProxy={scrollProxy} isActive={activeModel === 2} initialScale={1.2} /></ErrorBoundary>
          <ErrorBoundary><CarModel path="https://res.cloudinary.com/vdofesxh/raw/upload/v1783926387/3d_models/2021_tata_safari-compressed.glb" scrollProxy={scrollProxy} isActive={activeModel === 3} initialScale={1.2} /></ErrorBoundary>
          <ContactShadows position={[0, -1.01, 0]} opacity={0.35} scale={20} blur={2.5} far={4} />
        </Suspense>
      </Canvas>
    </div>
  );
}
