import React, { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
let glbPath1;
export function Model({ id, position, gridSize, cellSize, allModels, updateModelPosition, removeModel, trashCorner, rotation, setLastMovedModelId, modelRefs, canvasRef , glbPath }) {
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
  let currentHight = 0;
  console.log(glbPath);
  //console.log("scenepath: ",scenePath);
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
    raycaster.setFromCamera(mouse.current, cameraRef.current);
    raycaster.ray.intersectPlane(plane, planeIntersect);
    /* raycaster.params.Points.threshold = 0.2;
    raycaster.precision = 0.001; */
    console.log("planeinstersect",planeIntersect);
    currentHight = groupRef.current.position.y;

    const newPosition = new THREE.Vector3().copy(planeIntersect);

    newPosition.x = THREE.MathUtils.clamp(newPosition.x, gridBoundary.minX, gridBoundary.maxX + 10);
    newPosition.z = THREE.MathUtils.clamp(newPosition.z, gridBoundary.minZ, gridBoundary.maxZ + 10);
    newPosition.y = THREE.MathUtils.clamp(newPosition.y, gridBoundary.minY, 20);

    const snappedPosition = snapToGrid(newPosition, cellSize, groupRef);
    groupRef.current.position.copy(snappedPosition);
    const { snapped, snappedToModelsPosition } = snapToOtherModels(groupRef.current, allModelsRef.current, currentHight, selectedModelIds);
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
/*     const position = new THREE.Vector3();
    groupRef.current.getWorldPosition(position);
    
    const halfLengths = new THREE.Vector3(
      groupRef.current.children[0].scale.x / 2,
      groupRef.current.children[0].scale.y / 2,
      groupRef.current.children[0].scale.z / 2
    );

    const box = {
      center: position,
      halfLengths: halfLengths,
      rotationMatrix: new THREE.Matrix4().makeRotationY(groupRef.current.rotation.y)
    }; */
    // const collisionResult = detectCollision(box, allModels, id);

  // Check for collision and adjust position
/*   if (collisionResult.overlap) {
    const overlapX = Math.max(0, Math.min(box.center.x + box.halfLengths.x, collisionResult.obb.center.x + collisionResult.obb.halfLengths.x) - Math.max(box.center.x - box.halfLengths.x, collisionResult.obb.center.x - collisionResult.obb.halfLengths.x));
    const overlapZ = Math.max(0, Math.min(box.center.z + box.halfLengths.z, collisionResult.obb.center.z + collisionResult.obb.halfLengths.z) - Math.max(box.center.z - box.halfLengths.z, collisionResult.obb.center.z - collisionResult.obb.halfLengths.z));
    
    if (overlapX < overlapZ) {
      if (event.object.position.x > collisionResult.obb.center.x) {
        snappedToModelsPosition.x += overlapX;
      } else {
        snappedToModelsPosition.x -= overlapX;
      }
    } else {
      if (event.object.position.z > collisionResult.obb.center.z) {
        snappedToModelsPosition.z += overlapZ;
      } else {
        snappedToModelsPosition.z -= overlapZ;
      }
    }
  } */
    currentHight = snappedToModelsPosition.y;
    event.object.position.copy(snappedToModelsPosition);
    lastPosition.current.copy(planeIntersect);
    groupRef.current.position.copy(snappedToModelsPosition);
    updateModelPosition(id, groupRef.current.position.toArray());
    console.log("current pos", groupRef.current.position);
  };

  const onDragStart = (event) => {
    if (!event.object) return;
    // Perform raycasting to find the intersected object
    raycaster.setFromCamera(mouse.current, cameraRef.current);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const objectPosition = new THREE.Vector3().setFromMatrixPosition(intersects[0].object.matrixWorld);

      // Align plane with the intersected object
      plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()), objectPosition);
      raycaster.ray.intersectPlane(plane, planeIntersect);
      lastPosition.current.copy(planeIntersect);

      const selectedId = intersects;
      Object.keys(modelRefs.current).forEach((key) => {
        selectedId.forEach((intersect) => {
          if(modelRefs.current[key].current.id === intersect.object.parent.id && !selectedModelIds.includes(key)){
            selectedModelIds.push(key);
          };
        });
      });
    }
  };

  const onDragEnd = (event) => {
    if (!event.object) return;
    /* const finalPosition = snapToGrid(groupRef.current.position, cellSize,groupRef);
    groupRef.current.position.copy(finalPosition); */
    /* updateModelPosition(id, groupRef.current.position.toArray()); */
    setLastMovedModelId(id);

    selectedModelIds.forEach((id) => {
      selectedModelIds.shift();
    });

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
/*     const handlePointerMove = (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }; */
    gl.domElement.addEventListener('pointermove', handlePointerMove);

    return () => {
      gl.domElement.removeEventListener('pointermove', handlePointerMove);
    };
  }, [canvasRef, mouse]);

  return (
    <group ref={groupRef}>
      <mesh geometry={nodes.Plane.geometry} material={materials['Material.001']} scale={modelScale(allModelsRef,id)} />
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


function snapToGrid(position, cellSize,groupRef) {
  const snappedPosition = position.clone();
  let xOnLenght = false;
  if(groupRef.current.children[0].rotation.y > 3.13 && groupRef.current.children[0].rotation.y < 3.15
    || groupRef.current.children[0].rotation.y === 0)
    {
      xOnLenght = true;
    }

    else{
      xOnLenght = false;
    };
  if (xOnLenght) {
    snappedPosition.x = Math.round(snappedPosition.x / (cellSize / 4)) * (cellSize / 4);
    snappedPosition.z = Math.round(snappedPosition.z / (cellSize / 4)) * (cellSize / 4);
  } else {
    snappedPosition.x = Math.round(snappedPosition.x / (cellSize / 4) ) * (cellSize / 4) ;
    snappedPosition.z = Math.round(snappedPosition.z / (cellSize / 4)) * (cellSize / 4) ;
  }
  snappedPosition.x = snappedPosition.x / 2;
  snappedPosition.z = snappedPosition.z / 2;
  return snappedPosition;
}
function detectCollision(box, models, currentModelId) {
  const obb1 = createOBB(box.center, box.halfLengths.x * 2, box.halfLengths.z * 2, box.halfLengths.y * 2, box.rotationMatrix);

  for (const model of models) {
    if (model.id !== currentModelId) {
      const modelPos = new THREE.Vector3(...model.position);
      const modelLength = model.length;
      const modelWidth = model.width;
      const modelHeight = model.hight;
      const modelRotation = model.rotation;

      const obb2 = createOBB(modelPos, modelLength, modelWidth, modelHeight, modelRotation);

      if (obbIntersects(obb1, obb2)) {
        return { overlap: true, obb: obb2 };
      }
    }
  }

  return { overlap: false, obb: null };
}

function obbIntersects(obb1, obb2) {
  const xAxis1 = new THREE.Vector3(1, 0, 0).applyMatrix4(obb1.rotationMatrix);
  const yAxis1 = new THREE.Vector3(0, 1, 0).applyMatrix4(obb1.rotationMatrix);
  const zAxis1 = new THREE.Vector3(0, 0, 1).applyMatrix4(obb1.rotationMatrix);

  const xAxis2 = new THREE.Vector3(1, 0, 0).applyMatrix4(obb2.rotationMatrix);
  const yAxis2 = new THREE.Vector3(0, 1, 0).applyMatrix4(obb2.rotationMatrix);
  const zAxis2 = new THREE.Vector3(0, 0, 1).applyMatrix4(obb2.rotationMatrix);

  const axes = [xAxis1, yAxis1, zAxis1, xAxis2, yAxis2, zAxis2];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      axes.push(new THREE.Vector3().crossVectors(axes[i], axes[j]).normalize());
    }
  }

  const centerDiff = new THREE.Vector3().subVectors(obb2.center, obb1.center);

  for (const axis of axes) {
    if (
      Math.abs(centerDiff.dot(axis)) >
      (obb1.halfLengths.x * Math.abs(xAxis1.dot(axis))) +
      (obb1.halfLengths.y * Math.abs(yAxis1.dot(axis))) +
      (obb1.halfLengths.z * Math.abs(zAxis1.dot(axis))) +
      (obb2.halfLengths.x * Math.abs(xAxis2.dot(axis))) +
      (obb2.halfLengths.y * Math.abs(yAxis2.dot(axis))) +
      (obb2.halfLengths.z * Math.abs(zAxis2.dot(axis)))
    ) {
      return false;
    }
  }

  return true;
}
function createOBB(position, length, width, height, rotation) {
  const halfLengths = new THREE.Vector3(length / 2, height / 2, width / 2);
  const center = new THREE.Vector3(position.x, position.y, position.z);
  
  const rotationMatrix = new THREE.Matrix4().makeRotationY(rotation);

  const obb = {
    center: center,
    halfLengths: halfLengths,
    rotationMatrix: rotationMatrix
  };

  return obb;
}

function snapToOtherModels(groupRef, models, currentHight,selectedModelIds) {
  if (!groupRef) {
    return {snapped: false, snappedToModelsPosition: null}
  }
  const position = new THREE.Vector3().copy(groupRef.position);
  groupRef.getWorldPosition(position);
  let xOnLenght = false;
  let snapped = false;
  const onXthreshold = groupRef.children[0].scale.x/2;
  const notOnXthreshold = groupRef.children[0].scale.z/2;
  if(groupRef.rotation.y > 3.13 && groupRef.children[0].rotation.y < 3.15
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
      const modelHeight = model.hight / 2;
      const modelWidth = model.width / 4;
      const modelLength = model.lenght / 4;
      if(xOnLenght ===true && isModelRotated === true){
        if (Math.abs(position.x - modelPos.x) < onXthreshold + modelLength && Math.abs(position.z - modelPos.z) < notOnXthreshold + modelWidth) {
          position.y = (modelPos.y + modelHeight) - 0.4;
          snapped =  true;
        }
      }
      else if(xOnLenght === false && isModelRotated === false){
        if (Math.abs(position.x - modelPos.x) < notOnXthreshold + modelWidth && Math.abs(position.z - modelPos.z) < onXthreshold + modelLength) {
          position.y = (modelPos.y + modelHeight)  - 0.4;
          snapped =  true;
        }
      }
      else if(xOnLenght === true && isModelRotated === false){
        if (Math.abs(position.x - modelPos.x) < onXthreshold + modelWidth && Math.abs(position.z - modelPos.z) < notOnXthreshold + modelLength) {
          position.y = (modelPos.y + modelHeight)  - 0.4;
          snapped =  true;
        }
      }
      else if(xOnLenght === false && isModelRotated === true){
        if (Math.abs(position.x - modelPos.x) < notOnXthreshold + modelLength && Math.abs(position.z - modelPos.z) < onXthreshold + modelWidth) {
          position.y = (modelPos.y + modelHeight)   - 0.4;
          snapped =  true;
        }
      }
    }
    else if(!selectedModelIds.includes(Id) && !snapped){
      const modelPos = new THREE.Vector3(...model.position);
      const modelWidth = model.width / 4;
      const modelLength = model.lenght / 4;
      let isOnTop = false;
      if(xOnLenght ===true && isModelRotated === true){
        if (Math.abs(position.x - modelPos.x) < onXthreshold + modelLength && Math.abs(position.z - modelPos.z) < notOnXthreshold + modelWidth) {
          position.y = currentHight;
          snapped =  true;
          isOnTop = true;
        }
      }
      else if(xOnLenght === false && isModelRotated === false){
        if (Math.abs(position.x - modelPos.x) < notOnXthreshold + modelWidth && Math.abs(position.z - modelPos.z) < onXthreshold + modelLength) {
          snapped =  true;
          isOnTop = true;
          position.y = currentHight;
        }
      }
      else if(xOnLenght === true && isModelRotated === false){
        if (Math.abs(position.x - modelPos.x) < onXthreshold + modelWidth && Math.abs(position.z - modelPos.z) < notOnXthreshold + modelLength) {
          snapped =  true;
          isOnTop = true;
          position.y = currentHight;
        }
      }
      else if(xOnLenght === false && isModelRotated === true){
        if (Math.abs(position.x - modelPos.x) < notOnXthreshold + modelLength && Math.abs(position.z - modelPos.z) < onXthreshold + modelWidth) {
          snapped =  true;
          isOnTop = true;
          position.y = currentHight;
        }
        else if(!isOnTop){
          position.y = 0;
        }
      }
    }
    if(selectedModelIds.length > 1){
      snapped = true;
    }
  });
  return {snapped: snapped, snappedToModelsPosition: position};
}

export default Model;
