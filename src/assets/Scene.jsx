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
    newPosition.y = THREE.MathUtils.clamp(newPosition.y, gridBoundary.minY, 5);

    const snappedPosition = snapToGrid(newPosition, cellSize);

    const snappedToModelsPosition = snapToOtherModels(snappedPosition, allModelsRef.current, id, modelHeight);

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

    event.object.position.copy(snappedToModelsPosition);
    lastPosition.current.copy(planeIntersect);

    groupRef.current.position.copy(snappedToModelsPosition);
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
    const finalPosition = snapToGrid(event.object.position, cellSize);
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
      <mesh geometry={nodes.Plane.geometry} material={materials['Material.001']} scale={[3.6, 4, 1.6]} />
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

function snapToGrid(position, cellSize) {
  const snappedPosition = position.clone();
  snappedPosition.x = Math.round(snappedPosition.x / cellSize) * cellSize;
  snappedPosition.z = Math.round(snappedPosition.z / cellSize) * cellSize;
  return snappedPosition;
}

function snapToOtherModels(position, models, currentModelId, modelHeight, threshold = 1) {
  models.forEach((model) => {
    if (
      model.id !== currentModelId &&
      Math.abs(position.x - model.position[0]) < threshold &&
      Math.abs(position.z - model.position[2]) < threshold
    ) {
      position.y = model.position[1] + modelHeight;
    }
  });
  return position;
}

export default Model;
