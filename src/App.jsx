import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import { Model } from '../src/assets/Scene';
import { OrbitControls, Grid } from '@react-three/drei';
import { MOUSE } from 'three';
import * as THREE from 'three';

function App() {
  const [models, setModels] = useState([]);
  const [gridSize, setGridSize] = useState(100);
  const [cellSize, setCellSize] = useState(3.6);
  const [lastMovedModelId, setLastMovedModelId] = useState(null);
  const cameraRef = useRef();
  const canvasRef = useRef();
  const trashCornerSize = 20;
  const groupRef = useRef();
  const dragControlsRef = useRef();
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
      const initialPosition = [1, 0, 1]; // Set an appropriate initial position
      const newModel = { id: newId, position: initialPosition, rotation: 0 };
      return [...prevModels, newModel];
    });
  };

  const handleGridSizeChange = (event) => {
    setGridSize(Number(event.target.value));
  };

  const handleCellSizeChange = (event) => {
    setCellSize(Number(event.target.value));
  };

  const updateModelPosition = (id, newPosition, newRotation) => {
    console.log("updateModelPosition called with:", { id, newPosition, newRotation });
  
    setModels((prevModels) => {
      const updatedModels = prevModels.map((model) => {
        if (model.id === id) {
          console.log("Updating model:", { ...model, position: newPosition, rotation: newRotation });
          return { ...model, position: newPosition, rotation: newRotation };
        }
        return model;
      });
      console.log("Updated models state:", updatedModels);
      return updatedModels;
    });
  
    console.log("newPos after setModels:", newPosition);
  };
  

  const removeModel = (id) => {
    setModels((prevModels) => prevModels.filter((model) => model.id !== id));
  };

  const rotateModel = () => {
    if (lastMovedModelId !== null) {
      setModels((prevModels) =>
        prevModels.map((model) =>
          model.id === lastMovedModelId
            ? { ...model, positionWorld: model.position, rotation: (model.rotation + Math.PI / 2) % (2 * Math.PI) }
            : model
        )
      );
      // Omvandla den sparade positionen från världskoordinater till lokala koordinater för den roterade modellen
      const localPosition = new THREE.Vector3().copy(groupRef.current.position);
      groupRef.current.worldToLocal(localPosition);
      // Använd de omvandlade lokala koordinaterna för att uppdatera dragkontrollerna
      dragControlsRef.current.activate();
      //dragControlsRef.current.transformGroup.localToWorld(localPosition);
      dragControlsRef.current.object.localToWorld(localPosition);
      dragControlsRef.current.dispatchEvent({ type: "drag", object: groupRef.current });
    }
  };

  return (
    <>
      <div rel='buttonPos'>
        <button onClick={addModel}>Add Model</button>
        <button onClick={rotateModel}>Rotate Last Moved Model</button>
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
          groupRef={groupRef}
          dragControlsRef={dragControlsRef}
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