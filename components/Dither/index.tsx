/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import { FC, useEffect, useRef, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";

import { EffectComposer, Pixelation } from "@react-three/postprocessing";
import * as THREE from "three";

import styled from "styled-components";

const ThreeDiv = styled.div`
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100vw;
  height: 100vh;

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
  const [pixelationGranularity, setPixelationGranularity] = useState(0);
  const animationRef = useRef<number>(0);

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

  // Handle window resize and start animation
  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    // Start the pixelation animation
    const startTime = Date.now();
    const cycleDuration = 6000; // 4 seconds for a complete cycle (0 -> 100 -> 0)

    const updatePixelation = () => {
      const elapsed = Date.now() - startTime;
      const cycleProgress = (elapsed % cycleDuration) / cycleDuration;

      // Create a smooth sine wave that goes from 0 to 100 and back to 0
      const granularity = Math.sin(cycleProgress * Math.PI * 2) * 10 + 10;
      setPixelationGranularity(granularity);

      animationRef.current = requestAnimationFrame(updatePixelation);
    };

    updatePixelation();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [handleResize]);

  return (
    <>
      <ThreeDiv ref={containerRef}>
        <Canvas
          shadows
          camera={{ position: [0, 0, 8], fov: 45 }}
          gl={{
            alpha: false,
          }}
          onCreated={({ gl }) => {
            rendererRef.current = gl;
            gl.setClearColor(new THREE.Color("#ffffff"));
          }}
        >
          <ambientLight intensity={2} />
          <Center>
            <group scale={modelScale}>
              <TexturedPlane />
            </group>
          </Center>
          <OrbitControls
            enablePan={false}
            enableDamping={true}
            dampingFactor={0.005}
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
