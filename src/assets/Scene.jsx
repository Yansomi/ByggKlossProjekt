import React, { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
let glbPath1;
export function Model({ id, position, gridSize,rotation, allModels, modelRefs, glbPath, geometry, material,sceneRef}) {
  glbPath1 = glbPath;
  const { nodes, materials } = useGLTF(glbPath1);
  const allModelsRef = useRef(allModels);
  const groupRef = useRef();
  const scene = useThree();
  useEffect(() => {
    allModelsRef.current = allModels;
  }, [allModels]);
  useEffect(() => {
    // Lägg till referens till modelRefs när modellen skapas
    modelRefs.current = groupRef.current;
    sceneRef.current = scene.scene;
    // Ta bort referensen från modelRefs när komponenten unmountas
    return () => {
      delete modelRefs.current;
    };
  }, [id, modelRefs,sceneRef]);
  


  useEffect(() => {
    if (groupRef.current) {
      // Uppdatera modellens position och rotation
      groupRef.current.position.set(...position);
      groupRef.current.children[0].rotation.y = rotation;
      groupRef.current.userData.id = id;
    }
  }, [rotation, position]);

  const gridBoundary = calculateGridBoundary(gridSize);




 

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

export default Model;
