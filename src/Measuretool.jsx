import React, { useState, useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

function MeasureTool() {
  const { gl, scene, camera } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const [startPoint, setStartPoint] = useState(null); // För att hålla första punkten
  const [endPoint, setEndPoint] = useState(null);     // För att hålla andra punkten
  const [lines, setLines] = useState([]);             // För att hålla alla linjer
  const [distances, setDistances] = useState([]);     // För att hålla avstånden mellan punkterna

  const handleMouseMove = (event) => {
    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.current.setFromCamera(mouse.current, camera);
  };

  const handleMouseDown = (event) => {
    if (event.shiftKey && event.button === 0) {  // Kontrollera om Shift + vänster musknapp hålls nere
      raycaster.current.setFromCamera(mouse.current, camera);

      // Skapa en plan på y=0
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Y-planet
      const intersectPoint = new THREE.Vector3();

      raycaster.current.ray.intersectPlane(plane, intersectPoint);

      const pointOnPlane = new THREE.Vector3(intersectPoint.x, 0, intersectPoint.z);

      if (!startPoint) {
        // Sätt första punkten om ingen startpunkt finns
        setStartPoint(pointOnPlane);
      } else {
        // Sätt slutpunkten och rita en linje från start till slut
        setEndPoint(pointOnPlane);
        drawLine(startPoint, pointOnPlane);

        // Nästa linje ska börja från den nuvarande slutpunkten
        setStartPoint(pointOnPlane);
      }
    }
  };

  const drawLine = (start, end) => {
    // Skapa en ny linje från start till slut
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const points = [start, end];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const newLine = new THREE.Line(geometry, material);
    scene.add(newLine);

    setLines((prevLines) => [...prevLines, { line: newLine, start, end }]); // Lägg till linjen med start- och slutpunkt

    // Beräkna avståndet mellan punkterna (bara i X och Z)
    const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.z - start.z, 2)) / 2;
    setDistances((prevDistances) => [...prevDistances, { start, end, distance }]);
  };

  const handleKeyUp = (event) => {
    // Återställ allt om användaren trycker på Escape
    if (event.key === 'Escape') {
      lines.forEach(({ line }) => {
        scene.remove(line);
        line.geometry.dispose();  // Ta bort geometri
        line.material.dispose();  // Ta bort material
      });
      setLines([]);          // Rensa alla linjer
      setStartPoint(null);   // Återställ startpunkten
      setEndPoint(null);     // Återställ slutpunkten
      setDistances([]);      // Återställ alla avstånd
    }
  };

  useEffect(() => {
    // Lägg till muslyssnare
    gl.domElement.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      // Ta bort muslyssnare när komponenten unmountas
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startPoint, endPoint, lines]);

  return (
    <>
      {distances.map(({ start, end, distance }, index) => (
        <group key={index} position={[(start.x + end.x) / 2, 0.5, (start.z + end.z) / 2]}>
          <Text
            fontSize={0.5}
            color="black"
            anchorX="center"
            anchorY="middle"
            onUpdate={(self) => self.lookAt(camera.position)} // Se till att texten alltid riktas mot kameran
          >
            {distance.toFixed(2)} units
          </Text>
        </group>
      ))}
    </>
  );
}

export default MeasureTool;