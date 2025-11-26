import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, PresentationControls, useGLTF } from '@react-three/drei';
import { TextureLoader, DoubleSide } from 'three';
import { Suspense } from 'react';

// Component 1: Asli 3D Model
function RealModel() {
  const { scene } = useGLTF("/models/plant.glb");
  return <primitive object={scene} scale={1} />;
}

// Component 2: Image Card
function ImageCard({ imageUrl }) {
  const texture = useLoader(TextureLoader, imageUrl);
  return (
    <mesh rotation={[0, 0, 0]}>
      <planeGeometry args={[3, 3]} /> 
      <meshStandardMaterial map={texture} side={DoubleSide} transparent={true} />
    </mesh>
  );
}

export default function Plant3D({ image }) {
  const showImageCard = image ? true : false;

  return (
    <div className="w-full h-full bg-gradient-to-b from-green-50 to-green-100 rounded-2xl overflow-hidden relative">
      <Canvas dpr={[1, 2]} shadows camera={{ fov: 45, position: [0, 0, 5] }} style={{ position: "absolute" }}>
        <color attach="background" args={['#f0fdf4']} />
        
        {/* 'snap' prop hataya aur config change kiya taaki smooth rahe */}
        <PresentationControls speed={1.5} global zoom={0.7} polar={[-0.1, Math.PI / 4]}>
          <Stage environment="city" intensity={0.6} contactShadow={false}>
            <Suspense fallback={null}>
              
              {showImageCard ? (
                <ImageCard imageUrl={image} />
              ) : (
                <RealModel />
              )}

            </Suspense>
          </Stage>
        </PresentationControls>
        
        {/* ✅ CHANGE: autoRotate hata diya. Ab ye khud nahi ghumega. */}
        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>
      
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
        <p className="text-green-800 font-bold bg-white/80 inline-block px-4 py-1 rounded-full text-sm shadow-sm">
          {showImageCard ? "Drag to Rotate 🖼️" : "Drag to Rotate 🪴"}
        </p>
      </div>
    </div>
  );
}