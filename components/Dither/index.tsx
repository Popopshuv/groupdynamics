/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import { memo, FC, useEffect, useRef, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center, Float } from "@react-three/drei";
import { PostProcessing, updateMouseState } from "./post-processing";
import { EnvironmentWrapper } from "./environment";
import * as THREE from "three";

import styled from "styled-components";

const ThreeDiv = styled.div`
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 60vw;
  height: 60vh;
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

const DemoName: FC = () => (
  <Info>
    <p>group dynamics</p>
    <a href="mailto:info@groupdynamics.net">info@groupdynamics.net</a>
  </Info>
);

/**
 * Main application component
 */
export default function Dither(): React.ReactElement {
  // Scene values (previously from Leva controls)
  const bgColor = "#ffffff";
  const intensity = 1.5;
  const highlight = "#066aff";

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [modelScale, setModelScale] = useState(3);

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

  // Mouse enter/leave handlers
  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    // Update canvas bounds for post-processing
    const rect = event.currentTarget.getBoundingClientRect();
    updateMouseState(true, undefined, {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    updateMouseState(false);
  }, []);

  // Set up resize handling
  useEffect(() => {
    // Initial check
    handleResize();

    // Add listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return (
    <>
      <ThreeDiv
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Canvas
          shadows
          camera={{ position: [0, 0, 3], fov: 45 }}
          gl={{
            alpha: false,
          }}
          onCreated={({ gl }) => {
            rendererRef.current = gl;
            gl.setClearColor(new THREE.Color(bgColor));
          }}
        >
          <Center>
            <group scale={modelScale}>
              <TexturedPlane />
            </group>
          </Center>
          <OrbitControls />
          <EnvironmentWrapper intensity={intensity} highlight={highlight} />
          <Effects />
        </Canvas>
      </ThreeDiv>
      <DemoName />
    </>
  );
}

/**
 * Post-processing effects wrapper component
 * Memoized to prevent unnecessary re-renders
 */
const Effects: FC = memo(() => <PostProcessing />);

/**
 * Textured plane component using groupd-meta.png
 */
function TexturedPlane(): React.ReactElement {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState(1);

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("/files/images/groupd-meta.png", (loadedTexture) => {
      setTexture(loadedTexture);

      // Get the actual image dimensions
      const image = loadedTexture.image;
      if (image) {
        const aspectRatio = image.width / image.height;
        setImageAspectRatio(aspectRatio);
      }
    });
  }, []);

  return (
    <mesh castShadow>
      <planeGeometry args={[imageAspectRatio, 1]} />
      <meshStandardMaterial
        map={texture}
        transparent={true}
        opacity={0.9}
        roughness={0.1}
        metalness={0.1}
      />
    </mesh>
  );
}
