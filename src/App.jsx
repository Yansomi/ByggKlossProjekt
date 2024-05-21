import { useState } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import {Model} from '../src/assets/Scene'
function App() {
  return (
    <>
      <Canvas>
        <Model/>
      </Canvas>
    </>
  )
}

export default App
