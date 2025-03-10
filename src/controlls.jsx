import * as THREE from 'three';
import React from 'react';
import { mod } from 'three/examples/jsm/nodes/Nodes.js';

function controller(object, gridSize, models, id, cellSize,trashCornerRef,removeModel,selectedIds)
{
    const newPosition = new THREE.Vector3().copy(object.position);
    const gridBoundary = calculateGridBoundary(gridSize);
    let currentHight = 0;
    let removed = false;
    for(let i=0;i < models.length;i++){
      if(models[i].id === id){
        currentHight = models[i].position[1];
      }
    }
    newPosition.x = THREE.MathUtils.clamp(newPosition.x, gridBoundary.minX, gridBoundary.maxX + 10);
    newPosition.z = THREE.MathUtils.clamp(newPosition.z, gridBoundary.minZ, gridBoundary.maxZ + 10);
    newPosition.y = THREE.MathUtils.clamp(newPosition.y, gridBoundary.minY, 20);
    object.position.copy(newPosition);
    const snappedToGrid = snapToGrid(object,cellSize,models,id)
    if(!snappedToGrid) return;
    object.position.copy(snappedToGrid);

    const { snapped, snappedToModelsPosition } = snapToOtherModels(id,object, models, currentHight, selectedIds);
    if(!snapped){
      snappedToModelsPosition.y = 0;
    }
    const worldPosition = new THREE.Vector3();
    object.position.copy(snappedToModelsPosition);
    worldPosition.copy(object.position);
    const currentTrashCorner = trashCornerRef.current;

    const isInTrashCorner =
    worldPosition.x >= currentTrashCorner.x - currentTrashCorner.size / 2 &&
    worldPosition.x <= currentTrashCorner.x + currentTrashCorner.size / 2 &&
    worldPosition.z >= currentTrashCorner.z - currentTrashCorner.size / 2 &&
    worldPosition.z <= currentTrashCorner.z + currentTrashCorner.size / 2;

    if (isInTrashCorner) {
      removeModel(id);
      removed = true;
    }
    //const collisionPosition = collision(object, id, models);
    return {controllerPos:snappedToModelsPosition, removed:removed};
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

  function snapToGrid(object, cellSize,models,id) {
    const snappedPosition = object.position.clone();
    let xOnLenght = false;
    let cellDivider = 4;
    let widthModefier = 0;
    if(widthModefier < 0.3)
      {
        cellDivider = 8;
      }
    if(!object.children[0]) return;
    if(object.children[0].rotation.y > 3.13 && object.children[0].rotation.y < 3.15
      || object.children[0].rotation.y === 0)
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
    snappedPosition.x = snappedPosition.x ;
    snappedPosition.z = snappedPosition.z ;
    return snappedPosition;
  }

  function snapToOtherModels(id,object, models, currentHight,selectedIds) {
    if (!object) {
      return {snapped: false, snappedToModelsPosition: null}
    }
    let selcetedModelWidthModefier = 0;
    let selecterModelLenghtModefier = 0;
    models.forEach((models) => {
      if(models.id === id)
        {
          selcetedModelWidthModefier = models.widthModefier;
          selecterModelLenghtModefier = models.lengthModefier;
        }
    });
    const position = new THREE.Vector3().copy(object.position);
    let xOnLenght = false;
    let snapped = false;
    const onXthreshold = selecterModelLenghtModefier;
    const notOnXthreshold = selcetedModelWidthModefier;
    if(object.children[0].rotation.y > 3.13 && object.children[0].rotation.y < 3.15
      || object.children[0].rotation.y === 0)
      {
        xOnLenght = true;
      }
  
      else{
        xOnLenght = false;
      };
    // Snap to height first
    models.forEach((model) => {
      if(selectedIds.includes(model.id)) return;
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
  
      if (!selectedIds.includes(model.id) && shouldBeonTop) {
        const modelPos = new THREE.Vector3(...model.position);
        const modelHeight = model.higthModefier;
        let modelWidth = model.widthModefier;
        let modelLength = model.lengthModefier;

      
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
      else if(!selectedIds.includes(model.id) && !snapped){
        const modelPos = new THREE.Vector3(...model.position);
        let modelWidth = model.widthModefier;
        let modelLength = model.lengthModefier;
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
        }
      }
    });
    //ska egentligen kolla mellan andra modeller som är valda, men kollar med modelen som är i fråga istället, behövs ändras
    models.forEach((model) => {
      if(selectedIds.includes(model.id) && model.id != id){
        const modelPos = new THREE.Vector3(...model.position);
        let isModelRotated;
        if(model.rotation > 3.13 && model.rotation < 3.15
          || model.rotation === 0)
          {
            isModelRotated = true;
          }
      
          else{
            isModelRotated = false;
          };
        if(position.y >= modelPos.y){
          const modelHeight = model.higthModefier;
          let modelWidth = model.widthModefier;
          let modelLength = model.lengthModefier;
          if(xOnLenght ===true && isModelRotated === true){
            if (Math.abs(position.x - modelPos.x) < onXthreshold + modelLength && Math.abs(position.z - modelPos.z) < notOnXthreshold + modelWidth) {
              if(modelPos.y ===  position.y){
                position.y = (modelPos.y + modelHeight);
                snapped = true;
              }
              else{
                snapped = true;
              }
            }
          }
          else if(xOnLenght === false && isModelRotated === false){
            if (Math.abs(position.x - modelPos.x) < notOnXthreshold + modelWidth && Math.abs(position.z - modelPos.z) < onXthreshold + modelLength) {
              if(modelPos.y ===  position.y){
                position.y = (modelPos.y + modelHeight);
                snapped = true;
              }
              else{
                snapped = true;
              }
            }
          }
          else if(xOnLenght === true && isModelRotated === false){
            if (Math.abs(position.x - modelPos.x) < onXthreshold + modelWidth && Math.abs(position.z - modelPos.z) < notOnXthreshold + modelLength) {
              if(modelPos.y ===  position.y){
                position.y = (modelPos.y + modelHeight);
                snapped = true;
              }
              else{
                snapped = true;
              }
            }
          }
          else if(xOnLenght === false && isModelRotated === true){
            if (Math.abs(position.x - modelPos.x) < notOnXthreshold + modelLength  && Math.abs(position.z - modelPos.z) < onXthreshold + modelWidth) {
              if(modelPos.y ===  position.y){
                position.y = (modelPos.y + modelHeight);
                snapped = true;
              }
              else{
                snapped = true;
              }
            }
          }
        }
      }
    });
    return {snapped: snapped, snappedToModelsPosition: position};
  }

  function collision (object, id, models)
  {
    let ObjectRotated;
    let modelRotated;

    if(object.children[0].rotation.y > 3.13 && object.children[0].rotation.y < 3.15
      || object.children[0].rotation.y === 0)
      {
        ObjectRotated = true;
      }
    else{
      ObjectRotated = false;
      };

    models.forEach((model) =>{
      if(model.id != id){

        if(model.rotation > 3.13 && model.rotation < 3.15
          || model.rotation === 0)
          {
            modelRotated = true;
          }
      
          else{
            modelRotated = false;
          };


      }
    })
  }
  export default controller;