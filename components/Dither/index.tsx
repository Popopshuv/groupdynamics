/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import { FC, useEffect, useRef, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Center,
  MeshReflectorMaterial,
} from "@react-three/drei";

import { EffectComposer, Pixelation } from "@react-three/postprocessing";
import * as THREE from "three";

import styled from "styled-components";

const ThreeDiv = styled.div`
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100vw;
  height: 75vh;

  @media (max-width: 768px) {
    width: 90vw;
    height: 90vh;
  }

  canvas {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
  }
`;

const Info = styled.div`
  position: fixed;
  left: 20px;
  top: 20px;
  z-index: 2;
  color: #000;
  font-size: 12px;
  a {
    color: blue;
    text-decoration: none;
    font-size: 12px;
  }
`;

const SiteInfo: FC = () => (
  <Info>
    <p>group dynamics</p>
    <a href="mailto:info@groupdynamics.net">info@groupdynamics.net</a>
  </Info>
);

/**
 * Textured plane component using groupd-meta.png
 */
function TexturedPlane(): React.ReactElement | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      "/files/images/group-dynamics.png",
      (loadedTexture) => {
        setTexture(loadedTexture);
        setIsLoading(false);

        // Get the actual image dimensions
        const image = loadedTexture.image;
        if (image) {
          const aspectRatio = image.width / image.height;
          setImageAspectRatio(aspectRatio);
        }
      },
      undefined, // onProgress
      (error) => {
        console.error("Error loading texture:", error);
        setIsLoading(false);
      }
    );
  }, []);

  // Don't render anything while loading
  if (isLoading || !texture) {
    return null;
  }

  return (
    <>
      <mesh rotation={[0, 0.15, 0]}>
        <planeGeometry args={[imageAspectRatio, 1]} />

        <meshStandardMaterial
          map={texture}
          transparent={true}
          opacity={1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

/**
 * Main application component
 */
export default function Dither(): React.ReactElement {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [modelScale, setModelScale] = useState(3);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [canvasBounds, setCanvasBounds] = useState({ width: 0, height: 0 });
  const [pixelationGranularity, setPixelationGranularity] = useState(0);

  // Responsive adjustment handler for model scale
  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Calculate scale based on container size
      const minDimension = Math.min(containerWidth, containerHeight);
      const baseScale = minDimension / 800; // Much smaller scale factor
      setModelScale(Math.max(0.2, baseScale * 2)); // Smaller scale range
    }
  }, []);

  // Handle mouse movement
  const handleMouseMove = useCallback((event: MouseEvent) => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setMousePosition({ x, y });
      setCanvasBounds({ width: rect.width, height: rect.height });
    }
  }, []);

  // Handle window resize and mouse events
  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleResize, handleMouseMove]);

  // Calculate pixelation granularity based on mouse position
  useEffect(() => {
    if (canvasBounds.width === 0 || canvasBounds.height === 0) return;

    const centerX = canvasBounds.width / 2;
    const centerY = canvasBounds.height / 2;

    // Define the inner area where pixelation can occur (50vw x 50vh)
    const innerWidth = canvasBounds.width * 0.5; // 50vw
    const innerHeight = canvasBounds.height * 0.5; // 50vh

    // Calculate the bounds of the inner area
    const innerLeft = centerX - innerWidth / 2;
    const innerRight = centerX + innerWidth / 2;
    const innerTop = centerY - innerHeight / 2;
    const innerBottom = centerY + innerHeight / 2;

    // Check if mouse is within the inner area
    const isInInnerArea =
      mousePosition.x >= innerLeft &&
      mousePosition.x <= innerRight &&
      mousePosition.y >= innerTop &&
      mousePosition.y <= innerBottom;

    if (!isInInnerArea) {
      setPixelationGranularity(0);
      return;
    }

    // Calculate distance from center within the inner area
    const distanceFromCenter = Math.sqrt(
      Math.pow(mousePosition.x - centerX, 2) +
        Math.pow(mousePosition.y - centerY, 2)
    );

    // Use the inner area radius as the max distance
    const maxDistance = Math.sqrt(
      Math.pow(innerWidth / 2, 2) + Math.pow(innerHeight / 2, 2)
    );

    const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
    const newGranularity = (1 - normalizedDistance) * 100;
    setPixelationGranularity(newGranularity);
  }, [mousePosition, canvasBounds]);

  return (
    <>
      <ThreeDiv ref={containerRef}>
        <Canvas
          shadows
          camera={{ position: [0, 0, 4], fov: 45 }}
          gl={{
            alpha: false,
          }}
          onCreated={({ gl }) => {
            rendererRef.current = gl;
            gl.setClearColor(new THREE.Color("#ffffff"));
          }}
        >
          <ambientLight intensity={1} />
          <Center>
            <group scale={modelScale}>
              <TexturedPlane />
            </group>
          </Center>
          <OrbitControls
            minPolarAngle={Math.PI / 4} // 45 degrees from top
            maxPolarAngle={(Math.PI * 3) / 4} // 45 degrees from bottom
            minAzimuthAngle={-Math.PI / 4} // 45 degrees left
            maxAzimuthAngle={Math.PI / 4} // 45 degrees right
            enablePan={false}
          />
          <EffectComposer autoClear={false}>
            <Pixelation granularity={pixelationGranularity} />
          </EffectComposer>
        </Canvas>
      </ThreeDiv>
      <SiteInfo />
    </>
  );
}
