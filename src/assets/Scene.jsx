import React, { useRef, useEffect,useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree, extend } from '@react-three/fiber';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import scenePath from '../assets/agab_block_1600x800x800-transformed.glb';
import * as THREE from 'three';
extend({ DragControls });

// Funktion för att beräkna gridBoundary baserat på gridSize
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
    if (model.id !== currentModelId && 
        Math.abs(position.x - model.position[0]) < threshold && 
        Math.abs(position.z - model.position[2]) < threshold) {
      position.y = model.position[1] + modelHeight; // Snap the model exactly on top of the other model
    }
  });
  return position;
}

export function Model({ id, position, gridSize, cellSize, allModels, updateModelPosition, removeModel, trashCorner, rotation }) {
  const { nodes, materials } = useGLTF(scenePath);
  const groupRef = useRef();
  const dragControlsRef = useRef();
  const { camera, gl, raycaster, mouse } = useThree();
  const plane = new THREE.Plane();
  const planeIntersect = new THREE.Vector3();
  const lastPosition = useRef(new THREE.Vector3());
  const allModelsRef = useRef(allModels);
  const trashCornerRef = useRef(trashCorner);
  const [currentRotation, setCurrentRotation] = useState(rotation);
  const [currentPosition, setCurrentposition] = useState(position);

  useEffect(() => {
    allModelsRef.current = allModels;
  }, [allModels]);

  useEffect(() => {
    trashCornerRef.current = trashCorner;
  }, [trashCorner]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.order = 'YXZ';
      groupRef.current.rotation.y = currentRotation; // Ensure the model's rotation is set
      //groupRef.current.position.copy(currentPosition);
      updateModelPosition(id, groupRef.current.position ,groupRef.current.rotation.y);
    }
  }, [currentRotation, currentPosition]);

  useEffect(() => {
    setCurrentRotation(rotation); // Update state when rotation prop changes
    setCurrentposition(position);
    console.log("rotation", rotation);
    console.log("position", position);
  }, [rotation, position]);


  const modelHeight = 1; // Assuming the model height is 1 unit
  const gridBoundary = calculateGridBoundary(gridSize);

  const updateBoundingBox = (object) => {
    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    return { box, size, center };
  };

  const [dragControlsEnabled, setDragControlsEnabled] = useState(true);

  const onDrag = (event) => {
    if (!event.object) return;

    setDragControlsEnabled(false);
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, planeIntersect);


    const delta = new THREE.Vector3().subVectors(planeIntersect, lastPosition.current);
    const speed = 0.5; // Justera hastigheten här

    const inverseRotationMatrix = new THREE.Matrix4().makeRotationY(-currentRotation);
    delta.applyMatrix4(inverseRotationMatrix);

    const newPosition = new THREE.Vector3().copy(event.object.position).add(delta.multiplyScalar(speed));

    // Begränsa den nya positionen inom gridens gränser
    newPosition.x = THREE.MathUtils.clamp(newPosition.x, gridBoundary.minX , gridBoundary.maxX + 10);
    newPosition.z = THREE.MathUtils.clamp(newPosition.z, gridBoundary.minZ , gridBoundary.maxZ + 10);
    newPosition.y = THREE.MathUtils.clamp(newPosition.y, gridBoundary.minY, 5);

    // Snappa till griden
    const snappedPosition = snapToGrid(newPosition, cellSize);

    // Snappa till andra modeller
    const snappedToModelsPosition = snapToOtherModels(snappedPosition, allModelsRef.current, id, modelHeight);

    const worldPosition = new THREE.Vector3();
    groupRef.current.localToWorld(worldPosition.copy(snappedToModelsPosition));

    // Kontrollera om modellen är i sophörnan
    const currentTrashCorner = trashCornerRef.current;
    const isInTrashCorner =
    worldPosition.x >= currentTrashCorner.x  - currentTrashCorner.size / 2 &&
    worldPosition.x <= currentTrashCorner.x  + currentTrashCorner.size / 2 &&
    worldPosition.z >= currentTrashCorner.z  - currentTrashCorner.size / 2 &&
    worldPosition.z <= currentTrashCorner.z  + currentTrashCorner.size / 2;


        // Begränsa den nya positionen inom modellens gränser
    console.log("position", event.object.position);

    if (isInTrashCorner) {
      // Ta bort modellen
      removeModel(id);
      return;
    }

    event.object.position.copy(snappedToModelsPosition);
    lastPosition.current.copy(planeIntersect);

    // Uppdatera modellens position i App-komponenten
    updateModelPosition(id, snappedToModelsPosition.toArray(),groupRef.current.rotation.y);
  };

  const onDragStart = (event) => {
    if (!event.object) return;
    raycaster.setFromCamera(mouse, camera);
    plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()), groupRef.current.position);
    raycaster.ray.intersectPlane(plane, planeIntersect);
    lastPosition.current.copy(planeIntersect);
  };

  const onDragEnd = (event) => {
    console.log(event.object);
    if (!event.object) return;
    const finalPosition = snapToGrid(event.object.position, cellSize);
    updateModelPosition(id, finalPosition.toArray(),groupRef.current.rotation.y);
    console.log("drag end pos", finalPosition);
    setDragControlsEnabled(true);
  };
  useEffect(() => {
    if (dragControlsEnabled) {
      // Skapa eller aktivera DragControls här
      
    } else {
      // Inaktivera DragControls här
    }
  }, [dragControlsEnabled]);

  useEffect(() => {
    if (groupRef.current) {
      const controls = new DragControls(groupRef.current.children, camera, gl.domElement);
      dragControlsRef.current = controls;

      controls.addEventListener('drag', onDrag);
      controls.addEventListener('dragstart', onDragStart);
      controls.addEventListener('dragend', onDragEnd);

      return () => {
        controls.removeEventListener('drag', onDrag);
        controls.removeEventListener('dragstart', onDragStart);
        controls.removeEventListener('dragend', onDragEnd);
        controls.dispose();
      };
    }
  }, [camera, gl, raycaster, mouse]);

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
  <group>
    <group ref={groupRef} dispose={null}>
      <mesh geometry={nodes.Plane.geometry} material={materials['Material.001']} scale={[3.6, 4, 1.6]} />
    </group>
  </group>
  );
}

useGLTF.preload(scenePath);





