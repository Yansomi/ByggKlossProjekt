/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.18 agab_block_800x800x800.gltf --transform 
Files: agab_block_800x800x800.gltf [1.41KB] > C:\Users\Hampu\OneDrive\Dokument\GitHub\ByggKlossProjekt\src\assets\agab_block_800x800x800-transformed.glb [1.65KB] (-17%)
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { nodes, materials } = useGLTF('/agab_block_800x800x800-transformed.glb')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes['800x800x800'].geometry} material={nodes['800x800x800'].material} />
    </group>
  )
}

useGLTF.preload('/agab_block_800x800x800-transformed.glb')
