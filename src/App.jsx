import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import { Model } from '../src/assets/Scene';
import { OrbitControls, Grid } from '@react-three/drei';
import { MOUSE } from 'three';
import * as THREE from 'three';

function App() {
  const [models, setModels] = useState([]);
  const [gridSize, setGridSize] = useState(100);
  const [cellSize, setCellSize] = useState(3.2);
  const [lastMovedModelId, setLastMovedModelId] = useState(null);
  const cameraRef = useRef();
  const canvasRef = useRef();
  const trashCornerSize = 20;
  const modelRefs = useRef({});
  const calculateTrashCornerPosition = (gridSize) => ({
    x: gridSize / 2 + trashCornerSize / 2,
    z: gridSize / 2 + trashCornerSize / 2,
    size: trashCornerSize / 2,
  });

  const [trashCorner, setTrashCorner] = useState(calculateTrashCornerPosition(gridSize));

  useEffect(() => {
    setTrashCorner(calculateTrashCornerPosition(gridSize));
  }, [gridSize]);

  const addModel = () => {
    setModels((prevModels) => {
      const newId = prevModels.length ? prevModels[prevModels.length - 1].id + 1 : 1;
      const initialPosition = [0, 0, 0]; // Set an appropriate initial position
      const newModel = { id: newId, position: initialPosition, rotation: 0, hight:3.2, width: 1.6, lenght: 3.2 };
      return [...prevModels, newModel];
    });
  };

  const handleGridSizeChange = (event) => {
    setGridSize(Number(event.target.value));
  };

  const handleCellSizeChange = (event) => {
    setCellSize(Number(event.target.value));
  };

  const updateModelPosition = (id, newPosition) => {
  
    setModels((prevModels) => {
      const updatedModels = prevModels.map((model) => {
        if (model.id === id) {
          return { ...model, position: newPosition };
        }
        return model;
      });

      return updatedModels;
    });
  
  };
  

  const removeModel = (id) => {
    setModels((prevModels) => prevModels.filter((model) => model.id !== id));
  };

  const rotateModel = () => {
    if (lastMovedModelId !== null) {
      setModels((prevModels) => {
        return prevModels.map((model) => {
          if (model.id === lastMovedModelId) {
            const newRotation = (model.rotation + Math.PI / 2) % (2 * Math.PI);
            return { ...model, rotation: newRotation };
          }
          return model;
        });
      });
    }
  };

  const createSpotlights = (gridSize, distance) => {
    const spotlights = [];
    for (let x = -gridSize / 2; x <= gridSize / 2; x += distance) {
      for (let z = -gridSize / 2; z <= gridSize / 2; z += distance) {
        spotlights.push(
          <spotLight
            key={`${x}-${z}`}
            position={[x, 20, z]}
            angle={Math.PI / 2}
            penumbra={0.5}
            intensity={0.8}
            distance={40}
            power={100}
          />
        );
      }
    }
    return spotlights;
  };
  

  return (
    <>
      <div rel='buttonPos'>
        <button className='buttonAdd' onClick={addModel}>Add Model</button>
        <button className='buttonRotate' onClick={rotateModel}>Rotate Last Moved Model</button>
        <div>
          <label>
            Grid Size:
            <input type="number" value={gridSize} onChange={handleGridSizeChange} />
          </label>
        </div>
        <div>
          <label>
            Cell Size:
            <input type="number" value={cellSize} onChange={handleCellSizeChange} />
          </label>
        </div>
      </div>
      <Canvas ref={canvasRef} camera={{ fov: 90, near: 0.1, far: 2000, position: [50, 10, 10] }}>
        <Grid position={[0, 0, 0]} rel="grid" args={[gridSize, gridSize]} cellSize={cellSize} lineWidth={1} />
        <OrbitControls
          panSpeed={7}
          zoomSpeed={5}
          mouseButtons={{
            MIDDLE: MOUSE.PAN,
            RIGHT: MOUSE.ROTATE,
          }}
        />
        <ambientLight intensity={0.2} />
        {createSpotlights(gridSize, 20)}
        {models.map((model) => (
        <Model
          key={model.id}
          id={model.id}
          position={model.position}
          gridSize={gridSize}
          cellSize={cellSize}
          allModels={models}
          updateModelPosition={updateModelPosition}
          removeModel={removeModel}
          trashCorner={trashCorner}
          rotation={model.rotation}
          setLastMovedModelId={setLastMovedModelId}
          modelRefs={modelRefs}
        />
))}
        {/* Visualisera sophörnan */}
        <mesh position={[trashCorner.x, 0, trashCorner.z ]}>
          <boxGeometry args={[trashCorner.size, 5, trashCorner.size]} />
          <meshBasicMaterial color="red" />
        </mesh>
      </Canvas>
    </>
  );
}

export default App;


