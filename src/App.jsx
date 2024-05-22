import { useState } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import {Model} from '../src/assets/Scene';
import { OrbitControls } from '@react-three/drei';

function App() {
  return (
    <>
      <Canvas camera={{fov: 60, near: 0.1, far: 1000}}>
        <OrbitControls listenToKeyEvents={"c"}/>
        <ambientLight intensity={0.5}/>
        <spotLight position={[-20, -20, -30]} angle={0.15} penumbra={1}/>
        <pointLight position={[-30, -20, -20]}/>
        <Model 
        rotation={[0.2,0,0]} 
        scale={[2,2,2]}/>
      </Canvas>
    </>
  )
}

export default App
