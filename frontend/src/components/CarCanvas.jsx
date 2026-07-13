import React, { useRef, useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Environment, ContactShadows, useGLTF } from '@react-three/drei';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MODELS = [
  "https://res.cloudinary.com/vdofesxh/raw/upload/v1783927072/3d_models/hilux-ultra.glb",
  "https://res.cloudinary.com/vdofesxh/raw/upload/v1783926380/3d_models/toyota_fortuner_2021-optimized.glb",
  "https://res.cloudinary.com/vdofesxh/raw/upload/v1783926381/3d_models/toyota-corolla-e170-2017-compressed.glb",
  "https://res.cloudinary.com/vdofesxh/raw/upload/v1783926387/3d_models/2021_tata_safari-compressed.glb",
  "https://res.cloudinary.com/vdofesxh/raw/upload/v1783926390/3d_models/2024_toyota_land_cruiser_lc300_vxr_409_tt-compressed.glb",
  "https://res.cloudinary.com/vdofesxh/raw/upload/v1783926394/3d_models/toyota_gr_supra-compressed.glb"
];

function useDracoGLTF(path) {
  return useGLTF(path, true, true);
}

function CarModel({ path, scrollProxy, isActive, initialScale = 1.5, initialY = -1 }) {
  const gltf = useDracoGLTF(path);
  const clonedScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const group = useRef();

  useFrame(() => {
    if (group.current && isActive) {
      group.current.rotation.y = scrollProxy.rotationY;
      group.current.position.x = scrollProxy.positionX;
      group.current.position.z = scrollProxy.positionZ;
    }
  });

  return (
    <group ref={group} position={[0, initialY, 0]} visible={isActive}>
      <primitive object={clonedScene} scale={initialScale} />
    </group>
  );
}

function PerformanceManager() {
  const { gl } = useThree();
  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  }, [gl]);
  return null;
}

export default function CarCanvas() {
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
          onEnter: () => setActiveModel(i % MODELS.length),
          onEnterBack: () => setActiveModel(i % MODELS.length),
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
        scrub: 1.5,
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
          {MODELS.map((path, idx) => (
            <CarModel key={idx} path={path} scrollProxy={scrollProxy} isActive={activeModel === idx} initialScale={idx < 2 ? 1.5 : 1.2} />
          ))}
          <ContactShadows position={[0, -1.01, 0]} opacity={0.35} scale={20} blur={2.5} far={4} />
        </Suspense>
      </Canvas>
    </div>
  );
}
