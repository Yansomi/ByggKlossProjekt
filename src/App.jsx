import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { Canvas, useFrame } from '@react-three/fiber';
import { Model } from '../src/assets/Scene';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import { MOUSE } from 'three';
import * as THREE from 'three';

function TempModel({ tempModel, mouse, raycaster, setTempModel, isPlacingModel,modelRefs , trashCorner, gridSize, cellSize,allModels, updateModelPosition, removeModel, setLastMovedModelId, canvasRef, glbPath, geometry, material,higthModefier,widthModefier,lengthModefier, preBuiltSpawn}) {
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const planeIntersect = new THREE.Vector3();
  useFrame(({ camera }) => {
    if (isPlacingModel && tempModel) {
      raycaster.setFromCamera(mouse.current, camera);
      raycaster.ray.intersectPlane(plane, planeIntersect);

      if (planeIntersect) {
        const newPosition = planeIntersect;
        setTempModel((prevTempModel) => ({ ...prevTempModel, id: tempModel.id, position: [newPosition.x, 0, newPosition.z], rotation: 0, hight:tempModel.hight, width:tempModel.width, lenght:tempModel.lenght, glbPath:glbPath, geometry:geometry, material:material, higthModefier:higthModefier, widthModefier:widthModefier , lengthModefier:lengthModefier, preBuiltSpawn:preBuiltSpawn}));
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
      geometry={geometry}
      material={material}
      widthModefier={tempModel.widthModefier}
      preBuiltSpawn={tempModel.preBuiltSpawn}
    />
  ) : null;
}

function App() {
  const [models, setModels] = useState([]);
  const [gridSize, setGridSize] = useState(50);
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
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [isRightMouseDown, setIsRightMouseDown] = useState(false);

  const calculateTrashCornerPosition = (gridSize) => ({
    x: gridSize / 2 + trashCornerSize / 2,
    z: gridSize / 2 + trashCornerSize / 2,
    size: trashCornerSize / 2,
  });
  const [trashCorner, setTrashCorner] = useState(calculateTrashCornerPosition(gridSize));
  useEffect(() => {
    blockAndpriceUpdate();
  }, [models.length]);

  useEffect(() => {
    setTrashCorner(calculateTrashCornerPosition(gridSize));
  }, [gridSize]);

  const addModel = (block) => {
    setIsPlacingModel(true);
    const newId = models.length ? models[models.length - 1].id + 1 : 1;
    const initialPosition = [0, 0, 0]; // Set an appropriate initial position
    let newModel ;
    console.log(block);
    if(block == 1){
     newModel = { id: newId, position: initialPosition, rotation: 0, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_1600x800x800-transformed.glb', geometry:'1600x800x800', material:'1600x800x800', higthModefier:1.5, widthModefier:0.30 , lengthModefier:0.7, preBuiltSpawn:false, price:10};
    }
    if(block == 2){
     newModel = { id: newId, position: initialPosition, rotation: 0, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_1600x800x400-transformed.glb', geometry:'1600x800x400', material:'1600x800x400', higthModefier:0.75, widthModefier:0.30 , lengthModefier:0.7, preBuiltSpawn:false, price:10};
    }
    if(block == 3){
     newModel = { id: newId, position: initialPosition, rotation: 0, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_1600x400x400-transformed.glb', geometry:'1600x400x400', material:'1600x400x400', higthModefier:0.75, widthModefier:0.2 , lengthModefier:0.7, preBuiltSpawn:false, price:10};
    }
    if(block == 4){
     newModel = { id: newId, position: initialPosition, rotation: 0, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_800x800x800-transformed.glb', geometry:'800x800x800', material:'800x800x800', higthModefier:1.5, widthModefier:0.30 , lengthModefier:0.4, preBuiltSpawn:false, price:10};
    }
    if(block == 5){
      newModel = { id: newId, position: initialPosition, rotation: 0, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_800x800x400-transformed.glb', geometry:'800x800x400', material:'800x800x400', higthModefier:0.75, widthModefier:0.30 , lengthModefier:0.4, preBuiltSpawn:false, price:10};
    }
    if(block == 6){
      newModel = { id: newId, position: initialPosition, rotation: 0, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_800x400x400-transformed.glb', geometry:'800x400x400', material:'800x400x400', higthModefier:0.75, widthModefier:0.2 , lengthModefier:0.4, preBuiltSpawn:false, price:10};
    }
    setTempModel(newModel);
  };
  const handleMouseMove = useCallback((event) => {
    if (!isPlacingModel || !tempModel) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }, [isPlacingModel, tempModel]);

  const handleMouseUp = useCallback(() => {
    if (isPlacingModel && tempModel) {
      setModels((prevModels) => [...prevModels, tempModel]);
      setTempModel(null);
      setIsPlacingModel(false);
    }
  }, [isPlacingModel, tempModel, numberOfBlocks]);

  const handleGridSizeChange = (event) => {
    if(Number(event.target.value) < 10){
      setGridSize(20);
    }
    else if(Number(event.target.value) > 200){
      setGridSize(200);
    }
    else{
    setGridSize(Number(event.target.value));
    }
  };

  const handleCellSizeChange = (event) => {
    setCellSize(Number(event.target.value));
  };

  const updateModelPosition = (id, newPosition, preBuiltSpawn) => {
  
    setModels((prevModels) => {
      const updatedModels = prevModels.map((model) => {
        if (model.id === id) {
          return { ...model, position: newPosition, preBuiltSpawn: preBuiltSpawn};
        }
        return model;
      });
      return updatedModels;
    });
  
  };

  

  const removeModel = (id) => {
    setModels((prevModels) => prevModels.filter((model) => model.id !== id));
  };

  const blockAndpriceUpdate = () => {
    console.log(models);
    if(models){
      setBlocksnumber(models.length);
      let newPrice = 0;
      for(let i =  0;i < models.length;i++){
        newPrice += models[i].price;
      }
      setPris(newPrice);
    }
    else{
      setBlocksnumber(0);
      setPris(0);
    }
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

  const addPreBuilt = (number) => {
    if(number == 1)
      {
        prebuilt1();
      }
  };

  const prebuilt1 = () => {
    let preBuilt = [];
    let initialPosition = [-3.2,0,0];
    let block;
    let newId = models.length;

    for(let i = 0;i < 3 ;i++){

      newId += 1;
      block = { id: newId, position: [...initialPosition], rotation: 0, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_1600x800x800-transformed.glb', geometry:'1600x800x800', material:'1600x800x800',higthModefier:1.5, widthModefier:0.3 , lengthModefier:0.6, preBuiltSpawn:true, price:10};
      preBuilt.push(block);
      initialPosition[0] += 3.2;
    }
    const rotation = 1.5707963267948966;
    initialPosition = [-5.6,0,0.4];
    for(let i = 0;i < 2;i++){
      initialPosition[2] = 0.8;
      for(let i = 0;i < 3;i++){
        newId += 1;
        block = {id: newId, position: [...initialPosition], rotation: rotation, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_1600x800x800-transformed.glb', geometry:'1600x800x800', material:'1600x800x800',higthModefier:1.5, widthModefier:0.3 , lengthModefier:0.6, preBuiltSpawn:true, price:10};
        preBuilt.push(block);
        initialPosition[2] += 3.2;
      }
      initialPosition[0] = 5.6;
    }
    initialPosition = [-4.8,1.5,0];
    for(let i= 0;i < 4;i++){
      newId +=1;
      block = { id: newId, position: [...initialPosition], rotation: 0, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_1600x800x800-transformed.glb', geometry:'1600x800x800', material:'1600x800x800',higthModefier:1.5, widthModefier:0.3 , lengthModefier:0.6, preBuiltSpawn:true, price:10};
      preBuilt.push(block);
      initialPosition[0] += 3.2;
    }
    initialPosition = [-5.6,1.5,0.4];
    for(let i = 0;i < 2;i++){
      initialPosition[2] = 2.4;
      for(let i = 0;i < 2;i++){
        newId += 1;
        block = {id: newId, position: [...initialPosition], rotation: rotation, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_1600x800x800-transformed.glb', geometry:'1600x800x800', material:'1600x800x800',higthModefier:1.5, widthModefier:0.3 , lengthModefier:0.6, preBuiltSpawn:true, price:10};
        preBuilt.push(block);
        initialPosition[2] += 3.2;
      }
      initialPosition[0] = 5.6;
    }
    initialPosition = [-5.6,1.5,8];
    for(let i = 0;i < 2;i++){
      newId +=1;
      block = { id: newId, position: [...initialPosition], rotation: 0, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_800x800x800-transformed.glb', geometry:'800x800x800', material:'800x800x800', higthModefier:1.5, widthModefier:0.30 , lengthModefier:0.4, preBuiltSpawn:true, price:10};
      preBuilt.push(block);
      initialPosition[0] = 5.6;
    }
    setModels((prevModels) => [...prevModels, ...preBuilt]);
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
            power={2000}
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Control') {
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === 'Control') {
        setIsCtrlPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };

  }, []);
  useEffect(() => {
    const handleMouseDown = (event) => {
      if (isCtrlPressed && event.button === 2) { // Högerklick (2 = höger musknapp)
        // Utför rotationen en gång per högerklick
        rotateModel();
      }
    };

    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isCtrlPressed]);


  return (
    <div className='canvasBody'>
    <>
  <div className='buttonBody'>
            <button className='buttonRotate' onClick={rotateModel}>Rotate Last Moved Model</button> 
      <div className="dropdown">
         <div className="btn-group" role="group" aria-label="Button group with nested dropdown">
          <button type="button" className="btn btn-success">Blocks</button>
          <div className="btn-group" role="group">
            <button id="btnGroupDrop2" type="button" className="btn btn-success dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
              <div className="dropdown-content">
              <button type="button" className="btn btn-outline-dark" onClick={() => addModel(1)}>1600x800x800</button>
              <button type="button" className="btn btn-outline-dark" onClick={() => addModel(2)}>1600x800x400</button>
              <button type="button" className="btn btn-outline-dark" onClick={() => addModel(3)}>1600x400x400</button>
              <button type="button" className="btn btn-outline-dark" onClick={() => addModel(4)}>800x800x800</button>
              <button type="button" className="btn btn-outline-dark" onClick={() => addModel(5)}>800x800x400</button>
              <button type="button" className="btn btn-outline-dark" onClick={() => addModel(6)}>800x400x400</button>
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
        <div className='prebuiltGroup'>
        <button type='button' className='preBuilt' onClick={()=> addPreBuilt(1)}>test</button>
      </div>
  </div>
      <Canvas className='canvas' ref={canvasRef} camera={{ fov: 60, near: 0.1, far: 2000, position: [50, 10, 10] }}>
        <Grid position={[0, 0, 0]} rel="grid" args={[gridSize, gridSize]} cellSize={cellSize} lineWidth={1} />
        <GridLabels gridSize={gridSize} />
        <OrbitControls
          panSpeed={7}
          zoomSpeed={5}
          rotateSpeed={0.5}
          minDistance={10}
          maxDistance={100}
          onChange={(e) => {
            const { x, z } = e.target.object.position;
  
            // Begränsa x och z positioner så de inte går utanför griden
            const halfGridSize = gridSize / 2 +50;
            const { y } = e.target.object.position;
            e.target.object.position.x = Math.max(-halfGridSize, Math.min(halfGridSize, x));
            e.target.object.position.z = Math.max(-halfGridSize, Math.min(halfGridSize, z));
            e.target.object.position.y = Math.max(0, Math.min(100, y));
          }}
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
          geometry={model.geometry}
          material={model.material}
          widthModefier={model.widthModefier}
          preBuiltSpawn={model.preBuiltSpawn}
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
            geometry={tempModel.geometry}
            material={tempModel.material}
            higthModefier={tempModel.higthModefier}
            widthModefier={tempModel.widthModefier}
            lengthModefier={tempModel.lengthModefier}
            preBuiltSpawn={tempModel.preBuiltSpawn}
          />
        )}
        {/* Visualisera sophörnan */}
        <mesh position={[trashCorner.x, 0, trashCorner.z ]}>
          <boxGeometry args={[trashCorner.size, 5, trashCorner.size]} />
          <meshBasicMaterial color="red" />
        </mesh>
      </Canvas>
    </>
  
    </div>);
}

export default App;


function GridLabels({ gridSize }) {
  const labels = [];
  const step = gridSize / 10; // Justera steget efter behov

  for (let i = -gridSize / 2; i <= gridSize / 2; i += step) {
    labels.push(
      <Text key={`x-${i + i}`} position={[i, 0, -gridSize / 2 - 2]} fontSize={2} color="black">
        {i}
      </Text>,
      <Text key={`z-${i + i}`} position={[-gridSize / 2 - 2, 0, i]} fontSize={2} color="black" rotation={[0, Math.PI / 2, 0]}>
        {i}
      </Text>
    );
  }

  return <>{labels}</>;
}
