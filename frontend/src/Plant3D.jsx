import { Canvas, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  Stage,
  PresentationControls,
  useGLTF,
} from "@react-three/drei";
import { TextureLoader } from "three";
import { Suspense } from "react";

function RealModel() {
  const { scene } = useGLTF("/models/plant.glb");
  return <primitive object={scene} scale={1} />;
}

function ImageCard({ imageUrl }) {
  const texture = useLoader(TextureLoader, imageUrl);

  return (
    <group>
      <mesh>
        <boxGeometry args={[3, 3, 0.22]} />
        <meshStandardMaterial map={texture} roughness={0.35} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0, -0.12]}>
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial roughness={0.9} metalness={0} />
      </mesh>
    </group>
  );
}

export default function Plant3D({ image }) {
  const showImageCard = !!image;

  return (
    <div className="w-full h-full bg-gradient-to-b from-green-50 to-green-100 rounded-2xl overflow-hidden relative">
      <Canvas
        dpr={[1, 2]}
        shadows
        camera={{ fov: 45, position: [0, 0, 6] }}
        style={{ position: "absolute" }}
      >
        <color attach="background" args={["#f0fdf4"]} />

        <PresentationControls speed={1.5} global zoom={0.7} polar={[-0.2, Math.PI / 3]}>
          <Stage environment="city" intensity={0.8} contactShadow={false}>
            <Suspense fallback={null}>
              {showImageCard ? <ImageCard imageUrl={image} /> : <RealModel />}
            </Suspense>
          </Stage>
        </PresentationControls>

        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>

      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
        <p className="text-green-800 font-bold bg-white/80 inline-block px-4 py-1 rounded-full text-sm shadow-sm">
          {showImageCard ? "Drag to Rotate " : "Drag to Rotate "}
        </p>
      </div>
    </div>
  );
}
