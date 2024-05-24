/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.16 scene.gltf --transform 
Files: scene.gltf [3.18KB] > C:\Users\Hampu\OneDrive\Dokument\GitHub\ByggKlossProjekt\src\assets\scene-transformed.glb [8.78KB] (-176%)
Author: koyd (https://sketchfab.com/koyd)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/lego-brick-baf29903f6ed40d992b8838f58703c09
Title: Lego Brick
*/
import React, { useRef, useEffect,useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree, extend } from '@react-three/fiber';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import scenePath from '../assets/scene-transformed.glb';
import * as THREE from 'three';

extend({ DragControls });

export function Model(props) {
  const { nodes, materials } = useGLTF(scenePath);
  const groupRef = useRef();
  const dragControlsRef = useRef();
  const { camera, gl } = useThree();
  const [dragSpeed, setDragSpeed] = useState(0.01); // Initial hastighetsfaktor
  useEffect(() => {
    if (groupRef.current) {
      const controls = new DragControls(groupRef.current.children, camera, gl.domElement);
      dragControlsRef.current = controls;

      const distance = groupRef.current.position.distanceTo(camera.position);
       // Justera hastighetsfaktorn baserat på avståndet
       setDragSpeed(0.01 * distance);
      const onDrag = (event) => {
        const { movementX, movementY } = event;
        const speedX = movementX * dragSpeed;
        const speedY = movementY * dragSpeed;
        //event.object.position.x += speedX;
        //event.object.position.y += speedY;
        console.log("SpeedX", movementX,"SpeedY", movementY)
        if(event.object.position.y <= -1)
          {
            event.object.position.y = -1;
          }
      };

      const onDragStart = (event) => {
        console.log('Drag started', event);
        console.log("Position on start", event.object.position);
      };

      const onDragEnd = (event) => {
        console.log('Drag ended', event);
        console.log("Position on ended", event.object.position);
      };

      controls.addEventListener('drag', onDrag);
      controls.addEventListener('dragstart', onDragStart);
      controls.addEventListener('dragend', onDragEnd);

      // Cleanup event listeners on component unmount
      return () => {
        controls.removeEventListener('drag', onDrag);
        controls.removeEventListener('dragstart', onDragStart);
        controls.removeEventListener('dragend', onDragEnd);
        controls.dispose();
      };
    }
  }, [camera, gl]);

  return (
    <group ref={groupRef} {...props} dispose={null}>
      <mesh 
        geometry={nodes.Object_2.geometry}
        material={materials.LegoBrick1Mtl}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

useGLTF.preload(scenePath);
