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

export function Model({ id, position, gridSize, cellSize, allModels, updateModelPosition, removeModel, trashCorner, rotation, setLastMovedModelId ,groupRef,dragControlsRef}) {
  const { nodes, materials } = useGLTF(scenePath);
  const { camera, gl, raycaster, mouse } = useThree();
  const plane = new THREE.Plane();
  const planeIntersect = new THREE.Vector3();
  const lastPosition = useRef(new THREE.Vector3());
  const allModelsRef = useRef(allModels);
  const trashCornerRef = useRef(trashCorner);
  useEffect(() => {
    allModelsRef.current = allModels;
  }, [allModels]);
  useEffect(() => {
    trashCornerRef.current = trashCorner;
  }, [trashCorner]);

/*   useEffect(() => {
    if (groupRef.current) {
      //groupRef.current.rotation.order = 'YXZ';
      //groupRef.current.rotation.y = currentRotation; // Ensure the model's rotation is set
      //groupRef.current.position.copy(currentPosition);
      //updateModelPosition(id, groupRef.current.position ,groupRef.current.rotation.y);
    }
  }, [currentRotation, currentPosition]); */

  useEffect(() => {

    groupRef.current.position.copy(new THREE.Vector3().fromArray(position));
    groupRef.current.rotation.y = rotation;
    console.log("position", groupRef.current.position);
    console.log("rotation", rotation);
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

/*     const inverseRotationMatrix = new THREE.Matrix4().makeRotationY(-groupRef.current.rotation.y);
    delta.applyMatrix4(inverseRotationMatrix); */

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

    if (isInTrashCorner) {
      // Ta bort modellen
      removeModel(id);
      return;
    }

    event.object.position.copy(snappedToModelsPosition);
    lastPosition.current.copy(planeIntersect);

    groupRef.current.position.copy(snappedToModelsPosition);
    // Uppdatera modellens position i App-komponenten
    console.log("position", event.object.position.toArray());
    updateModelPosition(id, groupRef.current.position.toArray(),groupRef.current.rotation.y);
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
    groupRef.current.position.copy(finalPosition);

    console.log("drag end pos", groupRef.current.position.toArray());
    //console.log("Rotation end", groupRef.current.rotation.y);
    console.log("id",id);

    updateModelPosition(id, groupRef.current.position.toArray(),groupRef.current.rotation.y);
    setLastMovedModelId(id);
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
      console.log("current groupRef", groupRef.current);
      const transformGroup = new THREE.Group();
      
/*       for(let i = 0;i < groupRef.current.children.length;i++)
      {
        console.log("group child", groupRef.current.children[i]);
        transformGroup.add(groupRef.current.children[i]);
      } */
/*       groupRef.current.children.forEach((child) => {
        console.log("Adding child to transformGroup:", child);
        transformGroup.add(child);
      }); */
      const controls = new DragControls(groupRef.current.children, camera, gl.domElement);
      //controls.transformGroup = transformGroup;
      /*const transformGroup = new THREE.Group();
      groupRef.current.children.forEach(child => transformGroup.add(child));
      const controls = new DragControls(transformGroup.children, camera, gl.domElement); */
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
  }, [camera, gl, groupRef, raycaster, mouse,]);

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


  useEffect(() => {
    if (groupRef.current) {
      console.log("GrouprefPos", groupRef.current.position);
    }
  }, [groupRef.current]);

  return (
  <group>
    <group ref={groupRef} dispose={null}>
      <mesh geometry={nodes.Plane.geometry} material={materials['Material.001']} scale={[3.6, 4, 1.6]} />
    </group>
  </group>
  );
}

useGLTF.preload(scenePath);