import React, { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
let glbPath1;
export function Model({ id, position, gridSize, cellSize, allModels, updateModelPosition, removeModel, trashCorner, rotation, setLastMovedModelId, modelRefs, canvasRef , glbPath, geometry, material,widthModefier,preBuiltSpawn }) {
  glbPath1 = glbPath;
  const { nodes, materials } = useGLTF(glbPath1);
  const { gl, raycaster,scene, camera } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const planeIntersect = new THREE.Vector3();
  const lastPosition = useRef(new THREE.Vector3());
  const allModelsRef = useRef(allModels);
  const trashCornerRef = useRef(trashCorner);
  const dragControlsRef = useRef();
  const groupRef = useRef();
  const selectedModelIds = [];
  const cameraRef = useRef();
  const mouse = useRef(new THREE.Vector2());
  let selectedObj = null;
  let currentHight = 0;
  useEffect(() => {
    allModelsRef.current = allModels;
  }, [allModels]);
  useEffect(() => {
    // Lägg till referens till modelRefs när modellen skapas
    modelRefs.current[id] = groupRef;
    // Ta bort referensen från modelRefs när komponenten unmountas
    return () => {
      delete modelRefs.current[id];
    };
  }, [id, modelRefs]);
  
  useEffect(() => {
    trashCornerRef.current = trashCorner;
  }, [trashCorner]);


  useEffect(() => {
    if (groupRef.current) {
      // Uppdatera modellens position och rotation
      groupRef.current.position.set(...position);
      groupRef.current.children[0].rotation.y = rotation;
    }
  }, [rotation, position]);

  const gridBoundary = calculateGridBoundary(gridSize);

  useFrame(({ camera  }) => {
    cameraRef.current = camera
  });

  const onDrag = (event) => {
    if (!event.object) return;
    if (event.object !== selectedObj) return;
    //raycaster.setFromCamera(mouse.current, cameraRef.current);
    raycaster.ray.intersectPlane(plane, planeIntersect);
    /* raycaster.params.Points.threshold = 0.2;
    raycaster.precision = 0.001; */
    currentHight = groupRef.current.position.y;

    //console.log("ondrag event",event.object,"controler",dragControlsRef.current.objects,"raycaster",raycaster.intersectObjects);

    const newPosition = new THREE.Vector3().copy(planeIntersect);

    newPosition.x = THREE.MathUtils.clamp(newPosition.x, gridBoundary.minX, gridBoundary.maxX + 10);
    newPosition.z = THREE.MathUtils.clamp(newPosition.z, gridBoundary.minZ, gridBoundary.maxZ + 10);
    newPosition.y = THREE.MathUtils.clamp(newPosition.y, gridBoundary.minY, 20);

    const snappedPosition = snapToGrid(newPosition, cellSize, groupRef,widthModefier);
    groupRef.current.position.copy(snappedPosition);
    const { snapped, snappedToModelsPosition } = snapToOtherModels(id,groupRef.current, allModelsRef.current, currentHight, selectedModelIds, preBuiltSpawn);
    const worldPosition = new THREE.Vector3();
    if(!snapped){
      snappedToModelsPosition.y = 0;
    }
    else if(snapped && selectedModelIds.length > 1){
      snappedToModelsPosition.y = currentHight;
    }
    groupRef.current.localToWorld(worldPosition.copy(snappedToModelsPosition));
    groupRef.current.position.copy(snappedToModelsPosition);


    const currentTrashCorner = trashCornerRef.current;


    const isInTrashCorner =
    worldPosition.x >= currentTrashCorner.x - currentTrashCorner.size / 2 &&
    worldPosition.x <= currentTrashCorner.x + currentTrashCorner.size / 2 &&
    worldPosition.z >= currentTrashCorner.z - currentTrashCorner.size / 2 &&
    worldPosition.z <= currentTrashCorner.z + currentTrashCorner.size / 2;

    if (isInTrashCorner) {
      removeModel(id);
      return;
    }

    currentHight = snappedToModelsPosition.y;
    event.object.position.copy(snappedToModelsPosition);
    lastPosition.current.copy(planeIntersect);
    groupRef.current.position.copy(snappedToModelsPosition);
    updateModelPosition(id, groupRef.current.position.toArray(), false);
    //console.log("dragControls in ondrag",dragControlsRef.current.objects);
  };

  const onDragStart = (event) => {
    if (!event.object) return;
    // Perform raycasting to find the intersected object

    raycaster.setFromCamera(mouse.current, cameraRef.current);
    const intersects = raycaster.intersectObjects(scene.children, true);
    console.log("instresects", intersects);

    if (intersects.length > 0) {
      const objectPosition = new THREE.Vector3().setFromMatrixPosition(intersects[0].object.matrixWorld);

      // Align plane with the intersected object
      plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()), objectPosition);
      raycaster.ray.intersectPlane(plane, planeIntersect);
      lastPosition.current.copy(planeIntersect);
      selectedObj = intersects[0].object;
      event.object = intersects[0].object;
      console.log("selected",selectedObj,"event",event.object,"groupref", groupRef.current);
      
          // Uppdatera dragControls till att bara hantera det första träffade objektet


      dragControlsRef.current.objects = [selectedObj];
      console.log("dragControls",dragControlsRef.current);

      const selectedId = intersects;
      Object.keys(modelRefs.current).forEach((key) => {
        selectedId.forEach((intersect) => {
          if(modelRefs.current[key].current.id === intersect.object.parent.id && !selectedModelIds.includes(key)){
            selectedModelIds.push(key);
          };
        });
      });
    }
/*     else{
      dragControlsRef.current.objects = [];
    } */
  };

  const onDragEnd = (event) => {
    if (!event.object) return;
    selectedModelIds.forEach((id) => {
      selectedModelIds.shift();
    });
    setLastMovedModelId(id);
  };

  useEffect(() => {
    if (groupRef.current) {
      const controls = new DragControls([groupRef.current], camera, gl.domElement);
      controls.addEventListener('drag', onDrag);
      controls.addEventListener('dragstart', onDragStart);
      controls.addEventListener('dragend', onDragEnd);
      dragControlsRef.current = controls;

      return () => {
        controls.removeEventListener('drag', onDrag);
        controls.removeEventListener('dragstart', onDragStart);
        controls.removeEventListener('dragend', onDragEnd);
        controls.dispose();
      };
    }
  }, [cameraRef, gl, groupRef, raycaster, mouse]);

  const handlePointerMove = (event) => {
    const canvasBounds = canvasRef.current.getBoundingClientRect();
    mouse.current.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
    mouse.current.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;
  };

  useEffect(() => {

    gl.domElement.addEventListener('pointermove', handlePointerMove);

    return () => {
      gl.domElement.removeEventListener('pointermove', handlePointerMove);
    };
  }, [canvasRef, mouse]);

  return (
    <group ref={groupRef}>
      <mesh geometry={nodes[geometry].geometry} material={nodes[material].material} scale={modelScale(allModelsRef,id)} />
    </group>
  );
}

useGLTF.preload(glbPath1);


function calculateGridBoundary(gridSize) {
  return {
    minX: -gridSize / 2,
    maxX: gridSize / 2,
    minZ: -gridSize / 2,
    maxZ: gridSize / 2,
    minY: 0,
  };
}

function modelScale(allModelsRef,id){
  const modelScale = [];
  for(let i = 0;i < allModelsRef.current.length; i++)
    {
      if(allModelsRef.current[i].id === id)
      {
        modelScale[0] = allModelsRef.current[i].lenght;
        modelScale[1] = allModelsRef.current[i].hight;
        modelScale[2] = allModelsRef.current[i].width;
        i = allModelsRef.current.lenght;
      };
    };
  return modelScale;
}


function snapToGrid(position, cellSize,groupRef,widthModefier) {
  const snappedPosition = position.clone();
  let xOnLenght = false;
  let cellDivider = 4;
  if(widthModefier < 0.3)
    {
      cellDivider = 8;
    }
  if(groupRef.current.children[0].rotation.y > 3.13 && groupRef.current.children[0].rotation.y < 3.15
    || groupRef.current.children[0].rotation.y === 0)
    {
      xOnLenght = true;
    }

    else{
      xOnLenght = false;
    };
  if (xOnLenght) {
    snappedPosition.x = Math.round(snappedPosition.x / (cellSize / cellDivider)) * (cellSize / cellDivider);
    snappedPosition.z = Math.round(snappedPosition.z / (cellSize / cellDivider)) * (cellSize / cellDivider);
  } else {
    snappedPosition.x = Math.round(snappedPosition.x / (cellSize / cellDivider) ) * (cellSize / cellDivider) ;
    snappedPosition.z = Math.round(snappedPosition.z / (cellSize / cellDivider)) * (cellSize / cellDivider) ;
  }
  snappedPosition.x = snappedPosition.x /2;
  snappedPosition.z = snappedPosition.z /2;
  return snappedPosition;
}


function snapToOtherModels(id,groupRef, models, currentHight,selectedModelIds,preBuiltSpawn) {
  if (!groupRef) {
    return {snapped: false, snappedToModelsPosition: null}
  }
  let selectedModelHightModefier = 0;
  let selcetedModelWidthModefier = 0;
  let selecterModelLenghtModefier = 0;
  models.forEach((models) => {
    if(models.id === id)
      {
        selectedModelHightModefier = models.higthModefier;
        selcetedModelWidthModefier = models.widthModefier;
        selecterModelLenghtModefier = models.lengthModefier;
      }
  });
  const position = new THREE.Vector3().copy(groupRef.position);
  groupRef.getWorldPosition(position);
  let xOnLenght = false;
  let snapped = false;
  const onXthreshold = selecterModelLenghtModefier;
  const notOnXthreshold = selcetedModelWidthModefier;
  if(groupRef.children[0].rotation.y > 3.13 && groupRef.children[0].rotation.y < 3.15
    || groupRef.children[0].rotation.y === 0)
    {
      xOnLenght = true;
    }

    else{
      xOnLenght = false;
    };
  // Snap to height first
  models.forEach((model) => {
    const Id = model.id.toString();

    let shouldBeonTop = false;
    let isModelRotated = false;
    if(currentHight <= model.position[1]){
      shouldBeonTop = true;
    }
    if(model.rotation > 3.13 && model.rotation < 3.15
      || model.rotation === 0)
      {
        isModelRotated = true;
      }
  
      else{
        isModelRotated = false;
      };

    if (!selectedModelIds.includes(Id) && shouldBeonTop) {
      const modelPos = new THREE.Vector3(...model.position);
      const modelHeight = model.higthModefier/2;
      let modelWidth = model.widthModefier;
      let modelLength = model.lengthModefier;
      if(model.preBuiltSpawn === true){
        modelPos.x = modelPos.x/2;
        modelPos.z = modelPos.z/2;
        modelPos.y = modelPos.y/2;
      }
    
      if(xOnLenght ===true && isModelRotated === true){
        if (Math.abs(position.x - modelPos.x) < onXthreshold + modelLength && Math.abs(position.z - modelPos.z) < notOnXthreshold + modelWidth) {
          position.y = (modelPos.y + modelHeight) ;
          snapped =  true;
        }
      }
      else if(xOnLenght === false && isModelRotated === false){
        if (Math.abs(position.x - modelPos.x) < notOnXthreshold + modelWidth && Math.abs(position.z - modelPos.z) < onXthreshold + modelLength) {
          position.y = (modelPos.y + modelHeight) ;
          snapped =  true;
        }
      }
      else if(xOnLenght === true && isModelRotated === false){
        if (Math.abs(position.x - modelPos.x) < onXthreshold + modelWidth && Math.abs(position.z - modelPos.z) < notOnXthreshold + modelLength) {
          position.y = (modelPos.y + modelHeight) ;
          snapped =  true;
        }
      }
      else if(xOnLenght === false && isModelRotated === true){
        if (Math.abs(position.x - modelPos.x) < notOnXthreshold + modelLength  && Math.abs(position.z - modelPos.z) < onXthreshold + modelWidth) {
          position.y = (modelPos.y + modelHeight) ;
          snapped =  true;
        }
      }
    }
    else if(!selectedModelIds.includes(Id) && !snapped){
      const modelPos = new THREE.Vector3(...model.position);
      let modelWidth = model.widthModefier;
      let modelLength = model.lengthModefier;
      let isOnTop = false;
      if(model.preBuiltSpawn === true){
        modelPos.x = modelPos.x/2;
        modelPos.z = modelPos.z/2;
      }
      if(xOnLenght ===true && isModelRotated === true){
        if (Math.abs(position.x - modelPos.x) < onXthreshold + modelLength && Math.abs(position.z - modelPos.z) < notOnXthreshold + modelWidth) {
          position.y = currentHight;
          snapped =  true;
          isOnTop = true;
        }
      }
      else if(xOnLenght === false && isModelRotated === false){
        console.log('abs',Math.abs(position.x - modelPos.x))
        if (Math.abs(position.x - modelPos.x) < notOnXthreshold + modelWidth && Math.abs(position.z - modelPos.z) < onXthreshold + modelLength) {
          snapped =  true;
          isOnTop = true;
          position.y = currentHight;
        }
      }
      else if(xOnLenght === true && isModelRotated === false){
        if (Math.abs(position.x - modelPos.x) < onXthreshold + modelWidth  && Math.abs(position.z - modelPos.z) < notOnXthreshold + modelLength ) {
          snapped =  true;
          isOnTop = true;
          position.y = currentHight;
        }
      }
      else if(xOnLenght === false && isModelRotated === true){
        if (Math.abs(position.x - modelPos.x) < notOnXthreshold + modelLength   && Math.abs(position.z - modelPos.z) < onXthreshold + modelWidth ) {
          snapped =  true;
          isOnTop = true;
          position.y = currentHight;
        }
        else if(!isOnTop){
          position.y = 0;
        }
      }
    }
    if(selectedModelIds.length > 1 ){
      snapped = true;
    }
  });
  return {snapped: snapped, snappedToModelsPosition: position};
}

export default Model;
