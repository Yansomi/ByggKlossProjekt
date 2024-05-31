import React from 'react';
import { Model } from '../src/assets/Scene';

function ModelWrapper({ model, grid, updateModelPosition, removeModel, trashCorner, rotateModel }) {
  return (
    <React.Fragment>
      <Model
        id={model.id}
        position={model.position}
        grid={grid}
        updateModelPosition={updateModelPosition}
        removeModel={removeModel}
        trashCorner={trashCorner}
        rotation={model.rotation}
      />
      <button onClick={() => rotateModel(model.id)}>Rotate Model {model.id}</button>
    </React.Fragment>
  );
}

export default ModelWrapper;
