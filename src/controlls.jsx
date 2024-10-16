import * as THREE from 'three';
import React from 'react';

function controller(ObjektPos, gridSize)
{
    const newPosition = new THREE.Vector3().copy(ObjektPos);
    const gridBoundary = calculateGridBoundary(gridSize);
    
    console.log("position controlls", newPosition);


    newPosition.x = THREE.MathUtils.clamp(newPosition.x, gridBoundary.minX, gridBoundary.maxX + 10);
    newPosition.z = THREE.MathUtils.clamp(newPosition.z, gridBoundary.minZ, gridBoundary.maxZ + 10);
    newPosition.y = THREE.MathUtils.clamp(newPosition.y, gridBoundary.minY, 20);

    return newPosition;
}

function calculateGridBoundary(gridSize) {
    return {
      minX: -gridSize / 2,
      maxX: gridSize / 2,
      minZ: -gridSize / 2,
      maxZ: gridSize / 2,
      minY: 0,
    };
  }
  export default controller;