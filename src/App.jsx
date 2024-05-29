import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import { Model } from '../src/assets/Scene';
import { OrbitControls, Grid } from '@react-three/drei';
import { MOUSE } from 'three';

function App() {
  const [models, setModels] = useState([{ id: 1, position: [0, 0, 0] }]);
  const [gridSize, setGridSize] = useState(100);
  const [cellSize, setCellSize] = useState(3.6);
  const cameraRef = useRef();
  const canvasRef = useRef();
  const trashCornerSize = 20;
  const calculateTrashCornerPosition = (gridSize) => ({
    x: gridSize / 2 + (trashCornerSize / 2), // Placerar sophörnan bredvid grid
    z: gridSize / 2 + (trashCornerSize / 2),
    size: trashCornerSize / 2, // Storleken på sophörnan
  });

  const [trashCorner, setTrashCorner] = useState(calculateTrashCornerPosition(gridSize));

  useEffect(() => {
    setTrashCorner(calculateTrashCornerPosition(gridSize));
  }, [gridSize]);

  const addModel = () => {
    const newId = models.length ? models[models.length - 1].id + 1 : 1;
    setModels([...models, { id: newId, position: [10, 1, 10] }]);
  };

  const handleGridSizeChange = (event) => {
    setGridSize(Number(event.target.value));
  };

  const handleCellSizeChange = (event) => {
    setCellSize(Number(event.target.value));
  };

  const updateModelPosition = (id, newPosition) => {
    setModels((prevModels) =>
      prevModels.map((model) =>
        model.id === id ? { ...model, position: newPosition } : model
      )
    );
  };

  const removeModel = (id) => {
    setModels((prevModels) => prevModels.filter((model) => model.id !== id));
  };

  return (
    <>
      <div rel='buttonPos'>
        <button onClick={addModel}>Add Model</button>
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
        <ambientLight intensity={0.8} />
        <spotLight position={[-20, -20, -30]} angle={0.15} penumbra={1} />
        <pointLight position={[-30, -20, -20]} />
        {models.map(model => (
          <Model
            key={model.id}
            id={model.id}
            position={model.position}
            
            grid={{ size: gridSize, cellSize }}
            allModels={models}
            updateModelPosition={updateModelPosition}
            removeModel={removeModel}
            trashCorner={trashCorner}
          />
        ))}
        {/* Visualisera sophörnan */}
        <mesh position={[trashCorner.x, 0, trashCorner.z]}>
          <boxGeometry args={[trashCorner.size, 5, trashCorner.size]} />
          <meshBasicMaterial color="red" />
        </mesh>
      </Canvas>
    </>
  );
}

export default App;


