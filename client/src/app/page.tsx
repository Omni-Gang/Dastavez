'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';
import ThemeToggleButton from '@/components/ThemeToggleButton';

function FloatingShapes() {
  const shapes = Array.from({ length: 15 }, () => ({
    position: [
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15,
    ],
    scale: Math.random() * 0.5 + 0.3,
    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
  }));

  return shapes.map((shape, i) => (
    <Float key={i} speed={2} rotationIntensity={2} floatIntensity={2}>
      <mesh position={shape.position} scale={shape.scale}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={shape.color} roughness={0.3} metalness={0.8} />
      </mesh>
    </Float>
  ));
}

export default function LandingPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-white text-black dark:bg-black dark:text-white transition-colors duration-500">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <Stars radius={100} depth={50} count={5000} factor={4} fade />
        <FloatingShapes />
        <OrbitControls enableZoom={false} />
      </Canvas>

      {/* Dark Mode Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggleButton />
      </div>

      {/* Main Motion Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-black dark:text-white">
          Collaborate in Real Time
        </h1>
        <p className="text-lg md:text-2xl max-w-2xl text-gray-700 dark:text-gray-300">
          Dastavez lets you edit documents with your team — anywhere, anytime.
        </p>
      </motion.div>
    </div>
  );
}
