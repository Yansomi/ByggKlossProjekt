import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { Canvas, useFrame } from '@react-three/fiber';
import { Model } from '../src/assets/Scene';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import { MOUSE } from 'three';
import * as THREE from 'three';

function TempModel({ tempModel, mouse, raycaster, setTempModel, isPlacingModel,modelRefs , trashCorner, gridSize, cellSize,allModels, updateModelPosition, removeModel, setLastMovedModelId, canvasRef, glbPath}) {
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const planeIntersect = new THREE.Vector3();
  useFrame(({ camera }) => {
    if (isPlacingModel && tempModel) {
      raycaster.setFromCamera(mouse.current, camera);
      raycaster.ray.intersectPlane(plane, planeIntersect);

      if (planeIntersect) {
        const newPosition = planeIntersect;
        console.log("newPosition", newPosition);
        setTempModel((prevTempModel) => ({ ...prevTempModel, id: tempModel.id, position: [newPosition.x, 0, newPosition.z], rotation: 0, hight: 3.2, width: 1.6, lenght: 3.2, glbPath:glbPath}));
      }
    }
  });

  return tempModel ? (
    <Model
      key={tempModel.id}
      id={tempModel.id}
      position={tempModel.position}
      rotation={tempModel.rotation}
      gridSize={gridSize} // Använd lämpligt värde för gridSize
      cellSize={cellSize} // Använd lämpligt värde för cellSize
      allModels={allModels}
      updateModelPosition={updateModelPosition}
      removeModel={removeModel}
      trashCorner={trashCorner} // Använd lämpligt värde för trashCorner
      setLastMovedModelId={setLastMovedModelId}
      modelRefs={modelRefs}
      canvasRef={canvasRef}
      glbPath={glbPath}
    />
  ) : null;
}

function App() {
  const [models, setModels] = useState([]);
  const [gridSize, setGridSize] = useState(100);
  const [cellSize, setCellSize] = useState(3.2);
  const [lastMovedModelId, setLastMovedModelId] = useState(null);
  const [isPlacingModel, setIsPlacingModel] = useState(false);
  const [tempModel, setTempModel] = useState(null);
  const canvasRef = useRef();
  const trashCornerSize = 20;
  const modelRefs = useRef({});
  const raycaster = useRef(new THREE.Raycaster());
  const [numberOfBlocks, setBlocksnumber] = useState(0);
  const [pris, setPris] = useState(0);
  const mouse = useRef(new THREE.Vector2());
  const blockPris = 10;
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
    setIsPlacingModel(true);
    const newId = models.length ? models[models.length - 1].id + 1 : 1;
    const initialPosition = [0, 0, 0]; // Set an appropriate initial position
    const newModel = { id: newId, position: initialPosition, rotation: 0, hight:3.2, width: 1.6, lenght: 3.2, glbPath:'/src/assets/1600x800x800-transformed.glb' };
    setTempModel(newModel);
  };
  const handleMouseMove = useCallback((event) => {
    if (!isPlacingModel || !tempModel) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    console.log("mouse",mouse.current.x, mouse.current.y);
  }, [isPlacingModel, tempModel]);

  const handleMouseUp = useCallback(() => {
    if (isPlacingModel && tempModel) {
      console.log("tempModelPos",tempModel.position);
      setModels((prevModels) => [...prevModels, tempModel]);
      setTempModel(null);
      setIsPlacingModel(false);
      let newPrice = pris + blockPris;
      setPris(newPrice);
      let newNumber = numberOfBlocks + 1;
      setBlocksnumber(newNumber);
    }
  }, [isPlacingModel, tempModel, pris, blockPris, numberOfBlocks]);

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
    let newPrice = pris - blockPris
    setPris(newPrice);
    let newNumber = numberOfBlocks - 1;
    setBlocksnumber(newNumber);
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

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseUp, handleMouseMove]);
  

  return (
    <>
      <div className='sidePanel'>
{/*         <button type="button" class="btn btn-dark" onClick={addModel}>Add Model</button> */}
        <button className='buttonRotate' onClick={rotateModel}>Rotate Last Moved Model</button> 
        <div className="dropdown">
         <div className="btn-group" role="group" aria-label="Button group with nested dropdown">
         <button type="button" className="btn btn-success">Blocks</button>
          <div className="btn-group" role="group">
            <button id="btnGroupDrop2" type="button" className="btn btn-success dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
              <div className="dropdown-content">
              <button type="button" className="btn btn-outline-dark" onClick={addModel}>Add Block</button>
              <button type="button" className="btn btn-outline-dark" onClick={addModel}>Add Block</button>
              <button type="button" className="btn btn-outline-dark" onClick={addModel}>Add Block</button>
              <button type="button" className="btn btn-outline-dark" onClick={addModel}>Add Block</button>
            </div>
          </div>
        </div>
      </div> 
        <div>
          <label className='gridSize'>
            Grid Size:
            <input  type="number" value={gridSize} onChange={handleGridSizeChange} />
          </label>
        </div>
        <div className='modelCounter'>
          <label>Blocks:{numberOfBlocks}</label>
        </div>
        <div className='price'>
        <label >Pris:{pris}</label>
        </div>
      <div>
{/*           <label>
            Cell Size:
            <input type="number" value={cellSize} onChange={handleCellSizeChange} />
          </label> */}
        </div>
      </div>
      <Canvas ref={canvasRef} camera={{ fov: 60, near: 0.1, far: 2000, position: [50, 10, 10] }}>
        <Grid position={[0, 0, 0]} rel="grid" args={[gridSize, gridSize]} cellSize={cellSize} lineWidth={1} />
        <GridLabels gridSize={gridSize} />
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
          canvasRef={canvasRef}
          glbPath={model.glbPath}
        />
))}
{isPlacingModel && (
          <TempModel
            tempModel={tempModel}
            key={tempModel.id}
            id={tempModel.id}
            position={tempModel.position}
            isPlacingModel={isPlacingModel}
            raycaster={raycaster.current}
            mouse={mouse}
            setTempModel={setTempModel}
            gridSize={gridSize}
            cellSize={cellSize}
            allModels={models}
            updateModelPosition={updateModelPosition}
            removeModel={removeModel}
            trashCorner={trashCorner}
            rotation={tempModel.rotation}
            setLastMovedModelId={setLastMovedModelId}
            modelRefs={modelRefs}
            canvasRef={canvasRef}
            glbPath={tempModel.glbPath}
          />
        )}
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


function GridLabels({ gridSize }) {
  const labels = [];
  const step = gridSize / 10; // Justera steget efter behov

  for (let i = -gridSize / 2; i <= gridSize / 2; i += step) {
    labels.push(
      <Text key={`x-${i}`} position={[i, 0, -gridSize / 2 - 2]} fontSize={1} color="black">
        {i}
      </Text>,
      <Text key={`z-${i}`} position={[-gridSize / 2 - 2, 0, i]} fontSize={1} color="black" rotation={[0, Math.PI / 2, 0]}>
        {i}
      </Text>
    );
  }

  return <>{labels}</>;
}
