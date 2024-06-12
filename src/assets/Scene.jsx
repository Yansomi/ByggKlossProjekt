import React, { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import scenePath from '../assets/agab_block_1600x800x800-transformed.glb';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

export function Model({ id, position, gridSize, cellSize, allModels, updateModelPosition, removeModel, trashCorner, rotation, setLastMovedModelId}) {
  const { nodes, materials } = useGLTF(scenePath);
  const { camera, gl, raycaster, mouse } = useThree();
  const plane = new THREE.Plane();
  const planeIntersect = new THREE.Vector3();
  const lastPosition = useRef(new THREE.Vector3());
  const allModelsRef = useRef(allModels);
  const trashCornerRef = useRef(trashCorner);
  const dragControlsRef = useRef();
  const groupRef = useRef();

  useEffect(() => {
    allModelsRef.current = allModels;
  }, [allModels]);
  
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

  const modelHeight = 1.6;
  const gridBoundary = calculateGridBoundary(gridSize);

  const onDrag = (event) => {
    if (!event.object) return;

    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, planeIntersect);

    const delta = new THREE.Vector3().subVectors(planeIntersect, lastPosition.current);
    const speed = 0.5;

    const newPosition = new THREE.Vector3().copy(event.object.position).add(delta.multiplyScalar(speed));

    newPosition.x = THREE.MathUtils.clamp(newPosition.x, gridBoundary.minX, gridBoundary.maxX + 10);
    newPosition.z = THREE.MathUtils.clamp(newPosition.z, gridBoundary.minZ, gridBoundary.maxZ + 10);
    newPosition.y = THREE.MathUtils.clamp(newPosition.y, gridBoundary.minY, 20);

    const snappedPosition = snapToGrid(newPosition, cellSize, groupRef);
    groupRef.current.position.copy(snappedPosition);
    const snappedToModelsPosition = snapToOtherModels(groupRef, allModelsRef.current, id);

    const worldPosition = new THREE.Vector3();
    groupRef.current.localToWorld(worldPosition.copy(snappedToModelsPosition));

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
    const box = new THREE.Box3().setFromObject(groupRef.current);
    const collisionResult = detectCollision(box, allModels, id);

    if (collisionResult.overlap) {
      const overlapX = Math.max(0, Math.min(box.max.x, collisionResult.modelBox.max.x) - Math.max(box.min.x, collisionResult.modelBox.min.x));
      const overlapZ = Math.max(0, Math.min(box.max.z, collisionResult.modelBox.max.z) - Math.max(box.min.z, collisionResult.modelBox.min.z));
      
      if (overlapX < overlapZ) {
        if (event.object.position.x > collisionResult.modelBox.min.x) {
          snappedToModelsPosition.x += overlapX;
        } else {
          snappedToModelsPosition.x -= overlapX;
        }
      } else {
        if (event.object.position.z > collisionResult.modelBox.min.z) {
          snappedToModelsPosition.z += overlapZ;
        } else {
          snappedToModelsPosition.z -= overlapZ;
        }
      }
    }

    event.object.position.copy(snappedToModelsPosition);
    lastPosition.current.copy(planeIntersect);

    //groupRef.current.position.copy(snappedToModelsPosition);
    updateModelPosition(id, groupRef.current.position.toArray());
    console.log("currentZ", groupRef.current.position.z);
  };

  const onDragStart = (event) => {
    if (!event.object) return;
    raycaster.setFromCamera(mouse, camera);
    plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()), groupRef.current.position);
    raycaster.ray.intersectPlane(plane, planeIntersect);
    lastPosition.current.copy(planeIntersect);
  };

  const onDragEnd = (event) => {
    if (!event.object) return;
    const finalPosition = snapToGrid(event.object.position, cellSize,groupRef);
    groupRef.current.position.copy(finalPosition);
    updateModelPosition(id, groupRef.current.position.toArray());
    setLastMovedModelId(id);
  };

  useEffect(() => {
    if (groupRef.current) {
      const controls = new DragControls(groupRef.current.children, camera, gl.domElement);

      controls.addEventListener('drag', onDrag);
      controls.addEventListener('dragstart', onDragStart);
      controls.addEventListener('dragend', onDragEnd);

      console.log("GroupRef", groupRef.current);
      dragControlsRef.current = controls;

      return () => {
        controls.removeEventListener('drag', onDrag);
        controls.removeEventListener('dragstart', onDragStart);
        controls.removeEventListener('dragend', onDragEnd);
        controls.dispose();
      };
    }
  }, [camera, gl, groupRef, raycaster, mouse]);

  useEffect(() => {
    const handlePointerMove = (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    gl.domElement.addEventListener('pointermove', handlePointerMove);

    return () => {
      gl.domElement.removeEventListener('pointermove', handlePointerMove);
    };
  }, [gl.domElement, mouse]);

  return (
    <group ref={groupRef}>
      <mesh geometry={nodes.Plane.geometry} material={materials['Material.001']} scale={modelScale(allModelsRef,id)} />
    </group>
  );
}

useGLTF.preload(scenePath);


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
  console.log(groupRef.current);
  if(xOnLenght)
    {
      snappedPosition.x = Math.round(snappedPosition.x / groupRef.current.children[0].scale.x) * groupRef.current.children[0].scale.x;
      snappedPosition.z = Math.round(snappedPosition.z / groupRef.current.children[0].scale.z) * groupRef.current.children[0].scale.z;
    }
    else{
      snappedPosition.x = Math.round(snappedPosition.x / groupRef.current.children[0].scale.z) * groupRef.current.children[0].scale.z;
      snappedPosition.z = Math.round(snappedPosition.z / groupRef.current.children[0].scale.x) * groupRef.current.children[0].scale.x;
    }
  return snappedPosition;
}
function detectCollision(box, models, currentModelId) {
  for (const model of models) {
    if (model.id !== currentModelId) {
      const modelPos = new THREE.Vector3(...model.position);
      const modelLength = model.length;
      const modelWidth = model.width;
      const modelHeight = model.hight;

      const modelBox = new THREE.Box3(
        new THREE.Vector3(modelPos.x - modelLength / 2, modelPos.y - modelHeight / 2, modelPos.z - modelWidth / 2),
        new THREE.Vector3(modelPos.x + modelLength / 2, modelPos.y + modelHeight / 2, modelPos.z + modelWidth / 2)
      );

      if (box.intersectsBox(modelBox)) {
        return { overlap: true, modelBox };
      }
    }
  }

  return { overlap: false, modelBox: null };
}

function snapToOtherModels(groupRef, models, currentModelId, threshold = 0.1) {
  if (!groupRef.current) {
    return;
  }
  const position = new THREE.Vector3();
  groupRef.current.getWorldPosition(position);
  let xOnLenght = false;
  if(groupRef.current.children[0].rotation.y > 3.13 && groupRef.current.children[0].rotation.y < 3.15
    || groupRef.current.children[0].rotation.y === 0)
    {
      xOnLenght = true;
    }

    else{
      xOnLenght = false;
    };
  // Snap to height first
  models.forEach((model) => {
    if (model.id !== currentModelId) {
      const modelPos = new THREE.Vector3(...model.position);
      const modelHeight = model.hight;

      if (Math.abs(position.x - modelPos.x) < threshold && Math.abs(position.z - modelPos.z) < threshold) {
        position.y = modelPos.y + modelHeight / 2 - 0.4;
      }
    }
  });


  /* models.forEach((model) => {
    if (model.id !== currentModelId) {
      const modelPos = new THREE.Vector3(...model.position);
      const modelLength = model.lenght;
      const modelWidth = model.width;
      let isModelRotated = false;
      if(model.rotation > 3.13 && model.rotation < 3.15
        || model.rotation.y === 0)
        {
          isModelRotated = true;
        }
    
        else{
          isModelRotated = false;
        };

      console.log("otherModel", model.position);
      // Check snapping along X axis (positive and negative directions)
      for (let i = 0; i <= 4; i++) {
        let j = i + 1;
        let xOffset = 0;

        if (xOnLenght === isModelRotated) {
          xOffset = 0;
        } 
        else {
          if(xOnLenght){
            xOffset = modelLength/2;
          }
          else{
            xOffset = groupRef.current.children[0].children[0].scale.x / 2;
          }
        }

        const xSegmentPos = modelPos.x - xOffset + j * (modelLength / 2);
        const xSegmentNeg = modelPos.x - xOffset - j * (modelLength / 2);

        if (Math.abs(position.x - xSegmentPos) < threshold) {
          position.x = xSegmentPos;
        }

        if (Math.abs(position.x - xSegmentNeg) < threshold) {
          position.x = xSegmentNeg;
        }
      }

      // Check snapping along Z axis (positive and negative directions)
      for (let i = 0; i <= 4; i++) {
        let j = i + 1;
        let zOffset = 0;

        if (xOnLenght === isModelRotated) {
          zOffset = modelWidth;
        } 
        else {
          if(xOnLenght){
            zOffset = modelWidth;
          }
          else{
            zOffset = groupRef.current.children[0].children[0].scale.z / 2;
          }
        }
        console.log(modelPos);
        console.log("zOffset", zOffset);
        const zSegmentPos = modelPos.z + zOffset;
        const zSegmentNeg = modelPos.z - zOffset;
        console.log("zSegPos", zSegmentPos);
        console.log("zSegNeg", zSegmentNeg);
        if (Math.abs(position.z - zSegmentPos) < threshold && groupRef.current.position.z > modelPos.z) {
          position.z = zSegmentPos;
          console.log("triggerPos", position.z);
        }

        if (Math.abs(position.z - zSegmentNeg) < threshold && groupRef.current.position.z < modelPos.z) {
          position.z = zSegmentNeg -0.1;
          console.log("triggerNeg", position.z);
        }
      }
    }
  }); */

  return position;
}

export default Model;
