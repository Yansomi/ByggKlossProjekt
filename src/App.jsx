import { useRef } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import { Model } from './assets/Scene';
import { OrbitControls } from '@react-three/drei';
import { MOUSE } from 'three';

function App() {
  const cameraRef = useRef();
  const canvasRef = useRef();

  return (
    <>
      <Canvas ref={canvasRef} camera={{ fov: 60, near: 0.1, far: 1000, position: [0, 0, 5] }}>
        <OrbitControls
          panSpeed={7}
          zoomSpeed={10}
          mouseButtons={{
            MIDDLE: MOUSE.PAN,
            RIGHT: MOUSE.ROTATE,
          }}
        />
        <ambientLight intensity={0.5} />
        <spotLight position={[-20, -20, -30]} angle={0.15} penumbra={1} />
        <pointLight position={[-30, -20, -20]} />
        <Model
          rotation={[0.2, 0, 0]}
          scale={[2, 2, 2]}
        />
      </Canvas>
    </>
  );
}

export default App;