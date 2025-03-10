import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { Canvas, useFrame, useThree  } from '@react-three/fiber';
import { Model } from '../src/assets/Scene';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import { MOUSE } from 'three';
import * as THREE from 'three';
import controller from '../src/controlls';
import MeasureTool from '../src/Measuretool';

function TempModel({ tempModel, mouse, raycaster, setTempModel, isPlacingModel,modelRefs , trashCorner, gridSize, cellSize,allModels, updateModelPosition, removeModel, setLastMovedModelId, canvasRef, glbPath, geometry, material,higthModefier,widthModefier,lengthModefier, preBuiltSpawn, sceneRef}) {
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
      sceneRef={sceneRef}
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
  const cameraRef = useRef();
  const [tempGridSize, setTempGridSize] = useState(gridSize);
  const sceneRef = useRef();

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
    if(block == 1){
     newModel = { id: newId, position: initialPosition, rotation: 0, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_1600x800x800-transformed.glb', geometry:'1600x800x800', material:'1600x800x800', higthModefier:1.5, widthModefier:0.60 , lengthModefier:1.25, preBuiltSpawn:false, price:10};
    }
    if(block == 2){
     newModel = { id: newId, position: initialPosition, rotation: 0, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_1600x800x400-transformed.glb', geometry:'1600x800x400', material:'1600x800x400', higthModefier:0.75, widthModefier:0.7 , lengthModefier:1.5, preBuiltSpawn:false, price:10};
    }
    if(block == 3){
     newModel = { id: newId, position: initialPosition, rotation: 0, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_1600x400x400-transformed.glb', geometry:'1600x400x400', material:'1600x400x400', higthModefier:0.75, widthModefier:0.35 , lengthModefier:1.5, preBuiltSpawn:false, price:10};
    }
    if(block == 4){
     newModel = { id: newId, position: initialPosition, rotation: 0, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_800x800x800-transformed.glb', geometry:'800x800x800', material:'800x800x800', higthModefier:1.5, widthModefier:0.6, lengthModefier:0.6, preBuiltSpawn:false, price:10};
    }
    if(block == 5){
      newModel = { id: newId, position: initialPosition, rotation: 0, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_800x800x400-transformed.glb', geometry:'800x800x400', material:'800x800x400', higthModefier:0.75, widthModefier:0.7 , lengthModefier:0.8, preBuiltSpawn:false, price:10};
    }
    if(block == 6){
      newModel = { id: newId, position: initialPosition, rotation: 0, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_800x400x400-transformed.glb', geometry:'800x400x400', material:'800x400x400', higthModefier:0.75, widthModefier:0.35 , lengthModefier:0.7, preBuiltSpawn:false, price:10};
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
    const newGridSize = Math.max(10, Math.min(100, Number(tempGridSize)));
    setGridSize(newGridSize *2);
  };

  
  const handleTempGridSizeChange = (event) => {
    setTempGridSize(event.target.value); // Uppdatera endast det temporära värdet
  };

  const handleCellSizeChange = (event) => {
    setCellSize(Number(event.target.value));
  };

  const updateModelPosition = (id, newPosition, preBuiltSpawn ) => {
  
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
  
  const getModels = () => {
    return models;
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
      block = { id: newId, position: [...initialPosition], rotation: 0, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_1600x800x800-transformed.glb', geometry:'1600x800x800', material:'1600x800x800',higthModefier:1.5, widthModefier:0.6 , lengthModefier:1.25, preBuiltSpawn:true, price:10};
      preBuilt.push(block);
      initialPosition[0] += 3.2;
    }
    const rotation = 1.5707963267948966;
    initialPosition = [-5.6,0,0.4];
    for(let i = 0;i < 2;i++){
      initialPosition[2] = 0.8;
      for(let i = 0;i < 3;i++){
        newId += 1;
        block = {id: newId, position: [...initialPosition], rotation: rotation, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_1600x800x800-transformed.glb', geometry:'1600x800x800', material:'1600x800x800',higthModefier:1.5, widthModefier:0.6 , lengthModefier:1.25, preBuiltSpawn:true, price:10};
        preBuilt.push(block);
        initialPosition[2] += 3.2;
      }
      initialPosition[0] = 5.6;
    }
    initialPosition = [-4.8,1.5,0];
    for(let i= 0;i < 4;i++){
      newId +=1;
      block = { id: newId, position: [...initialPosition], rotation: 0, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_1600x800x800-transformed.glb', geometry:'1600x800x800', material:'1600x800x800',higthModefier:1.5, widthModefier:0.6 , lengthModefier:1.25, preBuiltSpawn:true, price:10};
      preBuilt.push(block);
      initialPosition[0] += 3.2;
    }
    initialPosition = [-5.6,1.5,0.4];
    for(let i = 0;i < 2;i++){
      initialPosition[2] = 2.4;
      for(let i = 0;i < 2;i++){
        newId += 1;
        block = {id: newId, position: [...initialPosition], rotation: rotation, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_1600x800x800-transformed.glb', geometry:'1600x800x800', material:'1600x800x800',higthModefier:1.5, widthModefier:0.6 , lengthModefier:1.25, preBuiltSpawn:true, price:10};
        preBuilt.push(block);
        initialPosition[2] += 3.2;
      }
      initialPosition[0] = 5.6;
    }
    initialPosition = [-5.6,1.5,8];
    for(let i = 0;i < 2;i++){
      newId +=1;
      block = { id: newId, position: [...initialPosition], rotation: 0, hight:2, width: 2, lenght: 2, glbPath:'/src/assets/agab_block_800x800x800-transformed.glb', geometry:'800x800x800', material:'800x800x800', higthModefier:1.5, widthModefier:0.6 , lengthModefier:0.6, preBuiltSpawn:true, price:10};
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
            intensity={10}
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
  <div className="workspace-container">
    <div className='help-button-container'>
      <button type='button' className='help-button'>
        <img src="src\assets\Questionmark.svg" alt="Hjälp ikon" className="help-icon" />
        Hjälp
      </button>
      <div className='help-dropdown-container'>
        <span className='help-text'>För att rotera kameran håll inne vänster musknapp.
          Håll inne ctrl för att markera flera block.
          Håll inne shift för att använda mätverktyg med musen.
          
        </span>
      </div>
    </div>
    <div className="input-group">
      <label htmlFor="grid-size" className="input-label">Ange arbetsytan:</label>
      <div className="input-field">
        <input
          type="number"
          id="grid-size"
          value={tempGridSize}
          onChange={handleTempGridSizeChange}
          onBlur={handleGridSizeChange}
          className="area-input"
        />
        <span className="unit-label">m²</span>
      </div>
      <span className="subtext">Avser rutnäts-storleken du vill arbeta med.</span>
    </div>

    <div className="dropdown-container">
      <div className='dropdown-icon-constainer'>
        <div className='dropdown-icon-box'>
          <img src="src\assets\plus.svg" alt="block icon" className="dropdown-icon" />
        </div>
        <div className='dropdown-icon-box-2'>
          <img src="src/assets/package.svg" alt="block icon" className="dropdown-icon" />
        </div>
      </div>
      <button type="button" className="add-block-button">
        + LÄGG TILL BLOCK
      </button>
      <div className="dropdown-content">
        <button type="button" className="dropdown-item" onClick={() => addModel(1)}>
          <img src="src\assets\Block_1600_800_800.jpg" alt="block icon" className="block-icon" />
           1600x800x800</button>
        <button type="button" className="dropdown-item" onClick={() => addModel(4)}>
          <img src="src\assets\Block_800_800_800.jpg" alt="block icon" className="block-icon" />
           800x800x800</button>
      </div>
    </div>
  </div>

  <div className='prebuiltGroup'>
    <button type='button' className='preBuilt' onClick={()=> addPreBuilt(1)}>test</button>
  </div>

  <div className="offer-container">
    <div className='info-box-container'>
      <div className="info-text-2">
            <span className="info-label">Totalpris ex moms:</span>
      </div>
      <div className="info-text">
          <span className="info-label">Antal block:</span>
      </div>
    <div className="info-box">
      <div className="info-block">
        <div className="icon-block">
          <img src="src/assets/package.svg" alt="block icon" className="icon" />
        </div>
        <div className="info-value">
          <span>{numberOfBlocks} st</span>
        </div>
      </div>

      <div className="info-block-price">
        <div className="icon-block">
          <img src="src/assets/priceTag.svg" alt="price icon" className="icon" />
        </div>
        <div className="info-value">
          <span>{pris} kr</span>
        </div>
      </div>
    </div>
  </div>

  <div className='button-container'>
    <div className="button-box">
      <button className="secondary-action-button">VISA PRODUKTLISTA</button>
      <button className="action-button">BEGÄR OFFERT</button>
    </div>
  </div>
</div>


</div>

  <Canvas
        className='canvas'
        ref={canvasRef}
        camera={{ fov: 60, near: 0.1, far: 2000, position: [50, 10, 10] }}
        onCreated={({ camera }) => {
          cameraRef.current = camera;
        }}
      >
        <Grid position={[0, 0, 0]} rel="grid" sectionColor="grey" args={[gridSize, gridSize]} cellSize={cellSize} lineWidth={2} />
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
          sceneRef={sceneRef}
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
            sceneRef={sceneRef}
          />
        )}
        {/* Visualisera sophörnan */}
        <mesh position={[trashCorner.x, 0, trashCorner.z ]}>
          <boxGeometry args={[trashCorner.size, 5, trashCorner.size]} />
          <meshBasicMaterial color="red" />
        </mesh>
        <MeasureTool />
        <Controls sceneRef={sceneRef} gridSize={gridSize} canvasRef={canvasRef} updateModelPosition={updateModelPosition}
        models={models} cellSize={cellSize} setLastMovedModelId={setLastMovedModelId} trashCorner={trashCorner} removeModel={removeModel}/>
      </Canvas>
    </>
  
    </div>);
}

export default App;


function GridLabels({ gridSize }) {
  const labels = [];
  const step = gridSize / 10; // Justera steget efter behov
  let stepLable = 0;
  for (let i = -gridSize / 2; i <= gridSize / 2; i += step) {
    labels.push(
      <Text key={`x-${i + i}`} position={[i, 0, -gridSize / 2 - 2]} fontSize={2} color="black">
        {stepLable/2}
      </Text>,
      <Text key={`z-${i + i}`} position={[-gridSize / 2 - 2, 0, i]} fontSize={2} color="black" rotation={[0, Math.PI / 2, 0]}>
        {stepLable/2}
      </Text>
    );
    stepLable += step;
  }

  return <>{labels}</>;
}

function Controls({ sceneRef, gridSize, canvasRef, updateModelPosition, models, cellSize, setLastMovedModelId, trashCorner, removeModel }) {
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const selectedObjects = useRef([]); // Håller koll på valda objekt
  const { gl, camera } = useThree();
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)); // Ett plan för att "dra" objekt på rätt nivå
  const planeIntersect = useRef(new THREE.Vector3());
  const offsets = useRef([]); // Håller den initiala offseten för varje valt objekt
  const modelsRef = useRef(models);
  const trashCornerRef = useRef(trashCorner);
  const modelRefs = useRef(sceneRef);
  const isDragging = useRef(false); 
  let selectedIds = [];
  const silhouetteMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00, // Valfri färg för silhuetten
    opacity: 0.5,
    transparent: true,
  });


  useEffect(() => {
    modelRefs.current = sceneRef.current;
  }, [sceneRef.current]);

  useEffect(() => {
    modelsRef.current = models;
  }, [models]);

  useEffect(() => {
    trashCornerRef.current = trashCorner;
  }, [trashCorner]);

  const handleMouseMove = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.current.setFromCamera(mouse.current, camera);
  
    if (isDragging.current && selectedObjects.current.length > 0) {
      raycaster.current.ray.intersectPlane(plane.current, planeIntersect.current);
  
      selectedObjects.current.forEach((selectedObject, index) => {
        const newPosition = planeIntersect.current.clone().add(offsets.current[index]);
  
        // Tilldela ny position
        selectedObject.position.copy(newPosition);

  
        const {controllerPos, removed} = controller(selectedObject, gridSize, modelsRef.current, selectedObject.userData.id, cellSize, trashCornerRef, removeModel, selectedIds);
        if (!removed && controllerPos) {
          selectedObject.position.copy(controllerPos);
          updateModelPosition(selectedObject.userData.id, controllerPos.toArray(), false);
        }
        else if(removed){
          selectedObjects.current = [];
        }
      });
    }
  };
  

  const handleMouseDown = (event) => {
    if (event.button !== 0) return; // Bara vänsterklick
    raycaster.current.setFromCamera(mouse.current, camera);
    const objectsWithId = modelRefs.current.children.filter(
      (obj) => obj.userData && obj.userData.id !== undefined
    );
    const intersects = raycaster.current.intersectObjects(objectsWithId, true);
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object.parent;
      const alreadySelected = selectedObjects.current.includes(clickedObject);
  
      if (event.ctrlKey) {
        // Ctrl hålls ned för att välja/avmarkera flera objekt
        if (alreadySelected) {
          // Om objektet redan är valt, avmarkera det
          const index = selectedObjects.current.indexOf(clickedObject);
          selectedObjects.current.splice(index, 1);
          offsets.current.splice(index, 1);
          // ta bort id av redan valt objekt
          const idsIndex = selectedIds.indexOf(clickedObject.userData.id);
          selectedIds.splice(idsIndex, 1);
          // Återställ materialet
          clickedObject.children[0].material = clickedObject.originalMaterial || clickedObject.children[0].material;
        } else {
          // Lägg till objektet i listan över valda objekt
          selectedObjects.current.push(clickedObject);
          offsets.current.push(clickedObject.position.clone().sub(planeIntersect.current));
  
          // Spara ursprungliga materialet och sätt highlight-materialet
          clickedObject.originalMaterial = clickedObject.children[0].material;
          clickedObject.children[0].material = silhouetteMaterial;

          //lägg till id i selectedIds
          selectedIds.push(clickedObject.userData.id);
        }
      } else {
        // Ingen Ctrl nedtryckt
        if (alreadySelected) {
          // Om objektet är markerat, dra alla markerade objekt
          raycaster.current.ray.intersectPlane(plane.current, planeIntersect.current);
          offsets.current = selectedObjects.current.map(obj => obj.position.clone().sub(planeIntersect.current));
          isDragging.current = true; // Starta drag
        } else {
          // Om objektet inte är markerat, avmarkera alla och markera endast det klickade objektet
          console.log(selectedObjects.current);
          selectedObjects.current.forEach((obj) => {
            obj.children[0].material = obj.originalMaterial || obj.children[0].material;
          });
          selectedObjects.current = [clickedObject];
          offsets.current = [];
          selectedIds = [];
          selectedIds.push(clickedObject.userData.id);
  
          // Spara ursprungliga materialet och markera det nya objektet
          clickedObject.originalMaterial = clickedObject.children[0].material;
          clickedObject.children[0].material = silhouetteMaterial;
  
          raycaster.current.ray.intersectPlane(plane.current, planeIntersect.current);
          offsets.current.push(clickedObject.position.clone().sub(planeIntersect.current));
  
          isDragging.current = true; // Starta drag
        }
      }
    } else if (!event.ctrlKey) {
      // Om inget objekt träffas och Ctrl inte hålls ner, avmarkera allt
      selectedObjects.current.forEach((obj) => {
        obj.children[0].material = obj.originalMaterial || obj.children[0].material;
      });
      selectedObjects.current = [];
      offsets.current = [];
      isDragging.current = false; // Sluta dra
      selectedIds = [];
    }
  };
  
  

  const handleMouseUp = (event) => {
    if (isDragging.current) {
      isDragging.current = false; // Sluta dra objekt
      if (selectedObjects.current.length === 1 && !event.ctrlKey) {
        selectedObjects.current[0].children[0].material = selectedObjects.current[0].originalMaterial || selectedObjects.current[0].children[0].material;
        setLastMovedModelId(selectedObjects.current[0].userData.id);
        selectedObjects.current = [];
        offsets.current = [];
        selectedIds = [];
      }
    }
  };
  
  

  useEffect(() => {
    gl.domElement.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('mouseup', handleMouseUp);

    return () => {
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('mouseup', handleMouseUp);
    };
  }, [modelRefs, camera, gl]);

  return null;
}

